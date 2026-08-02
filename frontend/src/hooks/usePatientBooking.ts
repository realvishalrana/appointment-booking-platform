import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useHoldCountdown } from "./useHoldCountdown";
import {
  Appointment,
  Hold,
  RecurrenceFrequency,
  RecurringSeries,
  Slot,
  Therapist,
} from "../types";
import { getDateRange } from "../utils/format";

type Tab = "book" | "appointments" | "series";

export type CancelTarget =
  | { type: "appointment"; id: number }
  | { type: "series"; id: number };

export function usePatientBooking() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("book");
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<number | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [hold, setHold] = useState<Hold | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [series, setSeries] = useState<RecurringSeries[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [seriesLoading, setSeriesLoading] = useState(false);
  const [bookingType, setBookingType] = useState<"one_time" | "recurring">("one_time");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("weekly");
  const [confirming, setConfirming] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null);
  const therapistsLoaded = useRef(false);

  const { seconds, expired } = useHoldCountdown(hold?.expiresAt ?? null);
  const holdActive = !!hold && !expired;

  const loadHold = useCallback(async () => {
    try {
      const res = await api.getMyHold();
      setHold(res.hold);
      if (res.hold) {
        setSelectedTherapist(res.hold.therapistId);
      }
      return res.hold;
    } catch {
      return null;
    }
  }, []);

  const loadSlots = useCallback(
    async (therapistId: number) => {
      setSlotsLoading(true);
      try {
        const { from, to } = getDateRange(14);
        const res = await api.getSlots(therapistId, from, to);
        setSlots(res.slots);
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : "Failed to load slots");
      } finally {
        setSlotsLoading(false);
      }
    },
    [toast]
  );

  const loadBookTabData = useCallback(async () => {
    try {
      if (!therapistsLoaded.current) {
        const res = await api.getTherapists();
        setTherapists(res.therapists);
        therapistsLoaded.current = true;
        if (!hold && res.therapists.length > 0) {
          setSelectedTherapist((prev) => prev ?? res.therapists[0].id);
        }
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load therapists");
    }
  }, [hold, toast]);

  const loadAppointments = useCallback(async () => {
    setAppointmentsLoading(true);
    try {
      const res = await api.getMyAppointments();
      setAppointments(res.appointments);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load appointments");
    } finally {
      setAppointmentsLoading(false);
    }
  }, [toast]);

  const loadSeries = useCallback(async () => {
    setSeriesLoading(true);
    try {
      const res = await api.getMySeries();
      setSeries(res.series);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to load series");
    } finally {
      setSeriesLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadHold();
  }, [loadHold]);

  useEffect(() => {
    if (tab === "book") {
      loadBookTabData();
    } else if (tab === "appointments") {
      loadAppointments();
    } else if (tab === "series") {
      loadSeries();
    }
  }, [tab, loadBookTabData, loadAppointments, loadSeries]);

  useEffect(() => {
    if (tab === "book" && selectedTherapist) {
      loadSlots(selectedTherapist);
    }
  }, [tab, selectedTherapist, loadSlots]);

  useEffect(() => {
    if (expired && hold) {
      setHold(null);
      toast.error("Your hold has expired. Please select a slot again.");
      if (tab === "book" && selectedTherapist) {
        loadSlots(selectedTherapist);
      }
    }
  }, [expired, hold, tab, selectedTherapist, loadSlots, toast]);

  const selectTherapist = (id: number) => {
    if (holdActive) return;
    setSelectedTherapist(id);
  };

  const handleHold = async (slot: Slot) => {
    setSlotsLoading(true);
    try {
      const res = await api.createHold(slot.therapistId, slot.startAt, slot.endAt);
      setHold(res.hold);
      setSelectedTherapist(res.hold.therapistId);
      if (tab === "book") await loadSlots(res.hold.therapistId);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Failed to hold slot. It may have been taken."
      );
      if (tab === "book" && selectedTherapist) loadSlots(selectedTherapist);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!hold || expired) return;
    setConfirming(true);
    try {
      await api.confirmBooking(
        bookingType,
        bookingType === "recurring" ? frequency : undefined
      );
      toast.success(
        bookingType === "one_time"
          ? "Appointment booked successfully!"
          : `Recurring ${frequency} series booked successfully!`
      );
      setHold(null);
      if (tab === "book" && selectedTherapist) loadSlots(selectedTherapist);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Booking failed");
    } finally {
      setConfirming(false);
    }
  };

  const openCancelAppointment = (id: number) => {
    setCancelTarget({ type: "appointment", id });
  };

  const openCancelSeries = (id: number) => {
    setCancelTarget({ type: "series", id });
  };

  const closeCancelModal = () => setCancelTarget(null);

  const confirmCancel = async (reason: string) => {
    if (!cancelTarget) return;
    try {
      if (cancelTarget.type === "appointment") {
        await api.cancelAppointment(cancelTarget.id, reason);
        if (tab === "appointments") await loadAppointments();
        toast.success("Appointment cancelled");
      } else {
        await api.cancelSeries(cancelTarget.id, reason);
        if (tab === "series") await loadSeries();
        toast.success("Series cancelled");
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Cancel failed");
      throw err;
    }
  };

  return {
    tab,
    setTab,
    therapists,
    selectedTherapist,
    selectTherapist,
    slots,
    hold,
    holdActive,
    appointments,
    series,
    slotsLoading,
    appointmentsLoading,
    seriesLoading,
    bookingType,
    setBookingType,
    frequency,
    setFrequency,
    confirming,
    seconds,
    expired,
    cancelTarget,
    handleHold,
    handleConfirm,
    openCancelAppointment,
    openCancelSeries,
    closeCancelModal,
    confirmCancel,
  };
}
