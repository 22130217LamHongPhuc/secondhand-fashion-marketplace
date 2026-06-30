import { useEffect, useState } from "react";
import { customerPromotionService } from "@/services/promotionService";
import { toastService } from "@/services/toastService";
import { Ticket, Clock, Check, Loader2 } from "lucide-react";

export default function ShopPromotions({ shopId }) {
  const [promotions, setPromotions] = useState([]);
  const [claimedIds, setClaimedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const loadPromotionsAndWallet = async () => {
      try {
        // 1. Fetch available promotions of the shop
        const promoData = await customerPromotionService.getShopPromotions(shopId, 0, 50);
        if (!isMounted) return;
        setPromotions(promoData.content || promoData.items || []);

        // 2. Fetch my wallet to check which ones are already claimed
        if (localStorage.getItem("token")) {
          const walletData = await customerPromotionService.getMyWallet(0, 100);
          if (!isMounted) return;
          const claimed = new Set(
            (walletData.content || walletData.items || [])
              .map((item) => item.promotion?.id)
              .filter(Boolean)
          );
          setClaimedIds(claimed);
        }
      } catch (err) {
        console.error("Failed to load promotions", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadPromotionsAndWallet();

    return () => {
      isMounted = false;
    };
  }, [shopId]);

  const handleClaim = async (promotionId) => {
    if (!localStorage.getItem("token")) {
      toastService.info("Vui lòng đăng nhập để lưu mã giảm giá.");
      return;
    }

    setClaimingId(promotionId);
    try {
      await customerPromotionService.claimPromotion(promotionId);
      toastService.success("Lưu mã giảm giá thành công!");
      setClaimedIds((prev) => {
        const next = new Set(prev);
        next.add(promotionId);
        return next;
      });
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err?.message || "Lưu mã giảm giá thất bại.";
      toastService.error(errorMsg);
    } finally {
      setClaimingId(null);
    }
  };

  const formatVnd = (value) => {
    if (!value) return "0đ";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="mx-8 mt-6 flex items-center gap-2 rounded-2xl bg-white/60 p-4 text-xs font-semibold text-[#7c7565]">
        <Loader2 className="animate-spin" size={14} />
        Đang tải khuyến mãi từ shop...
      </div>
    );
  }

  if (promotions.length === 0) return null;

  return (
    <section className="mx-8 mt-8">
      <div className="mb-4 flex items-center gap-2">
        <Ticket size={20} className="text-[#b84a25]" />
        <h3 className="text-lg font-extrabold text-[#3d3a2c]">Khuyến mãi từ tiệm</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {promotions.map((promo) => {
          const isClaimed = claimedIds.has(promo.id);
          const isPercent = promo.discountType === "PERCENTAGE";

          return (
            <div
              key={promo.id}
              className="flex items-stretch overflow-hidden rounded-xl border border-[#e7dfbd] bg-white shadow-xs"
            >
              {/* Left Ticket Part */}
              <div className="flex w-24 flex-col items-center justify-center bg-[#fffbf2] border-r border-dashed border-[#e7dfbd] px-2 text-center relative">
                {/* Upper Half Circle Cutout */}
                <div className="absolute top-0 right-[-6px] h-3 w-3 rounded-full bg-[#fbfae6] border-b border-[#e7dfbd]" />
                {/* Lower Half Circle Cutout */}
                <div className="absolute bottom-0 right-[-6px] h-3 w-3 rounded-full bg-[#fbfae6] border-t border-[#e7dfbd]" />

                <span className="text-xs font-extrabold uppercase tracking-wider text-[#9a907a] scale-90">
                  GIẢM
                </span>
                <span className="mt-0.5 text-xl font-black text-[#b84a25]">
                  {isPercent ? `${Math.round(promo.discountValue)}%` : formatVnd(promo.discountValue).replace(/\s?₫/, "")}
                  {!isPercent && <span className="text-[10px] font-black">đ</span>}
                </span>
              </div>

              {/* Right Ticket Part */}
              <div className="flex flex-1 flex-col justify-between p-3.5">
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-extrabold text-sm text-[#3d3a2c] line-clamp-1">
                      {promo.name}
                    </h4>
                    <span className="rounded bg-[#faf4dd] px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-[#7a7058]">
                      {promo.code}
                    </span>
                  </div>

                  <p className="mt-1 text-[11px] text-[#766f60]">
                    Đơn tối thiểu: <span className="font-bold">{formatVnd(promo.minOrderValue)}</span>
                  </p>
                  
                  {isPercent && promo.maxDiscountAmount && (
                    <p className="text-[10px] text-[#9a907a]">
                      Tối đa: {formatVnd(promo.maxDiscountAmount)}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#fcfbf7] pt-2">
                  <div className="flex items-center gap-1 text-[10px] text-[#9c927b]">
                    <Clock size={11} />
                    <span>HSD: {formatDate(promo.endDate)}</span>
                  </div>

                  <button
                    onClick={() => handleClaim(promo.id)}
                    disabled={isClaimed || claimingId === promo.id}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition duration-150 cursor-pointer ${
                      isClaimed
                        ? "bg-[#e2f0d9] text-[#385623] cursor-not-allowed"
                        : "bg-[#b84a25] text-white hover:bg-[#9e3a1b]"
                    }`}
                  >
                    {claimingId === promo.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : isClaimed ? (
                      <>
                        <Check size={11} />
                        Đã lưu
                      </>
                    ) : (
                      "Lưu mã"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
