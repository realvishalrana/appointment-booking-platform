import { Slot, Hold } from "../../types";
import { formatDateTime } from "../../utils/format";

interface SlotGridProps {
  slots: Slot[];
  hold: Hold | null;
  expired: boolean;
  loading: boolean;
  onHold: (slot: Slot) => void;
}

export default function SlotGrid({
  slots,
  hold,
  expired,
  loading,
  onHold,
}: SlotGridProps) {
  if (slots.length === 0) {
    return <p style={{ color: "#6b7280" }}>No available slots in the next 14 days.</p>;
  }

  return (
    <div className="slot-grid">
      {slots.map((slot) => {
        const isHeld = hold?.startAt === slot.startAt && !expired;
        return (
          <button
            key={slot.startAt}
            className={`slot-btn ${isHeld ? "selected" : ""}`}
            onClick={() => onHold(slot)}
            disabled={loading || (!!hold && !expired && !isHeld)}
          >
            <div style={{ fontWeight: 600 }}>{formatDateTime(slot.startAt)}</div>
            <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>
              to{" "}
              {new Date(slot.endAt).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
