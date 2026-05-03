import { Router } from "express";
import { checkJWT } from "../middleware/auth";
import { identifyTripRole, identifyUser } from "../middleware/userAuth";
import {
  createExpenses,
  getAllExpenses,
} from "@/models/Expenses/ExpensesController";

const expensesRouter = Router();

expensesRouter.use(checkJWT, identifyUser);
expensesRouter.get("/:tripId", identifyTripRole, getAllExpenses); //Get expense information.
expensesRouter.post("/", identifyTripRole, createExpenses); //

export default expensesRouter;
