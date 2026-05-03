import { UserInfo } from "@/validators/user.validators";
import { NOTIFICATION_TYPE } from "@/validators/notification.validators";
import { TripMemberService } from "../TripMembers/TripMemberService";
import { TripRepository } from "./TripRepository";
import { TripEditType } from "@/validators/trip.validator";
import { Expenses, sequelize, Trip } from "..";
import { NotificationService } from "../Notifications/NotificationService";

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

        //This is to create notification
        await NotificationService.createNotification(
          {
            tripId: trip.tripId,
            userId: userInfo.userId,
            type: NOTIFICATION_TYPE.INFO,
            message: `${userInfo.displayName} you have created the trip ${trip.title}`,
            isRead: false,
          },
          t,
        );

        console.log("Trip has been created");

        //Creation of tripMembers
        if (trip.type === "GROUP" && newTrip.tripMemberList) {
          const validMemberList = await TripMemberService.bulkCreateTripMembers(
            {
              tripMemberList: newTrip.tripMemberList,
              tripId: trip.tripId,
              invitedBy: userInfo.userId,
            },
            t,
          );

          console.log("TripMembers has been created");

          //update Notification Table.
          await NotificationService.bulkCreateTripMemberNotification(
            {
              list: validMemberList,
              displayName: userInfo.displayName,
              tripTitle: trip.title,
              tripId: trip.tripId,
            },
            t,
          );

          console.log("Trip Notification has been created.");

          return { message: "New trip created successfully" };
        }

        return trip;
      });
    } catch (error: any) {
      console.log(error.message);
    }
  },
};
