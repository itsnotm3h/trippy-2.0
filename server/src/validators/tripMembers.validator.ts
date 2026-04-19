import z from "zod";

export const TripMemberSchema = z.object({
  tripId: z.number(),
  userId: z.number(),
  status: z.enum(["REJECTED", "ACCEPTED", "PENDING"]),
});

export const TripMemberList = z.array(TripMemberSchema);

export type TripMemberListType = z.infer<typeof TripMemberList>;
export type TripMemberType = z.infer<typeof TripMemberSchema>;
