import { AppointmentStatus, RecurrenceFrequency, SeriesStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const bookingRepository = {
  confirmOneTime(
    patientId: number,
    therapistId: number,
    startAt: Date,
    endAt: Date
  ) {
    return prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({
        data: {
          patientId,
          therapistId,
          startAt,
          endAt,
          status: AppointmentStatus.scheduled,
        },
      });
      await tx.slotHold.deleteMany({ where: { patientId } });
      return appointment;
    });
  },

  confirmRecurring(
    patientId: number,
    therapistId: number,
    frequency: RecurrenceFrequency,
    anchorStart: Date,
    anchorEnd: Date,
    occurrences: { startAt: Date; endAt: Date }[]
  ) {
    return prisma.$transaction(async (tx) => {
      const series = await tx.recurringSeries.create({
        data: {
          patientId,
          therapistId,
          frequency,
          startAt: anchorStart,
          endAt: anchorEnd,
          status: SeriesStatus.active,
        },
      });

      const appointments = [];
      for (const occ of occurrences) {
        const appt = await tx.appointment.create({
          data: {
            patientId,
            therapistId,
            seriesId: series.id,
            startAt: occ.startAt,
            endAt: occ.endAt,
            status: AppointmentStatus.scheduled,
          },
        });
        appointments.push(appt);
      }

      await tx.slotHold.deleteMany({ where: { patientId } });
      return { series, appointments };
    });
  },

  cancelSeries(seriesId: number, reason: string) {
    const now = new Date();
    return prisma.$transaction([
      prisma.recurringSeries.update({
        where: { id: seriesId },
        data: { status: SeriesStatus.cancelled, cancellationReason: reason },
      }),
      prisma.appointment.updateMany({
        where: {
          seriesId,
          status: AppointmentStatus.scheduled,
          startAt: { gt: now },
        },
        data: {
          status: AppointmentStatus.cancelled,
          cancellationReason: reason,
        },
      }),
    ]);
  },
};
