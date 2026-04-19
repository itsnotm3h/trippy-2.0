import { Response } from "express";
import { TripService } from "../services/TripService";
import {
  PartialTripEditsSchema,
  TripIdSchema,
  TripSchema,
} from "../validators/trip.validator";
import { AuthRequest } from "../schema/authSchema";

export const getUserTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.dbUser;
    const trips = await TripService.getAllTrips(userId);
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trips", error });
  }
};

export const getTripById = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = TripIdSchema.parse({ ...req.params });
    console.log(tripId);
    const tripRole = req.tripRole;

    if (tripRole == "")
      res
        .status(401)
        .json({ message: "You are not authorised to view this trip" });

    const trips = await TripService.getTripById(tripId);
    res.status(200).json({ trips, tripRole });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching trips", error });
  }
};

/**
 * Update Trip setting only leader of the trip can edit trips settings.
 * @param req the request
 * @param res the response
 */
export const updateTripSetting = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = TripIdSchema.parse({ ...req.params });
    const tripRole = req.tripRole ?? "";

    //Only leaders can make changes to trip setting.
    if (tripRole !== "LEADER")
      return res.status(401).json({ message: "Unauthorised to make changes" });

    //Validating Data ensure that the values are in the correct type.
    if (req.body === undefined)
      return res
        .status(401)
        .json({ message: "No field provided for updates." });

    const validate = PartialTripEditsSchema.safeParse({ ...req.body });

    if (!validate.success) {
      return res
        .status(400)
        .json({ message: validate.error.message.toString() });
    }

    const edits = validate.data;
    const result = await TripService.updateTripSetting(tripId, edits);

    res.status(200).json({
      message: `${result.message} Trip(id:${tripId})`,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Unexpected Error" });
  }
};

export const createTrip = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId } = TripIdSchema.parse({ ...req.params });

    const tripRole = req.tripRole ?? "";

    if (tripRole === "")
      return res.status(401).json({ message: "Unauthorised to create a trip" });

    if (req.body === undefined)
      return res
        .status(401)
        .json({ message: "No field provided for updates." });

    const newTrip = TripSchema.safeParse({ ...req.body });

    if (!newTrip.success) {
      return res
        .status(400)
        .json({ message: newTrip.error.message.toString() });
    }

    // const result = await TripService.createTrip();
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: "Unexpected Error" });
  }
};
