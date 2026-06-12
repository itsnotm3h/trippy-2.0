import {
  EXPENSE_TYPE,
  ExpenseDeleteType,
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
import {
  SharingRequestType,
  SharingUpdateType,
} from "@/validators/expenseShare.validator";
import ExpenseShare from "../ExpenseShare/expenseShare.model";
import { TripMemberList } from "@/validators/tripMembers.validator";
import TripMembers, {
  INVITE_STATUS_TYPE,
} from "../TripMembers/tripMembers.model";
import Users, { STATUS_TYPE } from "../User/users.model";
import { Op, where } from "sequelize";

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

      if (expense.payerId != newExpense.payerId)
        throw new Error("You do not have the authority to edit this expense.");

      await validateTripMembers(tripId, share);
      validateUpdateExpenseRequest(trip.type, newExpense.type);

      const list = await generateSharingUpdateList(expense, newExpense);

      console.log(list);

      const result = await sequelize.transaction(async (txn) => {
        await expense.update(
          { ...others, expenseId, type },
          { transaction: txn },
        );
        console.log("expense updated");

        if (list.create.length > 0) {
          await ExpenseShare.bulkCreate(list.create, { transaction: txn });
          console.log("expenseShare new entry created");
        }
        if (list.update.length > 0) {
          await ExpenseShare.bulkCreate(list.update, {
            updateOnDuplicate: ["shareId", "userId", "expenseId"],
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

        return { expenseId: expense.expenseId, list };
      });

      return {
        message: `Expense id:${result.expenseId} is updated for trip id: ${tripId} with the following:
        ${JSON.stringify(result?.list)}`,
      };
    } catch (error: any) {
      console.log(error.message);
      throw error;
    }
  },
  deleteExpense: async (deleteExpense: ExpenseDeleteType) => {
    try {
      //Check if the trip exist with the id and type.
      const { tripId, expenseId, userId } = deleteExpense;

      await validateTripExists(tripId);
      const expense = await validateExpenseExist(expenseId);

      if (expense.payerId != userId)
        throw new Error(
          "You do not have the authority to delete this expense.",
        );

      //IF the expense type is a group expense get the sharelist.
      const shareList = await getShareList(expense);

      const result = await sequelize.transaction(async (txn) => {
        if (shareList.length > 0) {
          await ExpenseShare.destroy({
            where: { expenseId },
            transaction: txn,
          });
          console.log("expenseShare entry deleted");
        }

        await expense.destroy({ transaction: txn });
        console.log("expense deleted");

        return { expenseId: expense.expenseId, shareList };
      });

      return {
        message: `Expense id:${result.expenseId} is deleted for trip id: ${tripId} with the following shareExpenses:
        ${JSON.stringify(result?.shareList)}`,
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

async function validateTripMembers(tripId: number, share: any[]) {
  if (share.length == 0) return;

  const shareMembersId = share.map((item) => item.userId);

  const findActiveMembers = await Users.findAll({
    where: {
      userId: { [Op.in]: shareMembersId },
      status: STATUS_TYPE.ACTIVE,
    },
    include: {
      model: TripMembers,
      as: "tripMembers",
      required: true,
      where: {
        tripId: tripId,
        status: INVITE_STATUS_TYPE.ACCEPTED,
      },
      attributes: [],
    },
    attributes: ["userId"],
  });

  const found = findActiveMembers.map((u) => u.userId);
  const notFound = shareMembersId.filter((item) => !found.includes(item));

  if (notFound.length > 0)
    throw new Error(
      "Share includes member that is either inactive or is not a trip member.",
    );
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
    create: SharingRequestType[];
    update: SharingUpdateType[];
  } = {
    delete: [],
    create: [],
    update: [],
  };
  // Solo trips cannot contain group expenses.
  try {
    if (newExpense == undefined || oldExpense == undefined) {
      throw new Error("The expense list cannot be null.");
    }

    const oldShareList = await ExpenseShare.findAll({
      where: { expenseId: oldExpense.expenseId },
    });

    console.log(oldShareList);

    //SOLO EXPENSE => GROUP EXPENSE
    // CREATE to ShareExpense.
    if (
      newExpense.type === EXPENSE_TYPE.GROUP &&
      oldExpense.type === EXPENSE_TYPE.SOLO
    ) {
      const newExpenseWithId = newExpense.share.map((item) => {
        return {
          ...item,
          expenseId: newExpense.expenseId,
        };
      });

      list.create.push(...newExpenseWithId);
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
        ...newExpense.share
          .filter((n) => oldShareList.some((o) => o.userId === n.userId))
          .map((item) => ({
            ...item,
            shareId: oldShareList.find((oi) => oi.userId == item.userId)
              ?.shareId,
            expenseId: newExpense.expenseId,
          })),
      );

      // In new but not in old → create
      list.create.push(
        ...newExpense.share
          .filter((n) => !oldShareList.some((o) => o.userId === n.userId))
          .map((item) => ({ ...item, expenseId: oldExpense.expenseId })),
      );

      // In old but not in new → delete
      const deleteList = oldShareList
        .filter((o) => !newExpense.share.some((n) => n.userId === o.userId))
        .map((item) => item.shareId);

      list.delete.push(...deleteList);
    }

    return list;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

async function getShareList(expense: ExpenseType) {
  const { type, expenseId } = expense;

  if (type === EXPENSE_TYPE.SOLO) return [];

  return await ExpenseShare.findAll({
    where: {
      expenseId,
    },
  });
}

async function validateExpenseExist(expenseId: number) {
  if (expenseId == null) throw new Error("ExpenseId is required");
  const expense = await Expenses.findOne({ where: { expenseId } });
  if (!expense) throw new Error("Expense does not exist.");
  return expense;
}
