import type {
  User,
  Therapist,
  Slot,
  Hold,
  Appointment,
  RecurringSeries,
  ScheduleWindow,
} from "../types";

const API_BASE = import.meta.env.VITE_API_URL || "";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error || "Request failed", res.status);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => request<{ user: User }>("/api/auth/me"),

  getTherapists: () =>
    request<{ therapists: Therapist[] }>("/api/therapists"),

  getSlots: (therapistId: number, from: string, to: string) =>
    request<{ slots: Slot[] }>(
      `/api/therapists/${therapistId}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    ),

  createHold: (therapistId: number, startAt: string, endAt: string) =>
    request<{ hold: Hold }>("/api/holds", {
      method: "POST",
      body: JSON.stringify({ therapistId, startAt, endAt }),
    }),

  getMyHold: () => request<{ hold: Hold | null }>("/api/holds/me"),

  releaseHold: () =>
    request<{ message: string }>("/api/holds/me", { method: "DELETE" }),

  confirmBooking: (
    type: "one_time" | "recurring",
    frequency?: string,
    idempotencyKey?: string
  ) =>
    request<unknown>("/api/bookings", {
      method: "POST",
      headers: {
        "Idempotency-Key": idempotencyKey || crypto.randomUUID(),
      },
      body: JSON.stringify({ type, frequency }),
    }),

  getMyAppointments: () =>
    request<{ appointments: Appointment[] }>("/api/bookings/me"),

  cancelAppointment: (id: number, reason: string) =>
    request<{ appointment: { id: number; status: string } }>(
      `/api/bookings/${id}`,
      { method: "DELETE", body: JSON.stringify({ reason }) }
    ),

  getMySeries: () =>
    request<{ series: RecurringSeries[] }>("/api/series/me"),

  cancelSeries: (id: number, reason: string) =>
    request<{ id: number; status: string }>(`/api/series/${id}`, {
      method: "DELETE",
      body: JSON.stringify({ reason }),
    }),

  getTherapistAppointments: () =>
    request<{ appointments: Appointment[] }>("/api/therapist/appointments"),

  updateAppointmentStatus: (
    id: number,
    status: string,
    options?: { cancellationReason?: string; noShowNotes?: string }
  ) =>
    request<{ appointment: { id: number; status: string } }>(
      `/api/therapist/appointments/${id}/status`,
      {
        method: "PATCH",
        body: JSON.stringify({ status, ...options }),
      }
    ),

  getTherapistSchedule: () =>
    request<{ schedule: ScheduleWindow[] }>("/api/therapist/schedule"),

  updateTherapistSchedule: (windows: ScheduleWindow[]) =>
    request<{ schedule: ScheduleWindow[] }>("/api/therapist/schedule", {
      method: "PUT",
      body: JSON.stringify({ windows }),
    }),
};

export { ApiError };
