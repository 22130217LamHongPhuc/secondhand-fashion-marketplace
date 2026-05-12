export default function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-slate-900">
      <img
        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1600&auto=format&fit=crop"
        alt="Vintage fashion"
        className="h-[70vh] w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-xl px-8 md:px-12">
          <span className="inline-flex rounded-full bg-lime-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-green-800">
            Mới nhất trong tuần
          </span>

          <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
            Thời trang <br />
            có gu, ví nhẹ nhàng.
          </h1>

          <p className="mt-4 max-w-md text-base font-medium leading-7 text-white/85">
            Nơi hội của cộng đồng yêu đồ siêu rẻ, săn deal vintage độc bản tại
            Việt Nam.
          </p>

          <div className="mt-7 flex flex-wrap gap-4">
            <button className="rounded-xl bg-[#ff7043] px-8 py-4 text-sm font-black text-white shadow-lg shadow-orange-900/20 transition hover:bg-[#f45d2d]">
              Khám phá ngay
            </button>

            <button className="rounded-xl bg-white/20 px-8 py-4 text-sm font-black text-white backdrop-blur-md transition hover:bg-white/30">
              Xem xu hướng
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
