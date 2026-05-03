import {
  EXPENSE_TYPE,
  ExpensesCreateType,
} from "@/validators/expenses.validator";
import { ExpensesRepositry } from "./ExpensesRepository";
import { Transaction } from "sequelize";
import sequelize from "@/config/db";
import { expenseShareService } from "../ExpenseShare/ExpenseShareService";
import Trip from "../Trips/trip.model";
import { TRIP_TYPE } from "@/validators/trip.validator";

export const ExpensesService = {
  getAllExpenses: async (tripId: number) => {
    return await ExpensesRepositry.getAllExpenses(tripId);
  },
  createExpense: async (newExpense: ExpensesCreateType, txn?: Transaction) => {
    try {
      //Check if the trip exist with the id and type.
      const trip = await Trip.findOne({
        where: { tripId: newExpense.tripId },
      });

      if (!trip) throw new Error("Trip does not exist.");

      if (
        trip.type === TRIP_TYPE.SOLO &&
        newExpense.type === EXPENSE_TYPE.GROUP
      )
        throw new Error("A solo trip cannot have group expenses");

      //The expense date can be before or after the trip as when u buy your flights and accomodation before the trip.

      //Start transaction to update Expense and ExpenseShare.
      await sequelize.transaction(async (txn) => {
        //Create new Entry in expense table.
        const expense = await ExpensesRepositry.createExpense(newExpense, txn);

        console.log("Expense Created");

        if (
          newExpense.type === EXPENSE_TYPE.GROUP &&
          newExpense.share.length > 0
        ) {
          const expenseShare =
            await expenseShareService.bulkcreateShareExpenses(
              {
                share: newExpense.share,
                expenseId: expense.expenseId,
              },
              txn,
            );

          console.log("Expense Share Created");

          return expenseShare;
        }
      });
    } catch (error: any) {
      console.log(error.message);
    }
  },
};
