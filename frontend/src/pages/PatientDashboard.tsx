import TabBar from "../components/common/TabBar";
import SlotGridSkeleton from "../components/common/SlotGridSkeleton";
import TableSkeleton from "../components/common/TableSkeleton";
import CancelAppointmentModal from "../components/patient/CancelAppointmentModal";
import PatientAppointmentsTable from "../components/patient/AppointmentsTable";
import ConfirmBookingForm from "../components/patient/ConfirmBookingForm";
import HoldBanner from "../components/patient/HoldBanner";
import SeriesTable from "../components/patient/SeriesTable";
import SlotGrid from "../components/patient/SlotGrid";
import { usePatientBooking } from "../hooks/usePatientBooking";

const TABS = [
  { id: "book" as const, label: "Book Appointment" },
  { id: "appointments" as const, label: "My Appointments" },
  { id: "series" as const, label: "Recurring Series" },
];

export default function PatientDashboard() {
  const {
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
  } = usePatientBooking();

  const cancelTitle =
    cancelTarget?.type === "series"
      ? "Cancel recurring series?"
      : "Cancel appointment?";

  const cancelConfirmLabel =
    cancelTarget?.type === "series" ? "Cancel Series" : "Cancel Appointment";

  return (
    <div className="container">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {hold && !expired && <HoldBanner hold={hold} seconds={seconds} />}

      {tab === "book" && (
        <>
          {hold && !expired && (
            <ConfirmBookingForm
              bookingType={bookingType}
              frequency={frequency}
              confirming={confirming}
              expired={expired}
              onTypeChange={setBookingType}
              onFrequencyChange={setFrequency}
              onConfirm={handleConfirm}
            />
          )}
          <div className="card">
            <h3 style={{ marginBottom: "1rem" }}>Available Slots</h3>
            <label>Therapist</label>
            <select
              value={selectedTherapist ?? ""}
              onChange={(e) => selectTherapist(Number(e.target.value))}
              disabled={holdActive}
            >
              {therapists.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            {holdActive && (
              <p className="field-hint">
                Complete or let your hold expire to change therapist.
              </p>
            )}
            {slotsLoading ? (
              <SlotGridSkeleton />
            ) : (
              <SlotGrid
                slots={slots}
                hold={hold}
                expired={expired}
                loading={slotsLoading}
                onHold={handleHold}
              />
            )}
          </div>
        </>
      )}

      {tab === "appointments" && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>My Appointments</h3>
          {appointmentsLoading ? (
            <TableSkeleton columns={6} />
          ) : (
            <PatientAppointmentsTable
              appointments={appointments}
              onCancel={openCancelAppointment}
            />
          )}
        </div>
      )}

      {tab === "series" && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>Recurring Series</h3>
          {seriesLoading ? (
            <TableSkeleton columns={7} />
          ) : (
            <SeriesTable series={series} onCancel={openCancelSeries} />
          )}
        </div>
      )}

      <CancelAppointmentModal
        open={cancelTarget !== null}
        title={cancelTitle}
        confirmLabel={cancelConfirmLabel}
        onClose={closeCancelModal}
        onConfirm={confirmCancel}
      />
    </div>
  );
}
