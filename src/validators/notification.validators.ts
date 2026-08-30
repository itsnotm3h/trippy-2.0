import z from "zod";

export enum NOTIFICATION_TYPE {
  INVITE = "INVITE",
  INFO = "INFO",
  NEWUSER = "NEWUSER",
}
export enum NOTIFICATION_CASE {
  CREATE_TRIP = "CREATE_TRIP",
  CREATE_EXPENSE = "CREATE_EXPENSE",
  DELETE_TRIP = 'DELETE_TRIP',
  EDIT_TRIP = "EDIT_TRIP",
  EDIT_EXPENSE = "EDIT_EXPENSE",
}

export const NotificationSchema = z.object({
  tripId: z.coerce.number().optional(),
  userId: z.coerce.number(),
  type: z.enum(["INFO", "INVITE", "NEWUSER"]),
  message: z.string(),
  isRead: z.boolean(),
});

export type NotificationType = z.infer<typeof NotificationSchema>;
