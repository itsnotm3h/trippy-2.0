import { sequelize, Trip } from "@/models";
import { TripMemberListType } from "../validators/tripMembers.validator";
import { TripMemberRepository } from "@/repositories/TripMemberRepository";
import { NotificationRepositry } from "@/repositories/NotificationRepository";

const finalMessage = {
  PENDING: (invite: any) =>
    `${invite.displayName} You are invited to join ${invite.tripTitle}`,
  ACCEPTED: (invite: any) => `You have accepted to ${invite.tripTitle}`,
  REJECTED: (invite: any) =>
    `You have rejected the invitation to join ${invite.tripTitle}`,
} as const;

export const TripMemberService = {
  upsertTripMember: async (inviteList: TripMemberListType, displayName:string) => {
    const finalResult = {
      successList: [] as number[],
      failedIdList: [] as { userId: number; error: string }[],
    };

    if (inviteList.length <= 0)
      throw new Error("invitation list cannot be empty");

    const currentTrip = await Trip.findByPk(inviteList[0].tripId);

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
};
