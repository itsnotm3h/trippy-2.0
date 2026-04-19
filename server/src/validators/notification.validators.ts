import z from "zod";

export const NotificationSchema = z.object({
  tripId: z.coerce.number(),
  userId: z.coerce.number(),
  type: z.enum(["INFO", "INVITE"]),
  message: z.string(),
  isRead: z.boolean(),
});

export type NotificationType = z.infer<typeof NotificationSchema>;
