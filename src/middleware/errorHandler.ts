// src/utils/handleError.ts
import { AppError } from "@/utils/AppError";
import { NextFunction, Response } from "express";

export const errorHandler = (
  err:any,
  req:Request,
  res:Response,
  next:NextFunction
)=>{
  const statusCode = err instanceof AppError ? err.statusCode : 500;

  res.status(statusCode).json({
    success:false,
    message:err.message || "Unexpected Error",
  })
}