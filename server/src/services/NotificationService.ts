import { NotificationRepositry } from "@/repositories/NotificationRepository";
import { NotificationType } from "@/validators/Notification.validators";
import { TripMemberListType } from "@/validators/tripMembers.validator";
import { Transaction } from "sequelize";

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
  
  bulkCreateTripMemberNotification: async (request: {
        notificationList: any[];
        invitedBy: number;
        tripId: number;
      },
      txn?: Transaction) => {
    try {

      const validList = await Promise.all(
      //Find a member in the user list, if does not exist it will create a dummy user.
      request.notificationList?.map(async (data: any) => {

      
      })

      
      //return await NotificationRepositry.createNotification(data, txn);
    } catch (error: any) {
      console.log(error.message);
    }
  },
};
