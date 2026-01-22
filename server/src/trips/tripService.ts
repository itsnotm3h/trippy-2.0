import pool from '../config/db';
import Trip from './trip.model';

export const TripService = {
    getAllTrips: async () => {
        return await Trip.findAll();
    }
}
