export function ProductDetailSkeleton() {
  return (
    <div className="space-y-10">
      {/* Upper Section: Gallery & Info */}
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        
        {/* Product Gallery Skeleton */}
        <div className="flex gap-5">
          {/* Thumbnails list (md and up) */}
          <div className="hidden w-16 flex-col gap-4 md:flex">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-16 w-16 rounded-xl bg-[#eee8c9] animate-pulse"
              />
            ))}
          </div>

          {/* Main active image */}
          <div className="aspect-[4/3] flex-1 overflow-hidden rounded-3xl bg-[#eee8c9] animate-pulse shadow-sm" />
        </div>

        {/* Product Info Panel Skeleton */}
        <aside className="space-y-6">
          <div>
            {/* Badges / Category / Stock status */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <div className="h-6 w-20 rounded-full bg-[#eee8c9] animate-pulse" />
              <div className="h-6 w-24 rounded-full bg-[#eee8c9] animate-pulse" />
              <div className="h-6 w-28 rounded-full bg-[#eee8c9] animate-pulse" />
            </div>

            {/* Product Title */}
            <div className="h-8 w-4/5 rounded bg-[#eee8c9] animate-pulse mt-4" />

            {/* Price & Old Price */}
            <div className="mt-4 flex items-end gap-3">
              <div className="h-7 w-32 rounded bg-[#eee8c9] animate-pulse" />
              <div className="h-5 w-20 rounded bg-[#eee8c9] animate-pulse" />
            </div>
          </div>

          {/* Shop information block */}
          <div className="rounded-2xl border border-[#ebe2c8] bg-[#faf7e7] p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-[#eee8c9] animate-pulse shrink-0" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-[#eee8c9] animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-[#eee8c9] animate-pulse" />
              </div>

              <div className="h-4 w-12 rounded bg-[#eee8c9] animate-pulse" />
            </div>
          </div>

          {/* Call to Actions (Chat, Add, Buy) */}
          <div className="space-y-3 pt-8">
            <div className="h-12 w-full rounded-xl bg-[#eee8c9] animate-pulse" />
            <div className="h-14 w-full rounded-xl bg-[#eee8c9] animate-pulse" />
            <div className="h-14 w-full rounded-xl bg-[#eee8c9] animate-pulse" />
          </div>

          {/* Shipping & return info */}
          <div className="flex gap-6 pt-2">
            <div className="h-4 w-28 rounded bg-[#eee8c9] animate-pulse" />
            <div className="h-4 w-28 rounded bg-[#eee8c9] animate-pulse" />
          </div>
        </aside>
      </section>

      {/* Product Bottom Content (Tabs & Description) Skeleton */}
      <section className="mt-8 border-t border-[#ebe2c8] pt-8">
        {/* Tabs navigation bar */}
        <div className="flex border-b border-[#e7dfbd] gap-8 pb-3">
          <div className="h-4 w-16 rounded bg-[#eee8c9] animate-pulse" />
          <div className="h-4 w-20 rounded bg-[#eee8c9] animate-pulse" />
          <div className="h-4 w-24 rounded bg-[#eee8c9] animate-pulse" />
          <div className="h-4 w-24 rounded bg-[#eee8c9] animate-pulse" />
        </div>

        {/* Tab content placeholder */}
        <div className="py-6 space-y-3">
          <div className="h-4 w-full rounded bg-[#eee8c9] animate-pulse" />
          <div className="h-4 w-full rounded bg-[#eee8c9] animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-[#eee8c9] animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-[#eee8c9] animate-pulse" />
        </div>
      </section>

      {/* Similar Products Skeleton */}
      <section className="mt-14">
        {/* Section title */}
        <div className="h-6 w-44 rounded bg-[#eee8c9] animate-pulse mb-5" />

        {/* Small card grid */}
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-sm flex flex-col"
            >
              <div className="aspect-[4/3] w-full bg-[#eee8c9] animate-pulse" />
              <div className="p-4 space-y-2 flex-1">
                <div className="h-4 w-12 rounded bg-[#eee8c9] animate-pulse" />
                <div className="h-4 w-4/5 rounded bg-[#eee8c9] animate-pulse" />
                <div className="mt-2 h-4 w-16 rounded bg-[#eee8c9] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
