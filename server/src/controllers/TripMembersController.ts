import { Response } from "express";
import { AuthRequest } from "../schema/authSchema";
import { TripMemberService } from "../services/TripMemberService";
import { TripMemberList } from "../validators/tripMembers.validator";

export const upsertTripMember = async (req: AuthRequest, res: Response) => {
  try {
    const inviteList = TripMemberList.parse({ ...req.body.memberList });
    const {displayName} = req.dbUser;

    if (req.tripRole !== "LEADER") throw new Error("Unauthorised action.");

    const result = await TripMemberService.upsertTripMember(inviteList,displayName);

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating trips members", error });
  }
};
