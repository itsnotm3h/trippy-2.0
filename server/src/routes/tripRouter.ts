import { Router } from "express";
import { checkJWT } from "../middleware/auth";
import { identifyTripRole, identifyUser } from "../middleware/userAuth";
import {
  getTripById,
  getUserTrips,
  updateTripSetting,
} from "../controllers/TripController";

const tripRouter = Router();

tripRouter.use(checkJWT, identifyUser);
tripRouter.get("", getUserTrips); //Trip endpoints

// tripRouter.use(identifyTripRole); // Endpoint below requires user role in the trip
tripRouter.param("tripId", identifyTripRole); // This will use the middleware whenever t
tripRouter.get("/:tripId", getTripById); //Get Trip's information
tripRouter.patch("/update/:tripId", updateTripSetting); //Only the leader can edit the trip setting.

export default tripRouter;
