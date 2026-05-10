import {
  EXPENSE_TYPE,
  ExpensesCreateType,
  ExpenseType,
  ExpenseUpdateType,
} from "@/validators/expenses.validator";
import { ExpensesRepository } from "./ExpensesRepository";
import sequelize from "@/config/db";
import Trip from "../Trips/trip.model";
import { TRIP_TYPE } from "@/validators/trip.validator";
import { expenseShareService } from "../ExpenseShare/expenseShareService";
import Expenses from "./expenses.model";
import { SharingUpdateType } from "@/validators/expenseShare.validator";
import ExpenseShare from "../ExpenseShare/expenseShare.model";

export const ExpensesService = {
  getAllExpenses: async (tripId: number) => {
    return await ExpensesRepository.getAllExpenses(tripId);
  },
  createExpense: async (newExpense: ExpensesCreateType) => {
    try {
      //Check if the trip exist with the id and type.
      const { share, type, tripId } = newExpense;
      const trip = await validateTripExists(tripId);

      validateCreateExpenseRequest(trip.type, type);

      //Start transaction to update Expense and ExpenseShare.
      const expense = await sequelize.transaction(async (txn) => {
        console.log("Start of transaction.....");

        const expense = await ExpensesRepository.createExpense(newExpense, txn);

        console.log("Expense Created");

        if (type === EXPENSE_TYPE.GROUP && share.length > 0) {
          await expenseShareService.bulkcreateShareExpenses(
            {
              share: share,
              expenseId: expense.expenseId,
            },
            tripId,
            txn,
          );
        }

        console.log("Expense Share Created");

        return expense.expenseId;
      });

      return {
        message: `Expense id:${expense} is created for trip id: ${tripId}`,
      };
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  },

  updateExpense: async (newExpense: ExpenseUpdateType) => {
    try {
      //Check if the trip exist with the id and type.
      const { share, type, tripId, expenseId, ...others } = newExpense;

      const trip = await validateTripExists(tripId);
      const expense = await validateExpenseExist(expenseId);

      validateUpdateExpenseRequest(trip.type, expense.type);

      const list = await generateSharingUpdateList(expense, newExpense);

      const result = await sequelize.transaction(async (txn) => {
        await expense.update({ ...others, type }, { transaction: txn });
        console.log("expense updated");

        if (list.create.length > 0) {
          await ExpenseShare.create({ ...list.create }, { transaction: txn });
          console.log("expenseShare new entry created");
        }
        if (list.update.length > 0) {
          await ExpenseShare.bulkCreate(list.update, {
            updateOnDuplicate: ["shareAmount"],
            transaction: txn,
          });
          console.log("expenseShare entry updated");
        }
        if (list.delete.length > 0) {
          await ExpenseShare.destroy({
            where: { shareId: list.delete },
            transaction: txn,
          });
          console.log("expenseShare entry deleted");
        }

        return expense.expenseId;
      });

      return {
        message: `Expense id:${result} is updated for trip id: ${tripId}`,
      };
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  },
};

/**
 * A Helper function to check if trip exist and return trip.
 * @param tripId the tripId from the params
 */
async function validateTripExists(tripId: number) {
  const trip = await Trip.findOne({
    where: { tripId },
  });

  if (!trip) throw new Error("Trip does not exist.");

  return trip;
}

/**
 * Ensure that the creation for request for solo trip is not a group expense.
 *
 * @param tripType from the current trip for updating.
 * @param type the expense type from the creation.
 */
function validateCreateExpenseRequest(tripType: string, type: string) {
  if (tripType == TRIP_TYPE.SOLO && type == EXPENSE_TYPE.GROUP)
    throw new Error("A solo trip cannot have group expenses");
}

/**
 * Ensure that the update request for solo trip is not a group expense.
 *
 * @param tripType from the current trip for updating.
 * @param newExpenseType from the request
 */
function validateUpdateExpenseRequest(
  tripType: string,
  newExpenseType: string,
) {
  if (newExpenseType === EXPENSE_TYPE.GROUP && tripType === TRIP_TYPE.SOLO) {
    throw new Error("A solo expense cannot be updated to a group expenses");
  }
}

/**
 * Returns a delete,create or update list for the ExpenseShare.
 *
 * @param tripType
 * @param newExpenseType
 */
async function generateSharingUpdateList(
  oldExpense: ExpenseType,
  newExpense: ExpenseUpdateType,
) {
  const list: {
    delete: number[];
    create: SharingUpdateType[];
    update: SharingUpdateType[];
  } = {
    delete: [],
    create: [],
    update: [],
  };
  // Solo trips cannot contain group expenses.

  if (newExpense == undefined || oldExpense == undefined) {
    throw new Error("The expense list cannot be null.");
  }

  const oldShareList = await ExpenseShare.findAll({
    where: { expenseId: oldExpense.expenseId },
  });

  //SOLO EXPENSE => GROUP EXPENSE
  // CREATE to ShareExpense.
  if (
    newExpense.type === EXPENSE_TYPE.GROUP &&
    oldExpense.type === EXPENSE_TYPE.SOLO
  ) {
    list.create.push(...newExpense.share);
  }

  //GROUP EXPENSE => SOLO EXPENSE.
  // DELETE ALL ShareExpense.
  else if (
    newExpense.type === EXPENSE_TYPE.SOLO &&
    oldExpense.type === EXPENSE_TYPE.GROUP
  ) {
    list.delete.push(...oldShareList.map((item) => item.shareId));
  }

  //GROUP EXPENSE => GROUP EXPENSE
  // 1. UPDATE expense Details.
  // 2. Compare current sharedlist and previous sharedlist. Will need to delete and ADD shareExpense accordingly
  else if (
    newExpense.type === EXPENSE_TYPE.GROUP &&
    oldExpense.type === EXPENSE_TYPE.GROUP
  ) {
    // Find shares that exist in both lists by userId
    list.update.push(
      ...newExpense.share.filter((n) =>
        oldShareList.some((o) => o.userId === n.userId),
      ),
    );

    // In new but not in old → create
    list.create.push(
      ...newExpense.share.filter(
        (n) => !oldShareList.some((o) => o.userId === n.userId),
      ),
    );

    // In old but not in new → delete
    const deleteList = oldShareList
      .filter((o) => !newExpense.share.some((n) => n.userId === o.userId))
      .map((item) => item.shareId);

    list.delete.push(...deleteList);
  }

  return list;
}

async function validateExpenseExist(expenseId: number) {
  if (expenseId == null) throw new Error("ExpenseId is required");
  const expense = await Expenses.findOne({ where: { expenseId } });
  if (!expense) throw new Error("Expense does not exist.");
  return expense;
}
