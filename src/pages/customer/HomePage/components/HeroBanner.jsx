import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HeroBanner({ banners = [], loading }) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Handle auto-play
  useEffect(() => {
    if (loading || banners.length <= 1 || isHovered) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners, loading, isHovered]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const handleDotClick = (index, e) => {
    e.stopPropagation();
    setCurrent(index);
  };

  const handleBannerClick = (linkUrl) => {
    if (!linkUrl) return;
    if (linkUrl.startsWith("http://") || linkUrl.startsWith("https://")) {
      window.open(linkUrl, "_blank", "noopener,noreferrer");
    } else {
      navigate(linkUrl);
    }
  };

  // 1. Loading / Skeleton State
  if (loading) {
    return (
      <section className="relative overflow-hidden rounded-[28px] bg-stone-100 h-[60vh] w-full animate-pulse shadow-sm border border-stone-200/50">
        <div className="absolute inset-0 bg-gradient-to-r from-stone-200 via-stone-150 to-stone-200" />
        <div className="absolute bottom-10 left-8 md:left-12 space-y-4 max-w-lg">
          <div className="h-4 w-32 rounded bg-stone-300" />
          <div className="h-10 w-80 rounded bg-stone-300" />
          <div className="h-6 w-96 rounded bg-stone-300" />
          <div className="h-12 w-40 rounded bg-stone-300" />
        </div>
      </section>
    );
  }

  // 2. Fallback State (No banners created yet)
  if (!banners || banners.length === 0) {
    return (
      <section className="relative overflow-hidden rounded-[28px] bg-slate-900 shadow-md">
        <img
          src="https://images.unsplash.com/photo-1483985988355-763728e1935b?q=75&w=1200&auto=format&fit=crop"
          alt="Vintage fashion"
          className="h-[60vh] w-full object-cover opacity-90"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="max-w-xl px-8 md:px-12">
            <span className="inline-flex rounded-full bg-lime-100 px-4 py-2 text-xs font-black uppercase tracking-wide text-green-800 shadow-sm">
              Mới nhất trong tuần
            </span>

            <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              Thời trang <br />
              có gu, ví nhẹ nhàng.
            </h1>

            <p className="mt-4 max-w-md text-base font-medium leading-7 text-white/80">
              Nơi hội của cộng đồng yêu đồ siêu rẻ, săn deal vintage độc bản tại Việt Nam.
            </p>

            <div className="mt-7 flex flex-wrap gap-4">
              <button 
                onClick={() => navigate("/shops")}
                className="rounded-xl bg-[#ff7043] px-8 py-4 text-sm font-black text-white shadow-lg shadow-orange-950/20 transition hover:bg-[#f45d2d] hover:shadow-xl active:scale-[0.98]"
              >
                Khám phá ngay
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 3. Carousel Banner State
  return (
    <section 
      className="relative overflow-hidden rounded-[28px] bg-stone-950 h-[60vh] w-full group shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      {banners.map((banner, index) => {
        const isCurrent = index === current;
        return (
          <div
            key={banner.id}
            onClick={() => handleBannerClick(banner.linkUrl)}
            className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer ${
              isCurrent 
                ? "opacity-100 scale-100 z-10" 
                : "opacity-0 scale-105 pointer-events-none z-0"
            }`}
          >
            {/* Image */}
            <img
              src={banner.imageUrl}
              alt={banner.title || "Banner"}
              className="h-full w-full object-cover"
            />
            
            {/* Ambient Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

            {/* Content Container */}
            <div className="absolute inset-0 flex items-center">
              <div className={`max-w-xl px-8 md:px-12 transition-all duration-750 ease-out transform ${
                isCurrent ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              }`}>
                {banner.title && (
                  <h2 className="text-3xl font-black leading-tight tracking-tight text-white md:text-5xl drop-shadow-sm">
                    {banner.title}
                  </h2>
                )}
                
                {banner.subtitle && (
                  <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-white/85 drop-shadow-sm">
                    {banner.subtitle}
                  </p>
                )}

                {banner.linkUrl && (
                  <div className="mt-6">
                    <button className="rounded-xl bg-[#ff7043] px-6 py-3.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-lg shadow-orange-950/20 transition-all hover:bg-[#f45d2d] hover:shadow-xl active:scale-[0.97]">
                      Xem Chi Tiết
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation Controls (Only show if multiple banners) */}
      {banners.length > 1 && (
        <>
          {/* Left Arrow */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all flex items-center justify-center border-none opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
            title="Slide trước"
          >
            <ChevronLeft size={22} />
          </button>

          {/* Right Arrow */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all flex items-center justify-center border-none opacity-0 group-hover:opacity-100 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
            title="Slide sau"
          >
            <ChevronRight size={22} />
          </button>

          {/* Indicators Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 bg-black/15 px-3 py-2 rounded-full backdrop-blur-sm">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => handleDotClick(index, e)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer border-none p-0 ${
                  index === current 
                    ? "w-6 bg-white" 
                    : "w-2 bg-white/40 hover:bg-white/60"
                }`}
                title={`Chuyển tới slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
