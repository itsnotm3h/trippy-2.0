import { TripMembers } from "@/models";
import { TripMemberType } from "@/validators/tripMembers.validator";
import { Transaction } from "sequelize";

export const TripMemberRepository = {
  upsertInvites: async (
    invitation: TripMemberType,
    txn?: Transaction | null,
  ) => {
    return await TripMembers.upsert(invitation as any, { transaction: txn });
  },
};
