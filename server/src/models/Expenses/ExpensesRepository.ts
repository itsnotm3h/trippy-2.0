import { ExpensesCreateType } from "@/validators/expenses.validator";
import Expenses from "./expenses.model";
import { Transaction } from "sequelize";

export const ExpensesRepositry = {
  getAllExpenses: async (tripId: number) => {
    return await Expenses.findAll({ where: { tripId }, logging: console.log });
  },
  createExpense: async (newExpense: ExpensesCreateType, t?: Transaction) => {
    return await Expenses.create(
      {
        ...newExpense,
      },
      { transaction: t },
    );
  },
};
