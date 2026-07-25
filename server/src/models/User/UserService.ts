import { STATUS_TYPE } from "@/models/User/users.model";
import { Users } from "..";
import { UserRepository } from "./UserRepository";
import { Login, RegisterType } from "../../schema/authSchema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserToken } from "../../schema/tokenSchema";
import { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } from "../../config/env";
import { NotificationRepositry } from "@/models/Notifications/NotificationRepository";
import { NOTIFICATION_TYPE } from "@/validators/notification.validators";
import UserSession from "../UserSession/userSession-model";
import dayjs from "dayjs";
import { Op } from "sequelize";
import { AppError } from "@/utils/AppError";

export const UserService = {
  getUser: async (login: Login, deviceInfo: string) => {
    const user = await UserRepository.findUser(login);

    if (
      !user ||
      !(await bcrypt.compare(login.password, user.password)) ||
      user.status === STATUS_TYPE.DEACTIVATED ||
      user.status === STATUS_TYPE.PENDING
    ) {
      throw new AppError("Invalid Credentials", 401);
    }

    const payload: UserToken = {
      sub: user.authId,
      displayName: user.displayName,
    };

    if (!JWT_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      throw new Error("Token not found");
    }

    const accessToken = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "15m",
    });

    const existingSession = await UserSession.findOne({
      where: { authId: user.authId, deviceInfo },
    });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET_KEY, {
      expiresIn: "30d",
    });

    const hashedToken = await bcrypt.hash(refreshToken, 10);

    if (existingSession) {
      await existingSession.update({
        token: hashedToken,
        expireAt: dayjs().add(30, "day").toDate(),
        isRevoked: false,
      });
    } else {
      await UserSession.create({
        authId: user.authId,
        token: hashedToken,
        expireAt: dayjs().add(30, "day").toDate(),
        isRevoked: false,
        deviceInfo,
      });
    }

    return {
      accessToken,
      refreshToken,
      user: { id: user.userId, displayName: user.displayName },
    };
  },

  createUser: async (user: RegisterType) => {
    //Check if the the email exist and if the status is PENDING.
    const { email, password, ...others } = user;
    const currentUser = await Users.findOne({ where: { email } });
    let userId;

    if (currentUser && currentUser.status !== STATUS_TYPE.PENDING) {
      throw new AppError("Email already registered", 409);
    }

    if (currentUser?.status === STATUS_TYPE.PENDING) {
      const userUpdates = await currentUser.update({
        email: user.email,
        password: await bcrypt.hash(password, 10),
        ...others,
        status: STATUS_TYPE.ACTIVE,
      });

      await NotificationRepositry.createNotification({
        userId: userUpdates.userId,
        type: NOTIFICATION_TYPE.INFO,
        message: "Welcome to Trippy!",
        isRead: false,
      });

      return userUpdates;
    }

    const newUser = await Users.create({
      email,
      password: await bcrypt.hash(password, 10),
      ...others,
      status: STATUS_TYPE.ACTIVE,
    });

    //send notification.
    await NotificationRepositry.createNotification({
      userId: newUser.userId,
      type: NOTIFICATION_TYPE.INFO,
      message: "Welcome to Trippy!",
      isRead: false,
    });

    return newUser;
  },

  refreshAccess: async (rawRefreshToken: string) => {
    if (!JWT_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      throw new Error("JWT secrets not configured");
    }

    try {
      const decoded = jwt.verify(rawRefreshToken, JWT_REFRESH_SECRET_KEY);

      const activeSessions = await UserSession.findAll({
        where: {
          authId: decoded.sub,
          isRevoked: false,
          expireAt: { [Op.gt]: new Date() },
        },
      });

      if (!activeSessions || activeSessions.length === 0) {
        throw new AppError("No active sessions found", 401);
      }

      //Run this as there are difference device that could be login in different session.
      let validSession = null;
      for (const session of activeSessions) {
        const isMatch = await bcrypt.compare(rawRefreshToken, session.token);
        if (isMatch) {
          validSession = session;
          break;
        }
      }

      if (!validSession) {
        throw new AppError("Invalid Session", 401);
      }

      const payload: UserToken = {
        //@ts-ignore
        sub: decoded.sub,
        //@ts-ignore
        displayName: decoded.displayName,
      };

      const newAccessToken = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: "15m", // Another 15 minutes of access
      });

      const user = await Users.findOne({ where: { authId: decoded.sub } });

      return {
        newAccessToken,
        user: { displayName: user?.displayName, id: user?.userId },
      };
    } catch (error) {
      console.log(error);
      throw new AppError("Unauthorized", 401);
    }
  },
  logoutUser: async (rawRefreshToken: string) => {
    //Get the user Payload and to compare the refreshToken.
    const decoded = jwt.verify(
      rawRefreshToken,
      JWT_REFRESH_SECRET_KEY as string,
    );

    const activeSession = await UserSession.findAll({
      where: {
        authId: decoded.sub,
        isRevoked: false,
      },
    });

    for (const session of activeSession) {
      const isMatch = await bcrypt.compare(rawRefreshToken, session.token);
      if (isMatch) {
        session.update({ isRevoked: true });
        break;
      }
    }
  },
};
