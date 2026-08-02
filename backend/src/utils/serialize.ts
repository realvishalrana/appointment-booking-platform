import { Appointment } from "@prisma/client";

type AppointmentWithRelations = Appointment & {
  therapist?: { id: number; name: string } | null;
  patient?: { id: number; name: string; email: string } | null;
  series?: { id: number; frequency: string; status: string } | null;
};

export function serializeAppointment(a: AppointmentWithRelations) {
  return {
    id: a.id,
    therapist: a.therapist ?? undefined,
    patient: a.patient ?? undefined,
    series: a.series ?? null,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    status: a.status,
    cancellationReason: a.cancellationReason,
    noShowNotes: a.noShowNotes,
  };
}
