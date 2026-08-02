import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import { Appointment, AppointmentStatus, ScheduleWindow } from "../types";
import {
  findDuplicateRowIndices,
  validateScheduleWindows,
} from "../utils/scheduleValidation";
import { normalizeScheduleTime } from "../utils/format";

type Tab = "appointments" | "schedule";

export interface StatusUpdateTarget {
  appointment: Appointment;
  status: AppointmentStatus;
}

export function useTherapistPortal() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("appointments");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [schedule, setSchedule] = useState<ScheduleWindow[]>([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusUpdateTarget, setStatusUpdateTarget] =
    useState<StatusUpdateTarget | null>(null);

  const duplicateIndices = useMemo(
    () => findDuplicateRowIndices(schedule),
    [schedule]
  );

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const res = await api.getTherapistAppointments();
      setAppointments(res.appointments);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load");
    } finally {
      setAppointmentsLoading(false);
    }
  }, [toast]);

  const loadSchedule = useCallback(async () => {
    setScheduleLoading(true);
    try {
      const res = await api.getTherapistSchedule();
      setSchedule(res.schedule);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load schedule");
    } finally {
      setScheduleLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (tab === "appointments") loadAppointments();
    if (tab === "schedule") loadSchedule();
  }, [tab, loadAppointments, loadSchedule]);

  const openStatusUpdate = (appointment: Appointment, status: AppointmentStatus) => {
    setStatusUpdateTarget({ appointment, status });
  };

  const closeStatusUpdate = () => setStatusUpdateTarget(null);

  const confirmStatusUpdate = async (payload: {
    cancellationReason?: string;
    noShowNotes?: string;
  }) => {
    if (!statusUpdateTarget) return;
    const { appointment, status } = statusUpdateTarget;
    try {
      await api.updateAppointmentStatus(appointment.id, status, payload);
      toast.success(`Status updated to ${status}`);
      await loadAppointments();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Update failed");
      throw err;
    }
  };

  const handleScheduleChange = (
    index: number,
    field: keyof ScheduleWindow,
    value: string | number
  ) => {
    setSchedule((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addScheduleRow = () => {
    setSchedule((prev) => [
      ...prev,
      { dayOfWeek: 1, startTime: "09:00:00", endTime: "09:30:00" },
    ]);
  };

  const removeScheduleRow = (index: number) => {
    setSchedule((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSchedule = async () => {
    const validationError = validateScheduleWindows(schedule);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setSaving(true);
    try {
      const res = await api.updateTherapistSchedule(
        schedule.map(({ dayOfWeek, startTime, endTime }) => ({
          dayOfWeek,
          startTime: normalizeScheduleTime(startTime),
          endTime: normalizeScheduleTime(endTime),
        }))
      );
      setSchedule(res.schedule);
      toast.success("Schedule updated. Existing bookings are unaffected.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return {
    tab,
    setTab,
    appointments,
    schedule,
    appointmentsLoading,
    scheduleLoading,
    saving,
    duplicateIndices,
    statusUpdateTarget,
    openStatusUpdate,
    closeStatusUpdate,
    confirmStatusUpdate,
    handleScheduleChange,
    addScheduleRow,
    removeScheduleRow,
    saveSchedule,
  };
}
