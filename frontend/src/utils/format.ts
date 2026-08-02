export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const APP_TIMEZONE =
  import.meta.env.VITE_APP_TIMEZONE || "Asia/Kolkata";

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    timeZone: APP_TIMEZONE,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/** Normalize browser time input to HH:MM:SS for the API */
export function normalizeScheduleTime(value: string): string {
  const parts = value.split(":");
  const h = parts[0]?.padStart(2, "0") ?? "00";
  const m = parts[1]?.padStart(2, "0") ?? "00";
  const s = (parts[2] ?? "00").padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/** Display HH:MM:SS (or corrupted HH:MM:SS:SS) in <input type="time"> */
export function scheduleTimeToInputValue(time: string): string {
  const parts = time.split(":");
  if (parts.length < 2) return "00:00";
  return `${parts[0]}:${parts[1]}`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    timeZone: APP_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getDateRange(days: number): { from: string; to: string } {
  const from = new Date();
  const to = new Date();
  to.setUTCDate(to.getUTCDate() + days);
  return { from: from.toISOString(), to: to.toISOString() };
}
