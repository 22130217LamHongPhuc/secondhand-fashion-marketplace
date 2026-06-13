export default function OrderDetailSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-40 animate-pulse rounded-3xl border border-[#e7dfbd] bg-white" />
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="h-96 animate-pulse rounded-2xl border border-[#e7dfbd] bg-white" />
        <div className="space-y-5">
          <div className="h-52 animate-pulse rounded-2xl border border-[#e7dfbd] bg-white" />
          <div className="h-52 animate-pulse rounded-2xl border border-[#e7dfbd] bg-white" />
        </div>
      </div>
    </div>
  );
}
