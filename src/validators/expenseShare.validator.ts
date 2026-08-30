import z from "zod";

export const SharingList = z.object({
  userId: z.coerce.number(),
  shareAmount: z.number(),
});

export const ShareRequestSchema = z.object({
  expenseId: z.coerce.number(),
  userId: z.coerce.number(),
  shareAmount: z.number(),
});

export const SharingListUpdate = z.object({
  shareId: z.coerce.number().optional(),
  expenseId: z.coerce.number().optional(),
  userId: z.coerce.number(),
  shareAmount: z.number(),
});

export const SharingListArraySchema = z.array(SharingList);

export type SharingListType = z.infer<typeof SharingListArraySchema>;

export type SharingRequestType = z.infer<typeof ShareRequestSchema>;

export type SharingUpdateType = z.infer<typeof SharingListUpdate>;
