import { TripEditType } from "@/validators/trip.validator";
import { Op, Sequelize, Transaction } from "sequelize";
import { TripMembers, Trip, Users } from "@/models";



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
          as: "tripMemberList",
          attributes: ["displayName", "email", ["status", "accountStatus"],
            [Sequelize.literal("`tripMemberList->TripMembers`.`status`"), "status"],
          ], 
          through: {attributes:[]}, // Set this to empty so the nested object disappears
        },
      ],
      where: {
        [Op.and]: [{

          [Op.or]: [
            { leaderId: userId },
            {
              [Op.and]: [
                { "$tripMemberList.user_id$": userId },
                // { "$tripMembers.TripMembers.status$": "Accepted" },
              ],
            },

          ]
        },

        ...searchCondition

        ],

      },
      order: [['createdAt', 'DESC']],
    });
  },
  findByTripId: async (tripId: number) => {
    return Trip.findOne({
      where: { tripId },
      include: [
        {
          model: Users,
          as: "tripMemberList",
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
  updateTrip: async (tripId: number, edits: TripEditType, t:Transaction) => {
    return await Trip.update(edits, { where: { tripId}, transaction:t });
  },
};
