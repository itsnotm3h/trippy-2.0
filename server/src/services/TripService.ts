import { createTrip } from "@/controllers/TripController";
import { Expenses, Trip } from "../models";
import { TripRepository } from "../repositories/TripRepository";
import { TripEditType, TripType } from "../validators/trip.validator";

export const TripService = {
  getAllTrips: async (userId: number) => {
    return await TripRepository.findAll(userId);
  },
  getTripById: async (tripId: number) => {
    return await TripRepository.findByTripId(tripId);
  },
  createTrip:async (data:TripType)=>{
    return await TripRepository.createTrip(data);
  },
  updateTrip: async (tripId: number, edits: TripEditType) => {
    const trip = await Trip.findByPk(tripId);
    if (!trip) throw new Error("Trip does not exist");

    //Check if there is any expense created in the trip, before allowing changes.
    if (edits.type) {
      const expense = await Expenses.findOne({
        where: {
          tripId,
        },
      });

      if (expense !== null)
        throw new Error("The trip has expenses, unable to change trip type");
    }

    const [affectedRows] = await TripRepository.updateTrip(
      tripId,
      edits,
    );

    if (affectedRows === 0) throw new Error("There is no updates.");

    return { message: "Successfully updated" };
  },
};
