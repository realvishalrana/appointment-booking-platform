interface ScheduleSkeletonProps {
  rows?: number;
}

export default function ScheduleSkeleton({ rows = 3 }: ScheduleSkeletonProps) {
  return (
    <div className="card" aria-hidden="true">
      <div className="skeleton skeleton-title" style={{ marginBottom: "1rem" }} />
      <div className="skeleton skeleton-text" style={{ marginBottom: "1rem" }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="schedule-skeleton-row">
          <div className="skeleton skeleton-cell" />
          <div className="skeleton skeleton-cell" />
          <div className="skeleton skeleton-cell" />
          <div className="skeleton skeleton-cell-sm" />
        </div>
      ))}
    </div>
  );
}
