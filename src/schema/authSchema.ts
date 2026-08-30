import { z } from "zod";
import { Request } from "express";

export enum TRIP_ROLE {
  MEMBER = "MEMBER",
  LEADER = "LEADER",
  NONE = "NONE",
}

// 1. The Zod Schema (The logic)
export const AuthUserSchema = z.object({
  sub: z.string().optional(),
  displayName: z.string(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export const loginCredentials = z.object({
  email: z.string(),
  password: z.string(),
});

export const registrationSchema = z.object({
  firstName: z
    .string()
    .min(5, "must be greater than 5 chars")
    .max(50, "cannot be more than 50 chars"),
  lastName: z
    .string()
    .min(5, "must be greater than 5 chars")
    .max(50, "cannot be more than 50 chars"),
  displayName: z
    .string()
    .min(5, "must be greater than 5 chars")
    .max(16, "cannot be more than 16 chars"),
  password: z
    .string()
    .min(8, "must be at least 8 chars")
    .max(25, "cannot be more than 25 chars"),
  email: z.email(),
});
// 2. The Inferred Type (The shape of the data)
export type AuthUser = z.infer<typeof AuthUserSchema>;
export type Login = z.infer<typeof loginCredentials>;
export type RegisterType = z.infer<typeof registrationSchema>;
export type TripRoleType = z.infer<typeof TRIP_ROLE>;

// 4. The Express Request Type (For your routes)
export interface AuthRequest extends Request {
  auth?: {
    payload: AuthUser;
  };
  dbUser?: any;
  tripRole?: TripRoleType;
}
