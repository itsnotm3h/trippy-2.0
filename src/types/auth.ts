import { Request } from "express";

export interface AuthUser {
  sub: string;
  displayName: string;
  firstName: string;
  lastName: string;
  email: string;
  iat: number;
  exp: number;
  password:string;
}

export interface AuthRequest extends Request {
  auth?: {
    payload: AuthUser;
  };
  dbUser?: any;
  tripRole?: string;
}
