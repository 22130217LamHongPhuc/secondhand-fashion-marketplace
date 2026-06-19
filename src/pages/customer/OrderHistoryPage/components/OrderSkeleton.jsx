export default function OrderSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm">
      <div className="flex animate-pulse gap-4">
        <div className="h-24 w-20 rounded-xl bg-[#eee8c9]" />
        <div className="flex-1 space-y-3">
          <div className="h-4 w-2/5 rounded bg-[#eee8c9]" />
          <div className="h-5 w-3/5 rounded bg-[#eee8c9]" />
          <div className="h-4 w-1/3 rounded bg-[#eee8c9]" />
        </div>
        <div className="hidden h-8 w-28 rounded-full bg-[#eee8c9] sm:block" />
      </div>
    </div>
  );
}
