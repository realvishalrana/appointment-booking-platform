import StatusNotes from "../common/StatusNotes";
import { Appointment, AppointmentStatus } from "../../types";
import { formatAppointmentStatus, formatDateTime } from "../../utils/format";

const STATUS_ACTIONS: AppointmentStatus[] = [
  "completed",
  "no_show",
  "cancelled",
];

function therapistActionHint(appointment: Appointment): string {
  if (appointment.status !== "scheduled") {
    return "Status recorded";
  }

  const now = Date.now();
  const start = new Date(appointment.startAt).getTime();
  const end = new Date(appointment.endAt).getTime();

  if (appointment.canUpdateStatus) {
    if (now > end) {
      return "Late update — please record status soon";
    }
    return "";
  }
  if (now < start) {
    return "Available when the appointment starts";
  }
  return "Update period has ended";
}

interface TherapistAppointmentsTableProps {
  appointments: Appointment[];
  onStatusUpdate: (appointment: Appointment, status: AppointmentStatus) => void;
}

export default function TherapistAppointmentsTable({
  appointments,
  onStatusUpdate,
}: TherapistAppointmentsTableProps) {
  if (appointments.length === 0) {
    return <p style={{ color: "#6b7280" }}>No appointments yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Patient</th>
          <th>Type</th>
          <th>Status</th>
          <th>Notes</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((a) => {
          const hint = therapistActionHint(a);
          const showActions =
            a.canUpdateStatus && a.status === "scheduled";

          return (
            <tr key={a.id}>
              <td>{formatDateTime(a.startAt)}</td>
              <td>{a.patient?.name}</td>
              <td>
                {a.series ? `Recurring (${a.series.frequency})` : "One-time"}
              </td>
              <td>
                <span className={`badge badge-${a.status}`}>
                  {formatAppointmentStatus(a.status)}
                </span>
              </td>
              <td>
                {a.status === "cancelled" || a.status === "no_show" ? (
                  <StatusNotes appointment={a} />
                ) : (
                  <span className="status-notes-empty">—</span>
                )}
              </td>
              <td>
                {showActions ? (
                  <div className="status-btns">
                    {hint ? (
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#d97706",
                          marginBottom: "0.35rem",
                        }}
                      >
                        {hint}
                      </p>
                    ) : null}
                    {STATUS_ACTIONS.map((s) => (
                      <button
                        key={s}
                        className="btn btn-sm btn-secondary"
                        onClick={() => onStatusUpdate(a, s)}
                      >
                        {formatAppointmentStatus(s)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                    {hint}
                  </span>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
