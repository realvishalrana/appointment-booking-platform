import { prisma } from "../prisma";

export interface ScheduleWindowInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export const scheduleRepository = {
  findByTherapistId(therapistId: number) {
    return prisma.therapistSchedule.findMany({
      where: { therapistId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  },

  replaceForTherapist(therapistId: number, windows: ScheduleWindowInput[]) {
    return prisma.$transaction(async (tx) => {
      await tx.therapistSchedule.deleteMany({ where: { therapistId } });
      await tx.therapistSchedule.createMany({
        data: windows.map((w) => ({
          therapistId,
          dayOfWeek: w.dayOfWeek,
          startTime: w.startTime,
          endTime: w.endTime,
        })),
      });
      return tx.therapistSchedule.findMany({
        where: { therapistId },
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
      });
    });
  },
};
