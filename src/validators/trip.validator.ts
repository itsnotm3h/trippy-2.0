import { z } from "zod";
import countries from "i18n-iso-countries";
import BigNumber from "bignumber.js";
import { TripMemberFormSchema } from "./tripMembers.validator";
import dayjs from "dayjs";

export enum TRIP_TYPE {
  SOLO = "SOLO",
  GROUP = "GROUP",
}

export const TripIdSchema = z.object({
  tripId: z.coerce.number(),
});

export const UserIdSchema = z.object({
  userId: z.coerce.number(),
});

//title: Cannot have weird scripts or too long.
//type: number either SOLO or GROUP.
//country: Check that country is valid.
//startDate and endDate: start can never be later than end date.
export const TripSchema = z.object({
  // tripId: z.coerce.number(),
  title: z
    .string()
    .min(5, "INVALID_TITLE_LENGTH_SHORT")
    .max(150, "INVALID_TITLE_LENGTH_LONG"),
  type: z.enum(TRIP_TYPE),
  country: z
    .string()
    .length(2, "INVALID_LENGTH")
    .transform((val) => val.toUpperCase())
    .refine(
      (val) => {
        return countries.isValid(val);
      },
      { message: "INVALID_COUNTRY_CODE" },
    ),
  tripMemberList: z.array(TripMemberFormSchema).nullable(),
  leaderId: z.coerce.number(),
  currencyRate: z.coerce.number()
    .positive("NEGATIVE_VALUE")
    .refine(
      (val) => {
        return new BigNumber(val).isFinite();
      },
      { message: "INVALID_RATE" },
    ).transform((val) => {
      return Number(new BigNumber(val).toFixed(3))
    }),
  startDate: z.coerce.date().transform((val)=>{
    return dayjs(val).format("YYYY-MM-DD")
  }),
  endDate: z.coerce.date().transform((val)=>{
    return dayjs(val).format("YYYY-MM-DD")
  }),
  isActive: z.boolean("INVALID_VALUE"),
  isDeleted: z.boolean("INVALID_VALUE"),
});

export const PartialTripEditsSchema = TripSchema.partial()
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        if(data.startDate == data.endDate) return true;
        
        return data.startDate < data.endDate;
      }
      return true;
    },
    { message: "START_DATE_LATER" },
  );


  export const DeleteTripSchema = z.object({
    tripId:z.number(),
  })

export type TripEditType = z.infer<typeof PartialTripEditsSchema>;
export type TripType = z.infer<typeof TripSchema>;
