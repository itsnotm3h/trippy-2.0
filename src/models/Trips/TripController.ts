import { NextFunction, Response } from "express";
import { TripService } from "./TripService";
import { AuthRequest } from "@/schema/authSchema";
import {
  DeleteTripSchema,
  PartialTripEditsSchema,
  TripIdSchema,
  TripSchema,
} from "@/validators/trip.validator";

export const getUserTrips = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.dbUser;
    const search = req.query.search as string ?? "";
    const trips = await TripService.getAllTrips(userId, search);
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
export const updateTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tripId } = TripIdSchema.parse({ ...req.params });
    const tripRole = req.tripRole ?? "";
    const userInfo = req.dbUser ?? "";


    //Only leaders can make changes to trip setting.
    if (tripRole !== "LEADER")
      return res.status(401).json({ message: "Unauthorised to make changes" });

    //Validating Data ensure that the values are in the correct type.
    if (req.body === undefined)
      return res
        .status(401)
        .json({ message: "No field provided for updates." });

    // const validate = PartialTripEditsSchema.safeParse({ ...req.body, leaderIs:true });

    // if (!validate.success) {
    //   console.error("Validation Failed")
    //   return res
    //     .status(400)
    //     .json({ message: validate.error.message.toString() });
    // }

    // const edits = validate.data;
    const result = await TripService.updateTrip(tripId, { ...req.body, leaderIs: true }, userInfo);

    res.status(200).json({
      message: `${result.message}`,
    });

  } catch (error) {
    next(error);
  }
};

export const createTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userInfo = req.dbUser ?? "";
    const newTrip = TripSchema.safeParse({
      ...req.body,
      leaderId: userInfo.userId,
    });

    if (!newTrip.success) {
      console.log(newTrip.error.message)
      return res
        .status(400)
        .json({ message: newTrip.error.message });
    }

    const result = await TripService.createTrip(newTrip.data, userInfo);

    console.log(result);

    res.status(200).json({ result });
  } catch (error: any) {
    next(error)
  }
};

export const deleteTrip = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tripRole = req.tripRole ?? "";
    const userInfo = req.dbUser ?? "";


    if (tripRole !== "LEADER")
      return res.status(401).json({ message: "Unauthorised to make changes" });

    const request = DeleteTripSchema.parse({
      ...req.body,
    });

    const result = await TripService.deleteTrip(request.tripId,userInfo.displayName);
    res.status(200).json({ result });

  } catch (error: any) {
    next(error);
  }
};
