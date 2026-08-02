interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 5,
  columns = 5,
}: TableSkeletonProps) {
  return (
    <div className="table-skeleton" aria-hidden="true">
      <div className="table-skeleton-header">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton skeleton-cell" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="table-skeleton-row">
          {Array.from({ length: columns }).map((_, col) => (
            <div key={col} className="skeleton skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
}
