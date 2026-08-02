import { config } from "../config";

export function parseDateInTz(dateStr: string): Date {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    throw new Error("Invalid date");
  }
  return d;
}

export function formatInTz(date: Date): string {
  return date.toLocaleString("en-IN", {
    timeZone: config.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTimezoneOffsetInMs(timeZone: string, date: Date): number {
  const utcParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const tzParts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const toMs = (parts: Intl.DateTimeFormatPart[]) => {
    const get = (type: string) =>
      parseInt(parts.find((p) => p.type === type)!.value, 10);
    return Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second")
    );
  };

  return toMs(tzParts) - toMs(utcParts);
}

/** Calendar date (YYYY-MM-DD) in the app timezone */
export function getDateKeyInAppTz(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: config.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")!.value;
  const month = parts.find((p) => p.type === "month")!.value;
  const day = parts.find((p) => p.type === "day")!.value;
  return `${year}-${month}-${day}`;
}

export function getDayOfWeekFromDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDaysToDateKey(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + days));
  return getDateKey(next);
}

/** @deprecated use getDateKeyInAppTz */
export function getDayOfWeek(date: Date): number {
  return getDayOfWeekFromDateKey(getDateKeyInAppTz(date));
}

/**
 * Combine a calendar date + wall-clock time in APP_TIMEZONE into a UTC Date.
 * e.g. 2026-08-03 + 13:30:00 IST -> 2026-08-03T08:00:00.000Z
 */
export function combineDateAndTime(date: Date, timeStr: string): Date {
  return combineDateKeyAndTime(getDateKeyInAppTz(date), timeStr);
}

export function combineDateKeyAndTime(dateKey: string, timeStr: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  const [h, mi, s] = timeStr.split(":").map((v) => parseInt(v, 10));
  const naiveUtc = new Date(Date.UTC(y, m - 1, d, h, mi, s || 0));
  const offset = getTimezoneOffsetInMs(config.timezone, naiveUtc);
  return new Date(naiveUtc.getTime() - offset);
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCMonth(result.getUTCMonth() + months);
  if (result.getUTCDate() < day) {
    result.setUTCDate(0);
  }
  return result;
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

export function addWeeks(date: Date, weeks: number): Date {
  return addDays(date, weeks * 7);
}

export function startOfDayUtc(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

export function endOfDayUtc(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );
}

export function isWithinWindow(now: Date, start: Date, end: Date): boolean {
  return now >= start && now <= end;
}

/** Therapist may update status during the session or within grace after it ends */
export function canUpdateAppointmentStatus(
  now: Date,
  start: Date,
  end: Date,
  graceMs: number
): boolean {
  if (now < start) return false;
  const deadline = new Date(end.getTime() + graceMs);
  return now <= deadline;
}

export function getDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function rangesOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
