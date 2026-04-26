import { UserInfo } from "@/validators/user.validators";
import { Expenses, sequelize, Trip, TripMembers, Users } from "../models";
import { TripRepository } from "../repositories/TripRepository";
import { TripEditType } from "../validators/trip.validator";
import { TripMemberList } from "@/validators/tripMembers.validator";
import { TripMemberRepository } from "@/repositories/TripMemberRepository";
import { NotificationService } from "./NotificationService";
import { NOTIFICATION_TYPE } from "@/validators/notification.validators";

export const TripService = {
  getAllTrips: async (userId: number) => {
    return await TripRepository.findAll(userId);
  },
  getTripById: async (tripId: number) => {
    return await TripRepository.findByTripId(tripId);
  },
  updateTrip: async (tripId: number, edits: TripEditType) => {
    const trip = await Trip.findByPk(tripId);
    if (!trip) throw new Error("Trip does not exist");

    //Check if there is any expense created in the trip, before allowing changes.
    if (edits.type) {
      const expense = await Expenses.findOne({
        where: {
          tripId,
        },
      });

      if (expense !== null)
        throw new Error("The trip has expenses, unable to change trip type");
    }

    const [affectedRows] = await TripRepository.updateTrip(tripId, edits);

    if (affectedRows === 0) throw new Error("There is no updates.");

    return { message: "Successfully updated" };
  },
  createTrip: async (newTrip: TripEditType, userInfo: UserInfo) => {
    try {
      await sequelize.transaction(async (t) => {
        //Creation of trip
        const trip = await Trip.create(
          {
            ...newTrip,
          },
          { transaction: t },
        );

        const data = {
          tripId: trip.tripId,
          userId: userInfo.userId,
          type: NOTIFICATION_TYPE.INFO,
          message: `${userInfo.displayName}  you have created the trip ${trip.title}`,
          isRead: false,
        };

        await NotificationService.createNotification(data, t);

        //Creation of tripMembers
        if (trip.type === "GROUP" && newTrip.tripMemberList) {
          for (let invite of newTrip.tripMemberList) {
            //need to check if the users are in the list.
            const member = await Users.findOne({
              where: { email: invite.email },
            });

            if (!member)
              throw new Error(`User with email ${invite.email} not found`);

            await TripMembers.create(
              {
                tripId: trip.tripId,
                userId: member?.userId,
                status: "PENDING",
              },
              { transaction: t },
            );

            const data = {
              tripId: trip.tripId,
              userId: Number(member?.userId),
              type: NOTIFICATION_TYPE.INVITE,
              message: `${userInfo.displayName} has invited you to the trip ${trip.title}`,
              isRead: false,
            };

            await NotificationService.createNotification(data, t);
          }
        }

        return { message: "New trip created" };
      });
    } catch (error: any) {
      console.log(error.message);
    }
  },
};
