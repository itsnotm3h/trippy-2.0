import { UserInfo } from "@/validators/user.validators";
import { NOTIFICATION_CASE, NOTIFICATION_TYPE } from "@/validators/notification.validators";
import { TripMemberService } from "../TripMembers/TripMemberService";
import { TripRepository } from "./TripRepository";
import { TRIP_TYPE, TripEditType } from "@/validators/trip.validator";
import { Expenses, sequelize, Trip, TripMembers } from "..";
import { NotificationService } from "../Notifications/NotificationService";
import { AppError } from "@/utils/AppError";
import { Transaction } from "sequelize";
import { TripMemberRepository } from "../TripMembers/TripMemberRepository";

export const TripService = {
  getAllTrips: async (userId: number, search: string) => {
    return await TripRepository.findAll(userId, search);
  },
  getTripById: async (tripId: number) => {
    return await TripRepository.findByTripId(tripId);
  },
  updateTrip: async (tripId: number, edits: TripEditType, userInfo: UserInfo) => {
    const trip = await Trip.findByPk(tripId);
    if (!trip) throw new Error("Trip does not exist");

    //Check if there is any expense created in the trip, before allowing changes.
    if (edits.type !== trip.type && edits.type) {
      const expense = await Expenses.findOne({
        where: {
          tripId,
        },
      });

      //Need to update the invitationList

      if (expense !== null)
        throw new AppError("The trip has expenses, unable to change trip type", 404);

    }

    return await sequelize.transaction(async (t) => {

      const [affectedRows] = await TripRepository.updateTrip(tripId, edits, t);

      if (edits.type == "GROUP" && edits.tripMemberList) {

        console.log("start creating notification")
        const userList = await TripMemberService.upsertTripMember({ inviteList: edits.tripMemberList, tripId, invitedBy: userInfo.userId, txn: t });

        await NotificationService.bulkCreateTripMemberNotification(
          {
            list: userList,
            displayName: userInfo.displayName,
            tripId: trip.tripId,
          },
          t,
        );
      }
      console.log("Trip Setting:", affectedRows == 0 ? "No fields are updated " : `Trip with id:${tripId} has been edited`);

      return ({ message: "Trip has been successfully edited." });
    })

  },

  createTrip: async (newTrip: TripEditType, userInfo: UserInfo) => {
    try {
      const tripId = await sequelize.transaction(async (t) => {
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
            message: `you have created the trip ${trip.title}`,
            isRead: false,
          },
          t,
        );

        console.log("Trip has been created");

        //Creation of tripMembers
        if (trip.type === "GROUP" && newTrip.tripMemberList) {
          await TripMemberService.bulkCreateTripMembers(
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
              list: newTrip.tripMemberList,
              displayName: userInfo.displayName,
              tripId: trip.tripId,
            },
            t,
          );

          console.log("Trip Notification has been created.");
          console.log("New trip created successfully");
        }

        return trip.tripId;
      });

      return { tripId };
    } catch (error: any) {
      console.log(error.message);
    }
  },
  deleteTrip: async (tripId: number, displayName:string) => {
    try {
      const deleteResult = await sequelize.transaction(async (t) => {

        const trip = await Trip.findOne({ where: { tripId }, transaction: t })
        if (!trip) throw new AppError("Trip does not exist", 404);

        await trip.update({isDelete:true},{transaction:t});
        console.log("Trip has been deleted");
        
        if(trip.type==TRIP_TYPE.GROUP){
          const memberList = await TripMembers.findAll({where:{tripId}});
          
          await NotificationService.bulkNotification({
            list:memberList,
            type:NOTIFICATION_CASE.DELETE_TRIP,
            displayName:displayName,
            tripId
          },t)

          console.log("Trip delete notification created!");
        }

        return {message:"Trip has been deleted successfully."};
      })
      
      return deleteResult;

    } catch (error: any) {
      console.log(error.message);

    }

  }
};
