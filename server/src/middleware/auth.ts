import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserTokenSchema } from "../schema/tokenSchema";
import { AuthRequest } from "../schema/authSchema";
import { JWT_SECRET_KEY } from "../config/env";

export const checkJWT = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];

    // //Check if header exist, and also to make sure that type of header is correct.
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "Unauthorized: Missing Token" });
    }

    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ message: "No Token provided" });

    const decoded = jwt.verify(token, JWT_SECRET_KEY as string);
    const validateToken = UserTokenSchema.parse(decoded);
    const { sub, displayName } = validateToken;

    req.auth = {
      payload: {
        sub,
        displayName,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
    };

    next();
  } catch (err) {
    next(err);
  }
};
