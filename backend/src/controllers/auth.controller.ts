import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { authService } from "../services/auth.service";

export const authController = {
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    res.json({ user });
  }),
};
