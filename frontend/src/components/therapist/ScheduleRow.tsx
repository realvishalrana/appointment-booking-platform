import { ScheduleWindow } from "../../types";
import { DAY_NAMES } from "../../utils/format";

interface ScheduleRowProps {
  row: ScheduleWindow;
  index: number;
  isDuplicate: boolean;
  onChange: (index: number, field: keyof ScheduleWindow, value: string | number) => void;
  onRemove: (index: number) => void;
}

export default function ScheduleRow({
  row,
  index,
  isDuplicate,
  onChange,
  onRemove,
}: ScheduleRowProps) {
  return (
    <div className={`schedule-row ${isDuplicate ? "schedule-row--duplicate" : ""}`}>
      <select
        value={row.dayOfWeek}
        onChange={(e) => onChange(index, "dayOfWeek", Number(e.target.value))}
      >
        {DAY_NAMES.map((name, idx) => (
          <option key={idx} value={idx}>
            {name}
          </option>
        ))}
      </select>
      <input
        type="time"
        step="1"
        value={row.startTime.slice(0, 5)}
        onChange={(e) => onChange(index, "startTime", `${e.target.value}:00`)}
      />
      <input
        type="time"
        step="1"
        value={row.endTime.slice(0, 5)}
        onChange={(e) => onChange(index, "endTime", `${e.target.value}:00`)}
      />
      <button
        type="button"
        className="btn btn-danger btn-sm schedule-row__remove"
        onClick={() => onRemove(index)}
      >
        Remove
      </button>
    </div>
  );
}
