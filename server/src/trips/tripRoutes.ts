import { Router } from "express";
import { getTrips } from "./tripController";

const router = Router();

router.get("",getTrips);

export default router;

