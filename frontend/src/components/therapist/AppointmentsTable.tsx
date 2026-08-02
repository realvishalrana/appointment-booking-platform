import StatusNotes from "../common/StatusNotes";
import { Appointment, AppointmentStatus } from "../../types";
import { formatDateTime } from "../../utils/format";

const STATUS_OPTIONS: AppointmentStatus[] = [
  "completed",
  "no_show",
  "cancelled",
];

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
        {appointments.map((a) => (
          <tr key={a.id}>
            <td>{formatDateTime(a.startAt)}</td>
            <td>{a.patient?.name}</td>
            <td>
              {a.series ? `Recurring (${a.series.frequency})` : "One-time"}
            </td>
            <td>
              <span className={`badge badge-${a.status}`}>{a.status}</span>
            </td>
            <td>
              {a.status === "cancelled" || a.status === "no_show" ? (
                <StatusNotes appointment={a} />
              ) : (
                <span className="status-notes-empty">—</span>
              )}
            </td>
            <td>
              {a.canUpdateStatus && a.status === "scheduled" ? (
                <div className="status-btns">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      className="btn btn-sm btn-secondary"
                      onClick={() => onStatusUpdate(a, s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : a.canUpdateStatus ? (
                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                  Status recorded
                </span>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>
                  Status editable during appointment window
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
