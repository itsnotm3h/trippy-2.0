import { Request, Response } from "express";
import { loginCredentials, registrationSchema } from "../../schema/authSchema";
import { UserService } from "./UserService";
import { getDeviceInfo } from "@/utils/getDeviceInfo";
import { handleError } from "@/utils/handleError";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const register = registrationSchema.parse(req.body);
    const deviceInfo = getDeviceInfo(req);

    await UserService.createUser(register);    
    
    const { accessToken, refreshToken, user } = await UserService.getUser({email:register.email, password:register.password}, deviceInfo);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevents JS access
      secure: false, // Only sends over HTTPS
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 1 hour
      signed: true,
    });

    return res.status(200).json(
      {
        accessToken,
        user,
        message: `Register Successful!`,
      });

      
  } catch (error: any) {
    return handleError(error, res);

  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const login = loginCredentials.parse(req.body);


    const deviceInfo = getDeviceInfo(req);


    const { accessToken, refreshToken, user } = await UserService.getUser(login, deviceInfo);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // Prevents JS access
      secure: false, // Only sends over HTTPS
      sameSite: "strict", // Prevents CSRF attacks
      maxAge: 30 * 24 * 60 * 60 * 1000, // 1 hour
      signed: true,
    });


    return res.status(200).json(
      {
        accessToken,
        user,
        message: `Login Successful!`,
      });

  } catch (error) {
    console.error(error); // log internally
    return handleError(error, res);
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {

    const refreshToken = req.signedCookies.refreshToken;

    if (refreshToken == undefined) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    await UserService.logoutUser(refreshToken);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    });

    return res.status(200).json({ message: `Logout Successful!`})


  } catch (error) {
    console.error(error);
    return handleError(error, res);
  }

};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.signedCookies.refreshToken;

    if (refreshToken == undefined) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    const { newAccessToken, user } = await UserService.refreshAccess(refreshToken);

    res.status(200).json({ accessToken: newAccessToken, user });


  } catch (error) {
    

    console.error(error);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict'

    });

    return handleError(error, res);


  }
}
