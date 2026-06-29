import { useState, useEffect } from "react";
import { Gift, Tag, Sparkles, Clock, Check, Calendar, ArrowRight } from "lucide-react";
import { toastService } from "@/services/toastService";

export default function PromotionsSection({ campaigns = [], coupons = [], loading }) {
  const [savedCoupons, setSavedCoupons] = useState([]);
  const [savedCampaigns, setSavedCampaigns] = useState([]);

  // Load saved codes from localStorage
  useEffect(() => {
    try {
      const savedC = JSON.parse(localStorage.getItem("savedCoupons") || "[]");
      const savedCamp = JSON.parse(localStorage.getItem("savedCampaigns") || "[]");
      setSavedCoupons(savedC);
      setSavedCampaigns(savedCamp);
    } catch (e) {
      console.error("Failed to read saved promotions", e);
    }
  }, []);

  const handleSaveCoupon = (code) => {
    if (savedCoupons.includes(code)) return;
    const newSaved = [...savedCoupons, code];
    setSavedCoupons(newSaved);
    localStorage.setItem("savedCoupons", JSON.stringify(newSaved));
    toastService.success(`Đã lưu mã giảm giá ${code} thành công!`);
  };

  const handleSaveCampaign = (id, name) => {
    if (savedCampaigns.includes(id)) return;
    const newSaved = [...savedCampaigns, id];
    setSavedCampaigns(newSaved);
    localStorage.setItem("savedCampaigns", JSON.stringify(newSaved));
    toastService.success(`Bạn đã tham gia chiến dịch "${name}"!`);
  };

  const formatVnd = (value) => {
    if (!value) return "0 đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const hasPromotions = campaigns.length > 0 || coupons.length > 0;

  if (loading) {
    return (
      <div className="mt-10 space-y-12">
        {/* Campaigns Skeleton */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-[2px] w-8 rounded-full bg-[#c65a2e]" />
                <div className="h-3 w-16 rounded bg-[#eee8c9] animate-pulse" />
              </div>
              <div className="mt-1 h-8 w-60 rounded bg-[#eee8c9] animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm"
              >
                <div className="relative h-48 w-full bg-[#eee8c9] animate-pulse" />
                <div className="p-6 space-y-3">
                  <div className="h-5 w-1/2 rounded bg-[#eee8c9] animate-pulse" />
                  <div className="h-3.5 w-full rounded bg-[#eee8c9] animate-pulse" />
                  <div className="h-3.5 w-3/4 rounded bg-[#eee8c9] animate-pulse" />
                  <div className="mt-4 pt-4 border-t border-[#f2ece4] flex items-center justify-between">
                    <div className="h-4 w-28 rounded bg-[#eee8c9] animate-pulse" />
                    <div className="h-8 w-28 rounded-xl bg-[#eee8c9] animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Coupons Skeleton */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-[2px] w-8 rounded-full bg-[#c65a2e]" />
                <div className="h-3 w-16 rounded bg-[#eee8c9] animate-pulse" />
              </div>
              <div className="mt-1 h-8 w-60 rounded bg-[#eee8c9] animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="flex items-stretch overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm h-36"
              >
                {/* Left voucher stub skeleton */}
                <div className="w-28 bg-[#eee8c9] animate-pulse shrink-0 relative flex items-center justify-center">
                  <div className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#fbfae6] border-l border-[#e8dfd5]" />
                </div>
                {/* Right voucher body skeleton */}
                <div className="flex-1 p-5 flex flex-col justify-between pl-6 space-y-2 relative">
                  <div className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#fbfae6] border-r border-[#e8dfd5]" />
                  <div className="h-4 w-16 rounded bg-[#eee8c9] animate-pulse" />
                  <div className="h-4 w-3/4 rounded bg-[#eee8c9] animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-[#eee8c9] animate-pulse" />
                  <div className="mt-4 flex items-center justify-between border-t border-[#f2ece4] pt-3">
                    <div className="h-3 w-12 rounded bg-[#eee8c9] animate-pulse" />
                    <div className="h-6 w-16 rounded-lg bg-[#eee8c9] animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (!hasPromotions) return null;

  return (
    <div className="mt-10 space-y-12">
      {/* 1. CAMPAIGNS SECTION */}
      {campaigns.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-[2px] w-8 rounded-full bg-[#c65a2e]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c65a2e]">
                  Campaigns
                </p>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[#3f392f]">
                Chiến dịch Hot đang chạy
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {campaigns.map((camp) => {
              const isSaved = camp.isAutoSave || savedCampaigns.includes(camp.id);
              return (
                <div
                  key={camp.id}
                  className="group relative overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Campaign Banner or Fallback Premium Gradient */}
                  <div className="relative h-48 w-full bg-gradient-to-r from-[#fce8d8] to-[#f6f0d4]">
                    {camp.bannerUrl ? (
                      <img
                        src={camp.bannerUrl}
                        alt={camp.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-[#c85a28]">
                        <Sparkles size={64} className="opacity-30" />
                      </div>
                    )}
                    
                    {/* Auto apply indicator */}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm ${camp.isAutoSave ? "bg-[#388e3c]" : "bg-[#f57c00]"}`}>
                        {camp.isAutoSave ? "⚡ Tự động áp dụng" : "🔑 Tự tham gia"}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-extrabold text-[#3f392f] group-hover:text-[#c65a2e] transition">
                      {camp.name}
                    </h3>
                    <p className="mt-2 text-sm text-[#7c7565] line-clamp-2">
                      {camp.description || "Tham gia ngay để nhận ưu đãi mua sắm đồ secondhand cực chất!"}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-[#9b6e4e]">
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Hạn: {new Date(camp.endDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-[#f2ece4] pt-4">
                      {camp.isAutoSave ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#2e7d32]">
                          <Check size={16} /> Đã áp dụng toàn sàn
                        </span>
                      ) : isSaved ? (
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-[#2e7d32]">
                          <Check size={16} /> Đã lưu tham gia
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSaveCampaign(camp.id, camp.name)}
                          className="flex items-center gap-2 rounded-xl bg-[#c65a2e] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#a84920]"
                        >
                          Tham gia ngay <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. COUPONS SECTION */}
      {coupons.length > 0 && (
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="h-[2px] w-8 rounded-full bg-[#c65a2e]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c65a2e]">
                  Vouchers
                </p>
              </div>
              <h2 className="text-3xl font-black tracking-tight text-[#3f392f]">
                Ví mã giảm giá siêu hời
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => {
              const isSaved = coupon.isAutoSave || savedCoupons.includes(coupon.code);
              const discountText =
                coupon.discountType === "PERCENTAGE"
                  ? `${coupon.discountValue}%`
                  : formatVnd(coupon.discountValue);

              return (
                <div
                  key={coupon.id}
                  className="flex items-stretch overflow-hidden rounded-2xl border border-[#e8dfd5] bg-white shadow-sm hover:shadow-md transition"
                >
                  {/* Left voucher ticket stub */}
                  <div className="flex flex-col items-center justify-center bg-gradient-to-b from-[#c65a2e] to-[#a84920] px-4 py-6 text-white text-center w-28 flex-shrink-0 relative">
                    <Gift size={28} className="mb-2" />
                    <span className="text-lg font-black tracking-tight leading-tight">
                      {discountText}
                    </span>
                    <span className="text-[10px] opacity-90 mt-1 uppercase tracking-wider font-semibold">
                      GIẢM GIÁ
                    </span>

                    {/* Ticket notch effect */}
                    <div className="absolute top-1/2 -right-2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#fbfae6] border-l border-[#e8dfd5]" />
                  </div>

                  {/* Right voucher ticket body */}
                  <div className="flex-1 p-5 flex flex-col justify-between pl-6 relative">
                    {/* Opposite notch */}
                    <div className="absolute top-1/2 -left-2 h-4 w-4 -translate-y-1/2 rounded-full bg-[#fbfae6] border-r border-[#e8dfd5]" />

                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold bg-[#fce8d8] text-[#c85a28] px-2 py-0.5 rounded border border-[#f0e1cf]">
                          {coupon.code}
                        </span>
                        {coupon.isAutoSave && (
                          <span className="text-[10px] font-bold text-[#2e7d32] bg-[#e8f5e9] px-1.5 py-0.5 rounded">
                            Tự động
                          </span>
                        )}
                      </div>
                      <h4 className="mt-2 text-sm font-extrabold text-[#3f392f] line-clamp-1">
                        {coupon.name}
                      </h4>
                      <p className="mt-1 text-xs text-[#7c7565] line-clamp-2">
                        {coupon.description || `Đơn tối thiểu ${formatVnd(coupon.minOrderValue)}.`}
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[#f2ece4] pt-3">
                      <div className="flex items-center gap-1 text-[10px] text-[#9b6e4e]">
                        <Clock size={12} />
                        <span>Hạn: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</span>
                      </div>

                      {coupon.isAutoSave ? (
                        <button
                          disabled
                          className="rounded-lg bg-[#e8f5e9] px-3 py-1 text-xs font-bold text-[#2e7d32] flex items-center gap-1"
                        >
                          <Check size={12} /> Áp dụng
                        </button>
                      ) : isSaved ? (
                        <button
                          disabled
                          className="rounded-lg bg-[#e8f5e9] px-3 py-1 text-xs font-bold text-[#2e7d32] flex items-center gap-1"
                        >
                          <Check size={12} /> Đã lưu
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSaveCoupon(coupon.code)}
                          className="rounded-lg bg-[#c65a2e] px-3 py-1 text-xs font-bold text-white hover:bg-[#a84920] transition"
                        >
                          Lưu mã
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
