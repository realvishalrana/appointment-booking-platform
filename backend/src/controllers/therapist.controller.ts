import { Request, Response } from "express";
import { AppointmentStatus } from "@prisma/client";
import { asyncHandler } from "../middleware/errorHandler";
import { slotService } from "../services/slot.service";
import { therapistPortalService } from "../services/therapist-portal.service";
import { therapistService } from "../services/therapist.service";
import { isWithinWindow, parseDateInTz } from "../utils/time";
import { serializeAppointment } from "../utils/serialize";

export const therapistController = {
  list: asyncHandler(async (_req: Request, res: Response) => {
    const therapists = await therapistService.listTherapists();
    res.json({ therapists });
  }),

  getSlots: asyncHandler(async (req: Request, res: Response) => {
    const therapistId = Number(req.params.id);
    const therapist = await therapistService.getTherapistById(therapistId);
    if (!therapist) {
      res.status(404).json({ error: "Therapist not found" });
      return;
    }

    const from = parseDateInTz(req.query.from as string);
    const to = parseDateInTz(req.query.to as string);
    const slots = await slotService.getAvailableSlots(therapistId, from, to);
    res.json({ slots });
  }),
};

export const therapistPortalController = {
  getAppointments: asyncHandler(async (req: Request, res: Response) => {
    const appointments = await therapistPortalService.getAppointments(
      req.user!.id
    );
    const now = new Date();
    res.json({
      appointments: appointments.map((a) => ({
        ...serializeAppointment(a),
        canUpdateStatus: isWithinWindow(now, a.startAt, a.endAt),
      })),
    });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const appointment = await therapistPortalService.updateAppointmentStatus(
      req.user!.id,
      id,
      req.body.status as AppointmentStatus,
      {
        cancellationReason: req.body.cancellationReason,
        noShowNotes: req.body.noShowNotes,
      }
    );
    res.json({
      appointment: {
        id: appointment.id,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason,
        noShowNotes: appointment.noShowNotes,
      },
    });
  }),

  getSchedule: asyncHandler(async (req: Request, res: Response) => {
    const schedule = await therapistPortalService.getSchedule(req.user!.id);
    res.json({ schedule });
  }),

  updateSchedule: asyncHandler(async (req: Request, res: Response) => {
    const schedule = await therapistPortalService.updateSchedule(
      req.user!.id,
      req.body.windows
    );
    res.json({ schedule });
  }),
};
