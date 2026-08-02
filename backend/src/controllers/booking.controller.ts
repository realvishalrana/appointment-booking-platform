import { Request, Response } from "express";
import { asyncHandler } from "../middleware/errorHandler";
import { bookingService } from "../services/booking.service";
import { serializeAppointment } from "../utils/serialize";

export const bookingController = {
  confirm: asyncHandler(async (req: Request, res: Response) => {
    const idempotencyKey = req.headers["idempotency-key"] as string;
    if (!idempotencyKey) {
      res.status(400).json({ error: "Idempotency-Key header is required" });
      return;
    }

    const result = await bookingService.confirmBooking({
      patientId: req.user!.id,
      type: req.body.type,
      frequency: req.body.frequency,
      idempotencyKey,
      requestBody: req.body,
    });
    res.status(201).json(result);
  }),

  getMine: asyncHandler(async (req: Request, res: Response) => {
    const appointments = await bookingService.getPatientAppointments(
      req.user!.id
    );
    res.json({
      appointments: appointments.map(serializeAppointment),
    });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const appointment = await bookingService.cancelAppointment(
      id,
      req.user!.id,
      req.body.reason
    );
    res.json({
      appointment: {
        id: appointment.id,
        status: appointment.status,
        cancellationReason: appointment.cancellationReason,
      },
    });
  }),
};

export const seriesController = {
  getMine: asyncHandler(async (req: Request, res: Response) => {
    const series = await bookingService.getPatientSeries(req.user!.id);
    res.json({
      series: series.map((s) => ({
        id: s.id,
        therapist: s.therapist,
        frequency: s.frequency,
        status: s.status,
        cancellationReason: s.cancellationReason,
        startAt: s.startAt.toISOString(),
        endAt: s.endAt.toISOString(),
        appointmentCount: s._count.appointments,
      })),
    });
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const result = await bookingService.cancelSeries(
      id,
      req.user!.id,
      req.body.reason
    );
    res.json(result);
  }),
};
