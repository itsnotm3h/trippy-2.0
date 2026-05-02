import { Request, Response } from "express";
import { loginCredentials, registrationSchema } from "../schema/authSchema";
import { UserService } from "../services/UserService";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = registrationSchema.parse(req.body);
    const result = await UserService.createUser(user);

    res.status(200).json(result);
  } catch (error: any) {
    console.error(error);
    return res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const login = loginCredentials.parse(req.body);
    const token = await UserService.getUser(login);

    res.cookie("token", token, {
      httpOnly: true, // Prevents JS access
      secure: true, // Only sends over HTTPS
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 3600000, // 1 hour
      signed: true,
    });

    return res.status(200).json({
      message: `${token}`,
    });
  } catch (error) {
    console.error(error); // log internally
    res.status(500).json({ message: "Something went wrong" });
  }
};
