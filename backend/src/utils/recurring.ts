import { RecurrenceFrequency } from "@prisma/client";
import { config } from "../config";
import {
  addDays,
  addMonths,
  addWeeks,
  rangesOverlap,
} from "./time";

export interface SlotCandidate {
  therapistId: number;
  startAt: Date;
  endAt: Date;
}

export function generateRecurringOccurrences(
  anchorStart: Date,
  anchorEnd: Date,
  frequency: RecurrenceFrequency,
  horizonEnd: Date
): { startAt: Date; endAt: Date }[] {
  const durationMs = anchorEnd.getTime() - anchorStart.getTime();
  const occurrences: { startAt: Date; endAt: Date }[] = [];
  let current = new Date(anchorStart);

  while (current <= horizonEnd) {
    occurrences.push({
      startAt: new Date(current),
      endAt: new Date(current.getTime() + durationMs),
    });

    switch (frequency) {
      case "daily":
        current = addDays(current, 1);
        break;
      case "weekly":
        current = addWeeks(current, 1);
        break;
      case "biweekly":
        current = addWeeks(current, 2);
        break;
      case "monthly":
        current = addMonths(current, 1);
        break;
    }
  }

  return occurrences;
}

export function getHorizonEnd(from: Date): Date {
  return addMonths(from, config.recurringHorizonMonths);
}

export function filterConflictingOccurrences(
  occurrences: { startAt: Date; endAt: Date }[],
  blocked: { startAt: Date; endAt: Date }[]
): { startAt: Date; endAt: Date }[] {
  return occurrences.filter(
    (occ) =>
      !blocked.some((b) =>
        rangesOverlap(occ.startAt, occ.endAt, b.startAt, b.endAt)
      )
  );
}

export function projectSeriesOccurrences(
  series: {
    frequency: RecurrenceFrequency;
    startAt: Date;
    endAt: Date;
  },
  rangeStart: Date,
  rangeEnd: Date
): { startAt: Date; endAt: Date }[] {
  const all = generateRecurringOccurrences(
    series.startAt,
    series.endAt,
    series.frequency,
    rangeEnd
  );
  return all.filter((o) => o.startAt >= rangeStart && o.startAt <= rangeEnd);
}
