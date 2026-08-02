import ScheduleSkeleton from "../components/common/ScheduleSkeleton";
import TableSkeleton from "../components/common/TableSkeleton";
import TabBar from "../components/common/TabBar";
import TherapistAppointmentsTable from "../components/therapist/AppointmentsTable";
import ScheduleEditor from "../components/therapist/ScheduleEditor";
import StatusUpdateModal from "../components/therapist/StatusUpdateModal";
import { useTherapistPortal } from "../hooks/useTherapistPortal";

const TABS = [
  { id: "appointments" as const, label: "Appointments" },
  { id: "schedule" as const, label: "My Schedule" },
];

export default function TherapistDashboard() {
  const {
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
  } = useTherapistPortal();

  return (
    <div className="container">
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === "appointments" && (
        <div className="card">
          <h3 style={{ marginBottom: "1rem" }}>Assigned Appointments</h3>
          {appointmentsLoading ? (
            <TableSkeleton columns={6} />
          ) : (
            <TherapistAppointmentsTable
              appointments={appointments}
              onStatusUpdate={openStatusUpdate}
            />
          )}
        </div>
      )}

      {tab === "schedule" &&
        (scheduleLoading ? (
          <ScheduleSkeleton />
        ) : (
          <ScheduleEditor
            schedule={schedule}
            duplicateIndices={duplicateIndices}
            saving={saving}
            onChange={handleScheduleChange}
            onAdd={addScheduleRow}
            onRemove={removeScheduleRow}
            onSave={saveSchedule}
          />
        ))}

      <StatusUpdateModal
        open={statusUpdateTarget !== null}
        appointment={statusUpdateTarget?.appointment ?? null}
        status={statusUpdateTarget?.status ?? null}
        onClose={closeStatusUpdate}
        onConfirm={confirmStatusUpdate}
      />
    </div>
  );
}
