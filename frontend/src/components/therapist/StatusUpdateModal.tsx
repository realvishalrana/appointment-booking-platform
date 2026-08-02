import { FormEvent, useEffect, useState } from "react";
import { Appointment, AppointmentStatus } from "../../types";
import { formatDateTime } from "../../utils/format";

interface StatusUpdateModalProps {
  open: boolean;
  appointment: Appointment | null;
  status: AppointmentStatus | null;
  onClose: () => void;
  onConfirm: (payload: {
    cancellationReason?: string;
    noShowNotes?: string;
  }) => Promise<void>;
}

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: "Mark as Scheduled",
  completed: "Mark as Completed",
  no_show: "Mark as Missed Appointment",
  cancelled: "Cancel Appointment",
};

export default function StatusUpdateModal({
  open,
  appointment,
  status,
  onClose,
  onConfirm,
}: StatusUpdateModalProps) {
  const [cancellationReason, setCancellationReason] = useState("");
  const [noShowNotes, setNoShowNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (open) {
      setCancellationReason("");
      setNoShowNotes("");
      setSubmitting(false);
      setShowValidation(false);
    }
  }, [open, status]);

  if (!open || !appointment || !status) return null;

  const needsCancelReason = status === "cancelled";
  const allowsNoShowNotes = status === "no_show";
  const trimmedReason = cancellationReason.trim();
  const reasonValid = !needsCancelReason || trimmedReason.length >= 3;

  const handleReasonBlur = () => {
    if (needsCancelReason && trimmedReason.length > 0 && trimmedReason.length < 3) {
      setShowValidation(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!reasonValid) {
      setShowValidation(true);
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm({
        ...(needsCancelReason
          ? { cancellationReason: trimmedReason }
          : {}),
        ...(allowsNoShowNotes && noShowNotes.trim()
          ? { noShowNotes: noShowNotes.trim() }
          : {}),
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="status-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="status-modal-title" style={{ marginBottom: "0.5rem" }}>
          {STATUS_LABELS[status]}
        </h3>
        <p className="modal-summary">
          {appointment.patient?.name} · {formatDateTime(appointment.startAt)}
        </p>
        <form onSubmit={handleSubmit}>
          {needsCancelReason && (
            <>
              <label htmlFor="cancellation-reason">
                Reason for cancellation *
              </label>
              <textarea
                id="cancellation-reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                onBlur={handleReasonBlur}
                rows={4}
                placeholder="Please provide a reason (min. 3 characters)"
                maxLength={500}
                aria-invalid={showValidation && !reasonValid}
                aria-describedby="cancellation-reason-hint cancellation-reason-error"
              />
              <p id="cancellation-reason-hint" className="field-hint">
                Minimum 3 characters
              </p>
              {showValidation && !reasonValid && (
                <p
                  id="cancellation-reason-error"
                  className="field-error"
                  role="alert"
                >
                  Please enter at least 3 characters.
                </p>
              )}
            </>
          )}
          {allowsNoShowNotes && (
            <>
              <label htmlFor="no-show-notes">No-show notes (optional)</label>
              <textarea
                id="no-show-notes"
                value={noShowNotes}
                onChange={(e) => setNoShowNotes(e.target.value)}
                rows={3}
                placeholder="e.g. Patient did not join the call"
                maxLength={500}
              />
            </>
          )}
          {!needsCancelReason && !allowsNoShowNotes && (
            <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
              Confirm this status change for the appointment.
            </p>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
