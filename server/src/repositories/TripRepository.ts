import { Op, Sequelize, Transaction } from "sequelize";
import { Trip, Users } from "../models";
import { TripEditType, TripType } from "../validators/trip.validator";

export const TripRepository = {
  createTrip: async (newTrip: TripEditType, t: Transaction) => {
    return await Trip.create({ ...newTrip }, { transaction: t });
  },
  findAll: async (userId: number) => {
    return await Trip.findAll({
      include: [
        {
          model: Users,
          as: "members",
          attributes: [], //So that no attributes will be shown
          through: { attributes: [] }, // Set this to empty so the nested object disappears
        },
      ],
      where: {
        [Op.or]: [
          { leaderId: userId },
          {
            [Op.and]: [
              { "$members.user_id$": userId },
              { "$members.TripMembers.status$": "Accepted" },
            ],
          },
        ],
      },
    });
  },
  findByTripId: async (tripId: number) => {
    return await Trip.findOne({
      where: { tripId },
      include: [
        {
          model: Users,
          as: "members",
          attributes: [
            "userId",
            "displayName",
            [Sequelize.literal("`members->TripMembers`.`status`"), "status"],
          ],
          through: { attributes: [] },
        },
      ],
      logging: true,
    });
  },
  updateTrip: async (tripId: number, edits: TripEditType) => {
    return await Trip.update(edits, { where: { tripId } });
  },
};
