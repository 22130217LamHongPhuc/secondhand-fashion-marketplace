const TableSkeleton = ({ columns = 6, rows = 5 }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-neutral-100">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, rIndex) => (
            <tr key={rIndex} className="border-b border-neutral-50">
              {Array.from({ length: columns }).map((_, cIndex) => (
                <td key={cIndex} className="px-6 py-5">
                  <div className="flex flex-col gap-2">
                    {cIndex === 0 ? (
                      <div className="h-16 w-16 animate-pulse rounded-xl bg-neutral-200"></div>
                    ) : (
                      <>
                        <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200"></div>
                        {cIndex === 1 && <div className="h-3 w-1/2 animate-pulse rounded bg-neutral-100"></div>}
                      </>
                    )}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableSkeleton;
