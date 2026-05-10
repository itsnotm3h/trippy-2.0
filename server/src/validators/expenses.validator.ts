import z from "zod";
import { SharingList, SharingListUpdate } from "./expenseShare.validator";

export enum EXPENSE_TYPE {
  SOLO = "SOLO",
  GROUP = "GROUP",
}

export enum EXPENSE_CATEGORY {
  SHOPPING = "SHOPPING",
  MISC = "MISC",
  ACTIVITIES = "ACTIVITIES",
  FOOD = "FOOD",
  TRANSPORT = "TRANSPORT",
  ACCOMODATION = "ACCOMODATION",
}

export const ExpensesCreateSchema = z
  .object({
    tripId: z.coerce.number(),
    payerId: z.coerce.number(),
    amount: z.number().refine((val) => /^\d+(\.\d{1,3})?$/.test(String(val)), {
      message: "Number must have at most 3 decimal places",
    }),
    description: z
      .string()
      .min(1, "Description cannot be less than 10 chars")
      .max(50, "Description cannot be more than 50 chars"),
    comments: z
      .string()
      .max(50, "Description cannot be more than 50 chars")
      .optional(),
    category: z.enum(EXPENSE_CATEGORY),
    type: z.enum(EXPENSE_TYPE),
    share: z.array(SharingList),
    expenseDate: z.string(),
  })
  .refine(
    (data) => {
      return data.share.find((item) => item.userId === data.payerId);
    },
    { message: "Payer must be included in the sharedList." },
  )
  .refine(
    (data) => {
      const totalShare = data.share.reduce(
        (acc, curr) => acc + curr.shareAmount,
        0,
      );
      return totalShare == data.amount;
    },
    { message: "Share amount must be equal to expense amount." },
  );

export const ExpensesUpdateSchema = ExpensesCreateSchema.safeExtend({
  expenseId: z.coerce.number(),
  share: z.array(SharingListUpdate),
});

export const ExpensesSchema = z.object({
  expenseId: z.coerce.number(),
  tripId: z.coerce.number(),
  payerId: z.coerce.number(),
  amount: z.number().refine((val) => /^\d+(\.\d{1,3})?$/.test(String(val)), {
    message: "Number must have at most 3 decimal places",
  }),
  description: z
    .string()
    .min(1, "Description cannot be less than 10 chars")
    .max(50, "Description cannot be more than 50 chars"),
  comments: z
    .string()
    .max(50, "Description cannot be more than 50 chars")
    .optional(),
  category: z.enum(EXPENSE_CATEGORY),
  type: z.enum(EXPENSE_TYPE),
  expenseDate: z.string(),
});

export type ExpenseType = z.infer<typeof ExpensesSchema>;
export type ExpensesCreateType = z.infer<typeof ExpensesCreateSchema>;
export type ExpenseUpdateType = z.infer<typeof ExpensesUpdateSchema>;
