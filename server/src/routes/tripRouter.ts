import { Router } from "express";
import { checkJWT } from "../middleware/auth";
import { identifyTripRole, identifyUser } from "../middleware/userAuth";
import {
  createTrip,
  getTripById,
  getUserTrips,
  updateTrip,
} from "@/models/Trips/TripController";

const tripRouter = Router();

tripRouter.use(checkJWT, identifyUser);
tripRouter.get("", getUserTrips); //Trip endpoints
tripRouter.post("", createTrip); // Create Trip

tripRouter.param("tripId", identifyTripRole); // This will use the middleware whenever the params has tripId.
tripRouter.get("/:tripId", getTripById); //Get Trip information.
tripRouter.patch("/update/:tripId", updateTrip); //Only the leader can edit the trip setting.

export default tripRouter;
