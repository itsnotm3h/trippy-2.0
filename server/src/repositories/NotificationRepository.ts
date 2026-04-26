import { Notifications } from "@/models";
import { NotificationType } from "@/validators/notification.validators";
import { Transaction } from "sequelize";

export const NotificationRepositry = {
  findUserNotification: async (userId: any) => {
    return await Notifications.findAll({ where: { userId } });
  },
  createNotification: async (
    data: NotificationType,
    txn?: Transaction | null,
  ) => {
    const { tripId, userId, type, message, isRead } = data;
    await Notifications.create({
      tripId,
      userId,
      type,
      message,
      isRead,
    });
  },
};
 