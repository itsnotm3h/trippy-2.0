import z from "zod";

export const SharingList = z.object({
  userId: z.coerce.number(),
  amount: z.coerce.number(),
});

export const SharingListArraySchema = z.array(SharingList);

export type SharingListType = z.infer<typeof SharingListArraySchema>;
