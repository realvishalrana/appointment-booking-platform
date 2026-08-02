import { AppointmentStatus, RecurrenceFrequency } from "@prisma/client";
import { createHash } from "crypto";
import { BookingError } from "../errors/AppError";
import { appointmentRepository } from "../repositories/appointment.repository";
import { bookingRepository } from "../repositories/booking.repository";
import { holdRepository } from "../repositories/hold.repository";
import { idempotencyRepository } from "../repositories/idempotency.repository";
import { seriesRepository } from "../repositories/series.repository";
import { holdService } from "./hold.service";
import {
  filterConflictingOccurrences,
  generateRecurringOccurrences,
  getHorizonEnd,
} from "../utils/recurring";
import { rangesOverlap } from "../utils/time";

interface ConfirmBookingInput {
  patientId: number;
  type: "one_time" | "recurring";
  frequency?: RecurrenceFrequency;
  idempotencyKey: string;
  requestBody: unknown;
}

function serializeAppointment(a: {
  id: number;
  patientId: number;
  therapistId: number;
  seriesId: number | null;
  startAt: Date;
  endAt: Date;
  status: AppointmentStatus;
}) {
  return {
    id: a.id,
    patientId: a.patientId,
    therapistId: a.therapistId,
    seriesId: a.seriesId,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    status: a.status,
  };
}

async function getBlockedSlots(
  therapistId: number,
  from: Date,
  to: Date,
  excludePatientId?: number
) {
  const [appointments, holds] = await Promise.all([
    appointmentRepository.findScheduledByTherapistInRange(
      therapistId,
      from,
      to
    ),
    excludePatientId
      ? holdRepository.findActiveByTherapistInRangeExcludingPatient(
          therapistId,
          from,
          to,
          excludePatientId
        )
      : holdRepository.findActiveByTherapistInRange(therapistId, from, to),
  ]);

  return [
    ...appointments.map((a) => ({ startAt: a.startAt, endAt: a.endAt })),
    ...holds.map((h) => ({ startAt: h.startAt, endAt: h.endAt })),
  ];
}

export const bookingService = {
  async confirmBooking(input: ConfirmBookingInput) {
    const requestHash = createHash("sha256")
      .update(JSON.stringify(input.requestBody))
      .digest("hex");

    const existing = await idempotencyRepository.findByKey(
      input.idempotencyKey
    );

    if (existing) {
      if (existing.userId !== input.patientId) {
        throw new BookingError("Idempotency key belongs to another user", 403);
      }
      if (existing.requestHash !== requestHash) {
        throw new BookingError(
          "Idempotency key reused with different request body",
          422
        );
      }
      return existing.responseBody;
    }

    const hold = await holdService.getValidHold(input.patientId);
    if (!hold) {
      throw new BookingError(
        "No active hold found. Please hold a slot first.",
        400
      );
    }

    const now = new Date();
    if (hold.expiresAt <= now) {
      throw new BookingError(
        "Hold has expired. Please select a slot again.",
        410
      );
    }

    if (input.type === "recurring" && !input.frequency) {
      throw new BookingError("Frequency is required for recurring bookings");
    }

    const horizonEnd = getHorizonEnd(hold.startAt);
    const blocked = await getBlockedSlots(
      hold.therapistId,
      hold.startAt,
      horizonEnd,
      input.patientId
    );

    if (
      blocked.some((b) =>
        rangesOverlap(hold.startAt, hold.endAt, b.startAt, b.endAt)
      )
    ) {
      throw new BookingError("Slot is no longer available", 409);
    }

    let result: object;

    if (input.type === "one_time") {
      const appointment = await bookingRepository.confirmOneTime(
        input.patientId,
        hold.therapistId,
        hold.startAt,
        hold.endAt
      );
      result = {
        type: "one_time",
        appointment: serializeAppointment(appointment),
      };
    } else {
      const occurrences = generateRecurringOccurrences(
        hold.startAt,
        hold.endAt,
        input.frequency!,
        horizonEnd
      );
      const available = filterConflictingOccurrences(occurrences, blocked);

      if (available.length === 0) {
        throw new BookingError(
          "No available occurrences for recurring booking",
          409
        );
      }

      const { series, appointments } = await bookingRepository.confirmRecurring(
        input.patientId,
        hold.therapistId,
        input.frequency!,
        hold.startAt,
        hold.endAt,
        available
      );

      result = {
        type: "recurring",
        series: {
          id: series.id,
          frequency: series.frequency,
          status: series.status,
          startAt: series.startAt.toISOString(),
          endAt: series.endAt.toISOString(),
        },
        appointments: appointments.map(serializeAppointment),
        skippedConflicts: occurrences.length - available.length,
      };
    }

    await idempotencyRepository.create({
      key: input.idempotencyKey,
      userId: input.patientId,
      requestHash,
      responseBody: result,
    });

    return result;
  },

  async cancelAppointment(
    appointmentId: number,
    patientId: number,
    reason: string
  ) {
    const appointment = await appointmentRepository.findById(appointmentId);

    if (!appointment || appointment.patientId !== patientId) {
      throw new BookingError("Appointment not found", 404);
    }

    if (appointment.status !== AppointmentStatus.scheduled) {
      throw new BookingError("Only scheduled appointments can be cancelled");
    }

    return appointmentRepository.cancelWithReason(appointmentId, reason);
  },

  async cancelSeries(seriesId: number, patientId: number, reason: string) {
    const series = await seriesRepository.findById(seriesId);

    if (!series || series.patientId !== patientId) {
      throw new BookingError("Series not found", 404);
    }

    await bookingRepository.cancelSeries(seriesId, reason);
    return { id: seriesId, status: "cancelled" };
  },

  getPatientAppointments(patientId: number) {
    return appointmentRepository.findByPatientId(patientId);
  },

  getPatientSeries(patientId: number) {
    return seriesRepository.findByPatientId(patientId);
  },
};
