import { Notifications } from "@/models";
import { NotificationRepositry } from "@/models/Notifications/NotificationRepository";
import {
  NOTIFICATION_TYPE,
  NotificationType,
} from "@/validators/notification.validators";
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

  bulkCreateTripMemberNotification: async (
    request: {
      list: any[];
      displayName: string;
      tripTitle: string;
      tripId: number;
    },
    txn?: Transaction,
  ) => {
    try {
      console.log(request.list);

      const invitationList = request.list.map((member) => {
        return {
          tripId: member.tripId,
          userId: member.userId,
          type: NOTIFICATION_TYPE.INVITE,
          message: `${request.displayName} has invited you to the trip ${request.tripTitle}`,
          isRead: false,
        };
      });

      return await Notifications.bulkCreate(invitationList, {
        transaction: txn,
      });
    } catch (error: any) {
      console.log(error.message);
    }
  },
};
