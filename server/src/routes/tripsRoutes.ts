import { Router } from "express";
import { getTrips } from "../controller/tripController";

const router = Router();

router.get("/",getTrips);

export default router;

