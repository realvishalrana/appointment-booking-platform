import { RecurringSeries } from "../../types";
import { formatDateTime } from "../../utils/format";

interface SeriesTableProps {
  series: RecurringSeries[];
  onCancel: (id: number) => void;
}

export default function SeriesTable({ series, onCancel }: SeriesTableProps) {
  if (series.length === 0) {
    return <p style={{ color: "#6b7280" }}>No recurring series yet.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Therapist</th>
          <th>Frequency</th>
          <th>Start</th>
          <th>Status</th>
          <th>Notes</th>
          <th>Appointments</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {series.map((s) => (
          <tr key={s.id}>
            <td>{s.therapist.name}</td>
            <td>{s.frequency}</td>
            <td>{formatDateTime(s.startAt)}</td>
            <td>
              <span
                className={`badge badge-${s.status === "active" ? "scheduled" : "cancelled"}`}
              >
                {s.status}
              </span>
            </td>
            <td>
              {s.status === "cancelled" && s.cancellationReason ? (
                <div className="status-notes">{s.cancellationReason}</div>
              ) : (
                <span className="status-notes-empty">—</span>
              )}
            </td>
            <td>{s.appointmentCount}</td>
            <td>
              {s.status === "active" && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => onCancel(s.id)}
                >
                  Cancel Series
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
