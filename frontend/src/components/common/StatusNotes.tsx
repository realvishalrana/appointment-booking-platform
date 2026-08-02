import { Appointment } from "../../types";

export default function StatusNotes({ appointment }: { appointment: Appointment }) {
  if (appointment.status === "cancelled" && appointment.cancellationReason) {
    return (
      <div className="status-notes">{appointment.cancellationReason}</div>
    );
  }
  if (appointment.status === "no_show" && appointment.noShowNotes) {
    return <div className="status-notes">{appointment.noShowNotes}</div>;
  }
  return <span className="status-notes-empty">—</span>;
}
