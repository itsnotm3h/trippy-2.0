import z from "zod";
import { SharingList } from "./expenseShare.validator";

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

export const ExpensesSchema = z.object({
  tripId: z.coerce.number(),
  payerId: z.coerce.number(),
  amount: z.number().refine((val) => /^\d+(\.\d{1,3})?$/.test(String(val)), {
    message: "Number must have at most 3 decimal places",
  }),
  description: z
    .string()
    .min(10, "Description cannot be less than 10 chars")
    .max(50, "Description cannot be more than 50 chars"),
  comments: z
    .string()
    .min(10, "Description cannot be less than 10 chars")
    .max(50, "Description cannot be more than 50 chars")
    .optional(),
  category: z.enum(EXPENSE_CATEGORY),
  type: z.enum(EXPENSE_TYPE),
  share: z.array(SharingList),
  expenseDate: z.string(),
});

export type ExpensesCreateType = z.infer<typeof ExpensesSchema>;
