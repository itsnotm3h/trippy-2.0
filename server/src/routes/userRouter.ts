import { Router } from "express";
import { loginUser, registerUser } from "../controllers/UserController";

const userRouter = Router();

//User endpoints
userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);

export default userRouter;
