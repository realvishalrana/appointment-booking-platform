import { AppointmentStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const appointmentRepository = {
  findScheduledByTherapistInRange(therapistId: number, from: Date, to: Date) {
    return prisma.appointment.findMany({
      where: {
        therapistId,
        status: AppointmentStatus.scheduled,
        startAt: { lte: to },
        endAt: { gte: from },
      },
    });
  },

  findById(id: number) {
    return prisma.appointment.findUnique({ where: { id } });
  },

  findByTherapistId(therapistId: number) {
    return prisma.appointment.findMany({
      where: { therapistId },
      include: {
        patient: { select: { id: true, name: true, email: true } },
        series: { select: { id: true, frequency: true, status: true } },
      },
      orderBy: { startAt: "asc" },
    });
  },

  findByPatientId(patientId: number) {
    return prisma.appointment.findMany({
      where: { patientId },
      include: {
        therapist: { select: { id: true, name: true } },
        series: { select: { id: true, frequency: true, status: true } },
      },
      orderBy: { startAt: "asc" },
    });
  },

  updateStatus(
    id: number,
    status: AppointmentStatus,
    extra?: { cancellationReason?: string; noShowNotes?: string }
  ) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(extra?.cancellationReason !== undefined
          ? { cancellationReason: extra.cancellationReason }
          : {}),
        ...(extra?.noShowNotes !== undefined
          ? { noShowNotes: extra.noShowNotes }
          : {}),
      },
    });
  },

  cancelWithReason(id: number, reason: string) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status: AppointmentStatus.cancelled,
        cancellationReason: reason,
      },
    });
  },

  createOneTime(data: {
    patientId: number;
    therapistId: number;
    startAt: Date;
    endAt: Date;
  }) {
    return prisma.appointment.create({
      data: {
        ...data,
        status: AppointmentStatus.scheduled,
      },
    });
  },

  createManyForSeries(
    patientId: number,
    therapistId: number,
    seriesId: number,
    occurrences: { startAt: Date; endAt: Date }[]
  ) {
    return Promise.all(
      occurrences.map((occ) =>
        prisma.appointment.create({
          data: {
            patientId,
            therapistId,
            seriesId,
            startAt: occ.startAt,
            endAt: occ.endAt,
            status: AppointmentStatus.scheduled,
          },
        })
      )
    );
  },

  cancelFutureBySeriesId(seriesId: number) {
    const now = new Date();
    return prisma.appointment.updateMany({
      where: {
        seriesId,
        status: AppointmentStatus.scheduled,
        startAt: { gt: now },
      },
      data: { status: AppointmentStatus.cancelled },
    });
  },
};
