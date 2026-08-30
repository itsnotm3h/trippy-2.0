import { AuthRequest } from "@/schema/authSchema";
import { NotificationService } from "@/models/Notifications/NotificationService";
import { Response } from "express";

export const getUserNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.dbUser;
    const result = await NotificationService.getUserNotification(userId);
    res.status(200).json(result);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};
