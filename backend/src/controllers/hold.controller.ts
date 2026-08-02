import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { holdService } from "../services/hold.service";
import { parseDateInTz } from "../utils/time";

export const holdController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const { therapistId, startAt, endAt } = req.body;
    const hold = await holdService.createHold(
      req.user!.id,
      therapistId,
      parseDateInTz(startAt),
      parseDateInTz(endAt)
    );
    res.status(201).json({
      hold: {
        id: hold.id,
        therapistId: hold.therapistId,
        startAt: hold.startAt.toISOString(),
        endAt: hold.endAt.toISOString(),
        expiresAt: hold.expiresAt.toISOString(),
      },
    });
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const hold = await holdService.getActiveHold(req.user!.id);
    if (!hold) {
      res.json({ hold: null });
      return;
    }
    res.json({
      hold: {
        id: hold.id,
        therapistId: hold.therapistId,
        therapist: hold.therapist,
        startAt: hold.startAt.toISOString(),
        endAt: hold.endAt.toISOString(),
        expiresAt: hold.expiresAt.toISOString(),
      },
    });
  }),

  release: asyncHandler(async (req: Request, res: Response) => {
    await holdService.releaseHold(req.user!.id);
    res.json({ message: "Hold released" });
  }),
};
