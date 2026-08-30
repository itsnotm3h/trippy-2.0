import z, { email } from "zod";

export const TripMemberSchema = z.object({
  tripId: z.number(),
  userId: z.number(),
  status: z.string(),
});

export const UpdateTripMemberSchema = z.object({
  email: z.string(),
  status: z.enum(["DECLINED", "ACCEPTED", "INVITED","REMOVED"]),
});

export const TripMemberFormSchema = z.object({
  email: z.string(),
  status: z.enum(["DECLINED", "ACCEPTED", "INVITED","REMOVED"]),
});

export const TripMemberList = z.array(TripMemberSchema);

export type TripMemberListType = z.infer<typeof TripMemberList>;
export type TripMemberListUpdateType = z.infer<typeof UpdateTripMemberSchema>;
export type TripMemberType = z.infer<typeof TripMemberSchema>;

export type TripMemberFormType = z.infer<typeof TripMemberFormSchema>;
