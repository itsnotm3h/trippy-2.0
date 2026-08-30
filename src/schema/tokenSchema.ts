import { z } from "zod";
import * as jwt from "jsonwebtoken";

// 1. Define the schema
export const UserTokenSchema = z.object({
  sub: z.string().optional(), //as jwtToken declare sub as | undefined.
  displayName: z.string(),
});

// 2. Automatically generate the TypeScript type
export type UserToken = z.infer<typeof UserTokenSchema>;

export interface MyToken extends jwt.JwtPayload, UserToken {}
