import { STATUS_TYPE } from "@/models/User/users.model";
import { Users } from "..";
import { UserRepository } from "./UserRepository";
import { Login, RegisterType } from "../../schema/authSchema";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { UserToken } from "../../schema/tokenSchema";
import { JWT_SECRET_KEY } from "../../config/env";
import { NotificationRepositry } from "@/models/Notifications/NotificationRepository";
import { NOTIFICATION_TYPE } from "@/validators/notification.validators";

export const UserService = {
  getUser: async (login: Login) => {
    const user = await UserRepository.findUser(login);

    if (
      !user ||
      !(await bcrypt.compare(login.password, user.password)) ||
      user.status === STATUS_TYPE.DEACTIVATED ||
      user.status === STATUS_TYPE.PENDING
    ) {
      throw new Error("Invalid Credentials");
    }

    const payload: UserToken = {
      sub: user.authId,
      displayName: user.displayName,
    };

    if (!JWT_SECRET_KEY) {
      throw new Error("JWT_SECRET not configured");
    }

    const token = jwt.sign(payload, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    return token;
  },
  createUser: async (user: RegisterType) => {
    //Check if the the email exist and if the status is PENDING.
    const { email, password, ...others } = user;
    const currentUser = await Users.findOne({ where: { email } });
    let userId;

    if (currentUser && currentUser.status !== STATUS_TYPE.PENDING) {
      throw new Error("Email already registered");
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
};
