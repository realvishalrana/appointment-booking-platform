interface SlotGridSkeletonProps {
  count?: number;
}

export default function SlotGridSkeleton({ count = 6 }: SlotGridSkeletonProps) {
  return (
    <div className="slot-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton skeleton-slot" />
      ))}
    </div>
  );
}
