import { Response, NextFunction } from "express";
import { Trip, TripMembers, Users } from "../models";
import AppError from "../utils/AppError";
import { AuthRequest } from "../schema/authSchema";

export const identifyUser = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const authId = req.auth?.payload.sub;

  try {
    const [user] = await Users.findOrCreate({
      where: { authId },
      defaults: {
        displayName: req.auth?.payload.displayName,
      },
    });

    //     const [user] = await Users.upsert({
    //   authId: sub,           // Linked to 'sub'
    //   email: email,          // Linked to 'email'
    //   displayName: name,     // Linked to 'name'
    //   profilePic: picture,   // Linked to 'picture'
    //   lastLogin: new Date(), // Your own internal tracking
    // });

    // inside your identity middleware
    // const authId = req.auth?.payload.sub;
    // const displayName = req.auth?.payload.displayName;

    // let user = await Users.findOne({ where: { authId } });

    // if (!user) {
    //   // 2. If they don't exist, Create them (First time login)
    //   user = await Users.create({
    //     authId,
    //     displayName,
    //   });
    // } else if (user.displayName !== displayName) {
    //   // 3. If they DO exist but the name has changed, Update them
    //   user.displayName = displayName;
    //   await user.save(); // Sequelize handles the UPDATE SQL automatically
    // }

    req.dbUser = user;

    // console.log(req.dbUser.userId);

    next();
  } catch (err) {
    next(err);
  }
};

export const identifyTripRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tripId } = req.params;

    const userId = req.dbUser.userId;

    if (userId === undefined || tripId === undefined) {
      return next(new AppError("Error authorised entry", 400));
    }

    const isLeader = await Trip.findOne({
      where: {
        tripId,
        leaderId: userId,
      },
    });

    const isMember = await TripMembers.findOne({
      where: {
        tripId,
        userId,
      },
    });

    if (!isMember && !isLeader)
      return next(
        new AppError("Identity Check failed: You are not a member", 403),
      );

    req.tripRole = isLeader ? "LEADER" : isMember ? "MEMBER" : "";

    next();
  } catch (err) {
    next(err);
  }
};
