import { TripEditType } from "@/validators/trip.validator";
import { Op, Sequelize, Transaction } from "sequelize";
import Trip from "./trip.model";
import Users from "../User/users.model";
import { title } from "node:process";

export const TripRepository = {
  createTrip: async (newTrip: TripEditType, t: Transaction) => {
    return Trip.create({ ...newTrip }, { transaction: t });
  },
  findAll: async (userId: number, search: string) => {

    const searchTerm = search?.trim().slice(0, 100) ?? "";

    const searchCondition = searchTerm ? [{

      [Op.or]: [
        {
          title: {
            [Op.like]:
              `%${searchTerm}%`,
          },
        },

        {
          country: {
            [Op.like]:
              `%${searchTerm}%`,
          },
        },
      ]
      
      }] : []


    return Trip.findAll({
      subQuery: false,
      include: [
        {
          model: Users,
          as: "members",
          attributes: [], //So that no attributes will be shown
          through: { attributes: [] }, // Set this to empty so the nested object disappears
        },
      ],
      where: {
        [Op.and]: [{

          [Op.or]: [
            { leaderId: userId },
            {
              [Op.and]: [
                { "$members.user_id$": userId },
                { "$members.TripMembers.status$": "Accepted" },
              ],
            },

          ]
        },

        ...searchCondition

        ],

      },
    });
  },
  findByTripId: async (tripId: number) => {
    return Trip.findOne({
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
