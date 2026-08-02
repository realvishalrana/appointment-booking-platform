import { FormEvent, useEffect, useState } from "react";

interface CancelAppointmentModalProps {
  open: boolean;
  title: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export default function CancelAppointmentModal({
  open,
  title,
  confirmLabel = "Cancel",
  onClose,
  onConfirm,
}: CancelAppointmentModalProps) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  useEffect(() => {
    if (open) {
      setReason("");
      setSubmitting(false);
      setShowValidation(false);
    }
  }, [open]);

  if (!open) return null;

  const trimmed = reason.trim();
  const isValid = trimmed.length >= 3;

  const handleBlur = () => {
    if (trimmed.length > 0 && trimmed.length < 3) {
      setShowValidation(true);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setShowValidation(true);
      return;
    }
    setSubmitting(true);
    try {
      await onConfirm(trimmed);
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
        aria-labelledby="cancel-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="cancel-modal-title" style={{ marginBottom: "1rem" }}>
          {title}
        </h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="cancel-reason">Reason for cancellation *</label>
          <textarea
            id="cancel-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={handleBlur}
            rows={4}
            placeholder="Please provide a reason (min. 3 characters)"
            maxLength={500}
            aria-invalid={showValidation && !isValid}
            aria-describedby="cancel-reason-hint cancel-reason-error"
          />
          <p id="cancel-reason-hint" className="field-hint">
            Minimum 3 characters
          </p>
          {showValidation && !isValid && (
            <p id="cancel-reason-error" className="field-error" role="alert">
              Please enter at least 3 characters.
            </p>
          )}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Keep
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={submitting}
            >
              {submitting ? "Cancelling..." : confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
