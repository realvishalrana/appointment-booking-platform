export interface ScheduleWindowInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function windowsOverlap(a: ScheduleWindowInput, b: ScheduleWindowInput): boolean {
  if (a.dayOfWeek !== b.dayOfWeek) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function validateScheduleWindows(windows: ScheduleWindowInput[]): string | null {
  if (windows.length === 0) {
    return "Schedule must have at least one window";
  }

  for (const w of windows) {
    if (timeToMinutes(w.startTime) >= timeToMinutes(w.endTime)) {
      return `Invalid time range on ${DAY_NAMES[w.dayOfWeek]}: start must be before end`;
    }
  }

  for (let i = 0; i < windows.length; i++) {
    for (let j = i + 1; j < windows.length; j++) {
      const a = windows[i];
      const b = windows[j];
      if (
        a.dayOfWeek === b.dayOfWeek &&
        a.startTime === b.startTime &&
        a.endTime === b.endTime
      ) {
        return `Duplicate schedule window on ${DAY_NAMES[a.dayOfWeek]} (${a.startTime} - ${a.endTime})`;
      }
      if (windowsOverlap(a, b)) {
        return `Overlapping windows on ${DAY_NAMES[a.dayOfWeek]}`;
      }
    }
  }

  return null;
}

export function findDuplicateRowIndices(
  windows: ScheduleWindowInput[]
): Set<number> {
  const duplicates = new Set<number>();
  for (let i = 0; i < windows.length; i++) {
    for (let j = i + 1; j < windows.length; j++) {
      const a = windows[i];
      const b = windows[j];
      if (
        (a.dayOfWeek === b.dayOfWeek &&
          a.startTime === b.startTime &&
          a.endTime === b.endTime) ||
        windowsOverlap(a, b)
      ) {
        duplicates.add(i);
        duplicates.add(j);
      }
    }
  }
  return duplicates;
}
