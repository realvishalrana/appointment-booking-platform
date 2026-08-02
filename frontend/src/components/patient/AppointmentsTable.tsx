import StatusNotes from "../common/StatusNotes";
import { Appointment } from "../../types";
import { formatDateTime } from "../../utils/format";

interface AppointmentsTableProps {
  appointments: Appointment[];
  onCancel: (id: number) => void;
}

export default function PatientAppointmentsTable({
  appointments,
  onCancel,
}: AppointmentsTableProps) {
  if (appointments.length === 0) {
    return <p style={{ color: "#6b7280" }}>No appointments yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Therapist</th>
          <th>Type</th>
          <th>Status</th>
          <th>Notes</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {appointments.map((a) => (
          <tr key={a.id}>
            <td>{formatDateTime(a.startAt)}</td>
            <td>{a.therapist?.name}</td>
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
              {a.status === "scheduled" && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onCancel(a.id)}
                >
                  Cancel
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
