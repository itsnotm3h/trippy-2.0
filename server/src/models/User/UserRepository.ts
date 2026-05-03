import { Users } from "..";
import { Login } from "../../schema/authSchema";

export const UserRepository = {
  findUser: async (login: Login) => {
    return await Users.findOne({
      where: {
        email: login.email,
      },
    });
  },
};
