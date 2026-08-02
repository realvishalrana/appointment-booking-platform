import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const holdRepository = {
  createInTransaction(
    therapistId: number,
    patientId: number,
    startAt: Date,
    endAt: Date,
    expiresAt: Date
  ) {
    const now = new Date();
    return prisma.$transaction(async (tx) => {
      await tx.slotHold.deleteMany({
        where: {
          OR: [{ expiresAt: { lt: now } }, { patientId }],
        },
      });

      const conflictingHold = await tx.slotHold.findFirst({
        where: {
          therapistId,
          startAt,
          expiresAt: { gt: now },
          patientId: { not: patientId },
        },
      });

      if (conflictingHold) {
        return { error: "conflict" as const };
      }

      try {
        const hold = await tx.slotHold.create({
          data: { therapistId, patientId, startAt, endAt, expiresAt },
        });
        return { hold };
      } catch (err) {
        if (
          err instanceof Prisma.PrismaClientKnownRequestError &&
          err.code === "P2002"
        ) {
          return { error: "conflict" as const };
        }
        throw err;
      }
    });
  },

  findActiveByPatientId(patientId: number) {
    const now = new Date();
    return prisma.slotHold.findFirst({
      where: { patientId, expiresAt: { gt: now } },
      include: {
        therapist: { select: { id: true, name: true, email: true } },
      },
    });
  },

  findValidByPatientId(patientId: number) {
    const now = new Date();
    return prisma.slotHold.findFirst({
      where: { patientId, expiresAt: { gt: now } },
    });
  },

  deleteByPatientId(patientId: number) {
    return prisma.slotHold.deleteMany({ where: { patientId } });
  },

  findActiveByTherapistInRange(therapistId: number, from: Date, to: Date) {
    return prisma.slotHold.findMany({
      where: {
        therapistId,
        expiresAt: { gt: new Date() },
        startAt: { lte: to },
        endAt: { gte: from },
      },
    });
  },

  findActiveByTherapistInRangeExcludingPatient(
    therapistId: number,
    from: Date,
    to: Date,
    excludePatientId: number
  ) {
    return prisma.slotHold.findMany({
      where: {
        therapistId,
        expiresAt: { gt: new Date() },
        startAt: { lte: to },
        endAt: { gte: from },
        patientId: { not: excludePatientId },
      },
    });
  },
};
