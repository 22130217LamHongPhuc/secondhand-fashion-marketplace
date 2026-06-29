export default function ProductCardSkeleton() {
  return (
    <article className="overflow-hidden rounded-3xl bg-white p-3 shadow-sm ring-1 ring-black/5">
      <div className="relative overflow-hidden rounded-2xl bg-[#eee8c9] h-40 w-full animate-pulse" />
      <div className="px-1 py-4 space-y-2">
        {/* Brand */}
        <div className="h-3 w-1/3 rounded bg-[#eee8c9] animate-pulse" />
        {/* Title */}
        <div className="h-5 w-4/5 rounded bg-[#eee8c9] animate-pulse" />
        {/* Bottom row */}
        <div className="mt-3 flex items-end justify-between gap-3 pt-2">
          {/* Price */}
          <div className="h-6 w-24 rounded bg-[#eee8c9] animate-pulse" />
          {/* Tag / Old price */}
          <div className="h-4 w-12 rounded bg-[#eee8c9] animate-pulse" />
        </div>
      </div>
    </article>
  );
}
