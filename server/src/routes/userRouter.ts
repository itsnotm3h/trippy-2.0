import { Router } from "express";
import { loginUser, logoutUser, refreshToken, registerUser } from "../models/User/UserController";

const userRouter = Router();

//User endpoints
userRouter.post("/login", loginUser);
userRouter.post("/logout", logoutUser);
userRouter.post("/register", registerUser);
userRouter.post("/refreshToken",refreshToken)

export default userRouter;
