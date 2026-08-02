import { RecurrenceFrequency } from "../../types";

interface ConfirmBookingFormProps {
  bookingType: "one_time" | "recurring";
  frequency: RecurrenceFrequency;
  confirming: boolean;
  expired: boolean;
  onTypeChange: (type: "one_time" | "recurring") => void;
  onFrequencyChange: (frequency: RecurrenceFrequency) => void;
  onConfirm: () => void;
}

export default function ConfirmBookingForm({
  bookingType,
  frequency,
  confirming,
  expired,
  onTypeChange,
  onFrequencyChange,
  onConfirm,
}: ConfirmBookingFormProps) {
  return (
    <div className="card">
      <h3 style={{ marginBottom: "1rem" }}>Confirm Booking</h3>
      <label>Booking type</label>
      <select
        value={bookingType}
        onChange={(e) => onTypeChange(e.target.value as "one_time" | "recurring")}
      >
        <option value="one_time">One-time</option>
        <option value="recurring">Recurring</option>
      </select>
      {bookingType === "recurring" && (
        <>
          <label>Frequency</label>
          <select
            value={frequency}
            onChange={(e) =>
              onFrequencyChange(e.target.value as RecurrenceFrequency)
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </>
      )}
      <button
        className="btn btn-primary"
        onClick={onConfirm}
        disabled={confirming || expired}
      >
        {confirming ? "Confirming..." : "Confirm Booking"}
      </button>
    </div>
  );
}
