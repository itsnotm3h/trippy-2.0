// src/utils/handleError.ts
import { AppError } from "./AppError";
import { Response } from "express";

export const handleError = (error: unknown, res: Response) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  console.error("Unexpected error:", error);
  return res.status(500).json({ message: "Something went wrong" });
};