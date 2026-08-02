import { ScheduleWindow } from "../../types";
import ScheduleRow from "./ScheduleRow";

interface ScheduleEditorProps {
  schedule: ScheduleWindow[];
  duplicateIndices: Set<number>;
  saving: boolean;
  onChange: (index: number, field: keyof ScheduleWindow, value: string | number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onSave: () => void;
}

export default function ScheduleEditor({
  schedule,
  duplicateIndices,
  saving,
  onChange,
  onAdd,
  onRemove,
  onSave,
}: ScheduleEditorProps) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: "1rem" }}>Weekly Schedule</h3>
      <p style={{ color: "#6b7280", marginBottom: "1rem", fontSize: "0.9rem" }}>
        Changes apply to future availability only. Existing bookings are not
        affected.
      </p>
      {schedule.map((row, i) => (
        <ScheduleRow
          key={i}
          row={row}
          index={i}
          isDuplicate={duplicateIndices.has(i)}
          onChange={onChange}
          onRemove={onRemove}
        />
      ))}
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
        <button type="button" className="btn btn-secondary" onClick={onAdd}>
          Add Window
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onSave}
          disabled={saving || schedule.length === 0}
        >
          {saving ? "Saving..." : "Save Schedule"}
        </button>
      </div>
    </div>
  );
}
