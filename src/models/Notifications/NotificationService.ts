import { Notifications, Trip, Users } from "@/models";
import { NotificationRepositry } from "@/models/Notifications/NotificationRepository";
import {
  NOTIFICATION_CASE,
  NOTIFICATION_TYPE,
  NotificationType,
} from "@/validators/notification.validators";
import { Transaction } from "sequelize";
import { AppError } from "@/utils/AppError";
import { TripMemberFormType, TripMemberListType } from "@/validators/tripMembers.validator";
import { TRIP_TYPE } from "@/validators/trip.validator";

export const NotificationService = {
  getUserNotification: async (userId: number) => {
    try {
      return await NotificationRepositry.findUserNotification(userId);
    } catch (error: any) {
      console.log(error.message);
    }
  },
  createNotification: async (data: NotificationType, txn?: Transaction) => {
    try {
      return await NotificationRepositry.createNotification(data, txn);
    } catch (error: any) {
      console.log(error.message);
    }
  },

  bulkCreateTripMemberNotification: async (
    request: {
      list: TripMemberListType;
      displayName:string;
      tripId: number;
    },
    txn?: Transaction,
  ) => {
    try {

      const trip = await Trip.findByPk(request.tripId,{transaction:txn})

      if(!trip) throw new AppError ("Trip does not exist", 400);

      const membersList = await Promise.all(
        
        request.list.map(async (member) => {

        const user = await Users.findOne({where:{userId:member.userId},transaction:txn});

        if(!user) throw new AppError ("User does not exist", 400);

        return {
          tripId: request.tripId as number,
          userId: user.userId as number,
          type: member.status == "INVITED" ? NOTIFICATION_TYPE.INVITE : NOTIFICATION_TYPE.INFO,
          message: `${request.displayName} has ${member.status.toLowerCase()} you to the trip`,
          isRead: false,
        };
      }));


      return await Notifications.bulkCreate(membersList, {
        ignoreDuplicates: true,
        transaction: txn,
      });

    } catch (error: any) {
      console.log(error.message);
    }
  },
  bulkNotification: async (
    request: {
      list: any[];
      type:NOTIFICATION_CASE;
      displayName:string;
      tripId: number;
    },
    txn?: Transaction,
  ) => {
    try {

      const trip = await Trip.findByPk(request.tripId,{transaction:txn});

      if(!trip) throw new AppError("Trip does not exist", 400);
      
      const membersList = request.list.map((member) => {
        
      const {notificationType,message} = getNotificationDetails(request.type, member, trip, request.displayName);
        return {
          tripId: request.tripId as number,
          userId: member.userId as number,
          type: notificationType,
          message: message ,
          isRead: false,
        };
      });

      return await Notifications.bulkCreate(membersList, {
        ignoreDuplicates: true,
        transaction: txn,
      });

    } catch (error: any) {
      console.log(error.message);
    }
  },
};


/** Return messages and type to add in the notification table.**/
export function getNotificationDetails (type:NOTIFICATION_CASE, member:any, trip:any, displayName:string){

  const isLeader = member.userId == trip.leaderId;

  let notificationType = NOTIFICATION_TYPE.INFO;
  let message = "";

  
  if(type == NOTIFICATION_CASE.EDIT_TRIP || type == NOTIFICATION_CASE.CREATE_TRIP){
    
    const messageSnippet = type == NOTIFICATION_CASE.EDIT_TRIP ? "edited" : "created";

    if(trip.type == TRIP_TYPE.SOLO || isLeader ) message = `You have ${messageSnippet} the trip`;
    if(trip.type == TRIP_TYPE.GROUP) {
      message = `${displayName} has ${member.status.toLowerCase()} you ${member.status == "INVITED" ? "to" : "from"} the trip`
    }

    notificationType = NOTIFICATION_TYPE.INVITE;

  }

  if(type == NOTIFICATION_CASE.DELETE_TRIP){
    message = `${isLeader && trip.type==TRIP_TYPE.SOLO ? "You have": displayName} deleted the trip.`
  }

  if(type == NOTIFICATION_CASE.EDIT_EXPENSE || type == NOTIFICATION_CASE.CREATE_EXPENSE){
    

    const messageSnippet = type == NOTIFICATION_CASE.EDIT_EXPENSE ? "edited" : "added";
    // const isLeader = member.userId == trip.leaderId;

    // if(trip.type == TRIP_TYPE.SOLO || isPayer ) message = `You have ${messageSnippet} an expense for the trip.${trip.title}`;
    if(trip.type == TRIP_TYPE.SOLO) message = `You have ${messageSnippet} an expense for the trip.`;
    if(trip.type == TRIP_TYPE.GROUP) {
      message = `${displayName} has split an expense with you for the trip`
    }
  }


  return {notificationType, message}
}