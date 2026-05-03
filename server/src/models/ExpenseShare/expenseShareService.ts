import { SharingListType } from "@/validators/expenseShare.validator";
import { Transaction } from "sequelize";
import Users from "../User/users.model";
import ExpenseShare from "./expenseShare.model";

export const expenseShareService = {
  bulkcreateShareExpenses: async (
    data: {
      share: SharingListType;
      expenseId: number;
    },
    txn: Transaction,
  ) => {
    const validateList = await Promise.all(
      data.share.map(async (item) => {
        const exist =
          (await Users.count({ where: { userId: item.userId } })) > 0;

        if (!exist)
          throw new Error(`user with id:${item.userId} does not exist.`);
        return { ...item, expenseId: data.expenseId };
      }),
    );

    return await ExpenseShare.bulkCreate(validateList, { transaction: txn });
  },
};
