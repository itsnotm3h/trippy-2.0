import { Request, Response } from 'express';
import { TripService } from './tripService';

export const getTrips = async (req: Request, res: Response) => {
    try {
        const trips = await TripService.getAllTrips();
        res.status(200).json(trips);
    } catch (error) {
        res.status(500).json({ message: "Error fetching trips", error });
    }
};