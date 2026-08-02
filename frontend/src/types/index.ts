export type UserRole = "patient" | "therapist";

export type RecurrenceFrequency = "daily" | "weekly" | "biweekly" | "monthly";

export type AppointmentStatus =
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export interface Therapist {
  id: number;
  name: string;
  email: string;
}

export interface Slot {
  therapistId: number;
  startAt: string;
  endAt: string;
}

export interface Hold {
  id: number;
  therapistId: number;
  therapist?: Therapist;
  startAt: string;
  endAt: string;
  expiresAt: string;
}

export interface Appointment {
  id: number;
  therapist?: { id: number; name: string };
  patient?: { id: number; name: string; email: string };
  series?: { id: number; frequency: RecurrenceFrequency; status: string } | null;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  cancellationReason?: string | null;
  noShowNotes?: string | null;
  canUpdateStatus?: boolean;
}

export interface RecurringSeries {
  id: number;
  therapist: { id: number; name: string };
  frequency: RecurrenceFrequency;
  status: string;
  cancellationReason?: string | null;
  startAt: string;
  endAt: string;
  appointmentCount: number;
}

export interface ScheduleWindow {
  id?: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}
