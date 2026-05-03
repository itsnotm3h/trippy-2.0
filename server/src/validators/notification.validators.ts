import z from "zod";

export enum NOTIFICATION_TYPE {
  INVITE = "INVITE",
  INFO = "INFO",
  NEWUSER = "NEWUSER",
}

export const NotificationSchema = z.object({
  tripId: z.coerce.number().optional(),
  userId: z.coerce.number(),
  type: z.enum(["INFO", "INVITE", "NEWUSER"]),
  message: z.string(),
  isRead: z.boolean(),
});

export type NotificationType = z.infer<typeof NotificationSchema>;
