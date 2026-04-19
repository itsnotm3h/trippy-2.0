import { NotificationRepositry } from "@/repositories/NotificationRepository";
import { NotificationType } from "@/validators/Notification.validators";
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
};
