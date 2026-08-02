import { AppointmentStatus } from "@prisma/client";
import { appointmentRepository } from "../repositories/appointment.repository";
import { holdRepository } from "../repositories/hold.repository";
import { scheduleRepository } from "../repositories/schedule.repository";
import { seriesRepository } from "../repositories/series.repository";
import { projectSeriesOccurrences } from "../utils/recurring";
import {
  addDaysToDateKey,
  combineDateKeyAndTime,
  getDateKeyInAppTz,
  getDayOfWeekFromDateKey,
  rangesOverlap,
} from "../utils/time";

export interface AvailableSlot {
  therapistId: number;
  startAt: string;
  endAt: string;
}

export const slotService = {
  async getAvailableSlots(
    therapistId: number,
    from: Date,
    to: Date
  ): Promise<AvailableSlot[]> {
    const schedules = await scheduleRepository.findByTherapistId(therapistId);

    const [appointments, holds, activeSeries] = await Promise.all([
      appointmentRepository.findScheduledByTherapistInRange(
        therapistId,
        from,
        to
      ),
      holdRepository.findActiveByTherapistInRange(therapistId, from, to),
      seriesRepository.findActiveByTherapistId(therapistId),
    ]);

    const blocked: { startAt: Date; endAt: Date }[] = [
      ...appointments.map((a) => ({ startAt: a.startAt, endAt: a.endAt })),
      ...holds.map((h) => ({ startAt: h.startAt, endAt: h.endAt })),
    ];

    for (const series of activeSeries) {
      const projected = projectSeriesOccurrences(series, from, to);
      for (const occ of projected) {
        const alreadyMaterialized = appointments.some(
          (a) =>
            a.seriesId === series.id &&
            a.startAt.getTime() === occ.startAt.getTime()
        );
        if (!alreadyMaterialized) blocked.push(occ);
      }
    }

    const slots: AvailableSlot[] = [];
    let currentKey = getDateKeyInAppTz(from);
    const endKey = getDateKeyInAppTz(to);

    while (currentKey <= endKey) {
      const dow = getDayOfWeekFromDateKey(currentKey);
      const daySchedules = schedules.filter((s) => s.dayOfWeek === dow);

      for (const sched of daySchedules) {
        const startAt = combineDateKeyAndTime(currentKey, sched.startTime);
        const endAt = combineDateKeyAndTime(currentKey, sched.endTime);

        if (startAt < from || startAt > to) continue;
        if (startAt <= new Date()) continue;

        const conflict = blocked.some((b) =>
          rangesOverlap(startAt, endAt, b.startAt, b.endAt)
        );

        if (!conflict) {
          slots.push({
            therapistId,
            startAt: startAt.toISOString(),
            endAt: endAt.toISOString(),
          });
        }
      }

      currentKey = addDaysToDateKey(currentKey, 1);
    }

    return slots.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  },
};
