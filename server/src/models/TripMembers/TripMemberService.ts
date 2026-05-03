import { sequelize, TripMembers, Users } from "@/models";
import {
  TripMemberFormType,
  TripMemberListType,
} from "@/validators/tripMembers.validator";
import { TripMemberRepository } from "./TripMemberRepository";
import { Transaction } from "sequelize";
import { STATUS_TYPE } from "../User/users.model";
import { INVITE_STATUS_TYPE } from "./tripMembers.model";

const finalMessage = {
  PENDING: (invite: any) =>
    `${invite.displayName} You are invited to join ${invite.tripTitle}`,
  ACCEPTED: (invite: any) => `You have accepted to ${invite.tripTitle}`,
  REJECTED: (invite: any) =>
    `You have rejected the invitation to join ${invite.tripTitle}`,
} as const;

export const TripMemberService = {
  upsertTripMember: async (
    inviteList: TripMemberListType,
    displayName: string,
  ) => {
    const finalResult = {
      successList: [] as number[],
      failedIdList: [] as { userId: number; error: string }[],
    };

    if (inviteList.length <= 0)
      throw new Error("invitation list cannot be empty");

    for (const invite of inviteList) {
      const { tripId, userId, status } = invite;
      try {
        await sequelize.transaction(async (t) => {
          await TripMemberRepository.upsertInvites({
            tripId,
            userId,
            status,
          });

          finalResult.successList.push(userId);
        });
      } catch (error: any) {
        finalResult.failedIdList.push({ userId, error: error.message });
        console.log(error.message);
      }
    }

    return finalResult;

    // use upsert, for service will loop through the list to update the trip members.
  },
  bulkCreateTripMembers: async (
    request: {
      tripMemberList: TripMemberFormType[];
      invitedBy: number;
      tripId: number;
    },
    txn?: Transaction,
  ) => {
    //Map the object for bulk approval.
    const validMemberList = await Promise.all(
      //Find a member in the user list, if does not exist it will create a dummy user.
      request.tripMemberList?.map(async (data: any) => {
        const [member, created] = await Users.findOrCreate({
          where: { email: data.email },
          defaults: {
            displayName: "-",
            password: "-",
            firstName: "-",
            lastName: "-",
            username: "-",
            authId: "-",
            email: data.email,
            invitedBy: request.invitedBy,
            status: STATUS_TYPE.PENDING,
          },
        });

        return {
          tripId: request.tripId,
          userId: Number(member.userId),
          status: INVITE_STATUS_TYPE.INVITED,
          isNew: created,
        };
      }),
    );

    await TripMembers.bulkCreate(
      validMemberList.map(({ isNew, ...rest }) => rest),
      { transaction: txn },
    );

    //Return object with isNew, so that it can be used in the notificationService,
    //to send email to new user for registration.

    return validMemberList;
  },
};
