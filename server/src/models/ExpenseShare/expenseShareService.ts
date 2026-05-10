import { SharingListType } from "@/validators/expenseShare.validator";
import { Transaction } from "sequelize";
import ExpenseShare from "./expenseShare.model";
import TripMembers, {
  INVITE_STATUS_TYPE,
} from "../TripMembers/tripMembers.model";

export const expenseShareService = {
  createShareExpense: async (
    data: {
      userId: number;
      shareAmount: number;
      expenseId: number;
    },
    tripId: number,
    txn?: Transaction,
  ) => {
    const exist =
      (await TripMembers.count({
        where: {
          userId: data.userId,
          tripId,
          status: INVITE_STATUS_TYPE.ACCEPTED,
        },
      })) == 1;

    if (!exist) throw new Error(`user with id:${data.userId} does not exist.`);
    

    return await ExpenseShare.create({ ...data }, { transaction: txn });
  },
  bulkcreateShareExpenses: async (
    data: {
      share: SharingListType;
      expenseId: number;
    },
    tripId: number,
    txn: Transaction,
  ) => {
    const validateList = await Promise.all(
      data.share.map(async (item) => {
        //Need to check and ensure that the user is a tripmemeber and has accepted the invite.
        const exist =
          (await TripMembers.count({
            where: {
              userId: item.userId,
              tripId: tripId,
              status: INVITE_STATUS_TYPE.ACCEPTED,
            },
          })) == 1;

        if (!exist)
          throw new Error(`user with id:${item.userId} does not exist.`);
        return { ...item, expenseId: data.expenseId };
      }),
    );

    return await ExpenseShare.bulkCreate(validateList, { transaction: txn });
  },
};
