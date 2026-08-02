import { RecurrenceFrequency, SeriesStatus } from "@prisma/client";
import { prisma } from "../prisma";

export const seriesRepository = {
  findActiveByTherapistId(therapistId: number) {
    return prisma.recurringSeries.findMany({
      where: { therapistId, status: SeriesStatus.active },
    });
  },

  findById(id: number) {
    return prisma.recurringSeries.findUnique({ where: { id } });
  },

  findByPatientId(patientId: number) {
    return prisma.recurringSeries.findMany({
      where: { patientId },
      include: {
        therapist: { select: { id: true, name: true } },
        _count: { select: { appointments: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  create(data: {
    patientId: number;
    therapistId: number;
    frequency: RecurrenceFrequency;
    startAt: Date;
    endAt: Date;
  }) {
    return prisma.recurringSeries.create({
      data: { ...data, status: SeriesStatus.active },
    });
  },

  cancel(id: number) {
    return prisma.recurringSeries.update({
      where: { id },
      data: { status: SeriesStatus.cancelled },
    });
  },
};
