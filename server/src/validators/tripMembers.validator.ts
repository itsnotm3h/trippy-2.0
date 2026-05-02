import z, { email } from "zod";

export const TripMemberSchema = z.object({
  tripId: z.number(),
  userId: z.number(),
  status: z.enum(["DECLINED", "ACCEPTED", "PENDING"]),
});

export const TripMemberFormSchema = z.object({
  email: z.string(),
});

export const TripMemberList = z.array(TripMemberSchema);

export type TripMemberListType = z.infer<typeof TripMemberList>;
export type TripMemberType = z.infer<typeof TripMemberSchema>;

export type TripMemberFormType = z.infer<typeof TripMemberFormSchema>;
