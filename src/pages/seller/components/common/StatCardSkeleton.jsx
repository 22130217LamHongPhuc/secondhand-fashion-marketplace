const StatCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="h-3 w-24 animate-pulse rounded bg-neutral-200"></div>
            <div className="h-6 w-12 animate-pulse rounded-full bg-neutral-200"></div>
          </div>
          <div className="mt-3 h-8 w-32 animate-pulse rounded bg-neutral-200"></div>
          <div className="mt-5 flex items-end gap-2 h-12">
            {Array.from({ length: 7 }).map((_, j) => (
              <div key={j} className="flex-1 h-full animate-pulse rounded-sm bg-neutral-100"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatCardSkeleton;
