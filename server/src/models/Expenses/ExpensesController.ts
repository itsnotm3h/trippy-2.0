import { AuthRequest, TRIP_ROLE } from "@/schema/authSchema";
import { Response } from "express";
import { ExpensesService } from "./ExpensesService";
import { TripIdSchema } from "@/validators/trip.validator";
import {
  ExpensesCreateSchema,
  ExpensesUpdateSchema,
} from "@/validators/expenses.validator";

export const getAllExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = TripIdSchema.parse(req.params);

    if (req.tripRole === TRIP_ROLE.NONE)
      res
        .status(401)
        .json({ message: "You are not authorise to view this trip" });

    const result = await ExpensesService.getAllExpenses(tripId);

    console.log(result);

    res.status(200).json(result);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const newExpenses = ExpensesCreateSchema.parse({
      ...req.body,
      tripId: req.params.tripId,
      payerId: req.dbUser.userId,
    });

    if (req.tripRole == TRIP_ROLE.NONE)
      res
        .status(401)
        .json({ message: "You are not authorise to view this trip" });

    const result = await ExpensesService.createExpense(newExpenses);

    res.status(200).json(result);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

export const updateExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const newExpenses = ExpensesUpdateSchema.parse({
      ...req.body,
      tripId: req.params.tripId,
      payerId: req.dbUser.userId,
    });

    if (req.tripRole == TRIP_ROLE.NONE)
      res
        .status(401)
        .json({ message: "You are not authorise to view this trip" });

    const result = await ExpensesService.updateExpense(newExpenses);

    res.status(200).json(result);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
