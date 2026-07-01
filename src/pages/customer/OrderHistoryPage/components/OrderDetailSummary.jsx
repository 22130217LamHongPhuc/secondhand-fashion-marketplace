import { useState } from "react";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../constants";
import { formatVnd } from "../utils";
import { 
  CreditCard, 
  Coins, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Loader2
} from "lucide-react";
import { customerOrderService } from "@/services/customerOrder";
import { toastService } from "@/services/toastService";

const METHOD_DETAILS = {
  WALLET: {
    bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
    icon: CreditCard,
  },
  COD: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    icon: Coins,
  },
  BANK_TRANSFER: {
    bg: "bg-sky-50 text-sky-700 border-sky-200",
    icon: Building2,
  },
};

const STATUS_DETAILS = {
  UNPAID: {
    bg: "bg-rose-50 text-rose-700 border-rose-200",
    icon: XCircle,
  },
  PAID: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: CheckCircle2,
  },
  REFUNDED: {
    bg: "bg-slate-50 text-slate-600 border-slate-200",
    icon: RefreshCw,
  },
};

export default function OrderDetailSummary({ order }) {
  const [paying, setPaying] = useState(false);
  const methodKey = (order.paymentMethod || "").toUpperCase();
  
  const currentPaymentStatus = order.status === "DONE" ? "PAID" : order.paymentStatus;
  const statusKey = (currentPaymentStatus || "").toUpperCase();

  const canRepay =
    order.status === "PENDING" &&
    order.paymentMethod === "WALLET" &&
    order.paymentStatus !== "PAID";

  const handleRepay = async () => {
    setPaying(true);
    try {
      const storedUser = localStorage.getItem("user");
      let customerId = null;
      if (storedUser) {
        customerId = JSON.parse(storedUser).userId;
      }
      const result = await customerOrderService.repay({
        customerId,
        orderId: order.id,
      });
      if (result?.paymentUrl) {
        toastService.success("Đang chuyển hướng sang cổng thanh toán VNPay...");
        setTimeout(() => {
          window.location.href = result.paymentUrl;
        }, 1000);
      } else {
        toastService.error("Không tạo được link thanh toán VNPay. Vui lòng thử lại.");
      }
    } catch (err) {
      console.error(err);
      toastService.error(err?.message || "Thanh toán lại thất bại. Vui lòng thử lại.");
    } finally {
      setPaying(false);
    }
  };

  const paymentMethod =
    PAYMENT_METHOD_LABELS[order.paymentMethod] ||
    order.paymentMethod ||
    "Thanh toán";
  const paymentStatus =
    PAYMENT_STATUS_LABELS[currentPaymentStatus] || currentPaymentStatus || "";

  const methodDetail = METHOD_DETAILS[methodKey] || {
    bg: "bg-neutral-50 text-neutral-700 border-neutral-200",
    icon: Coins,
  };

  const statusDetail = STATUS_DETAILS[statusKey] || {
    bg: "bg-neutral-50 text-neutral-700 border-neutral-200",
    icon: CheckCircle2,
  };

  const MethodIcon = methodDetail.icon;
  const StatusIcon = statusDetail.icon;

  return (
    <section className="rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#3d3a2c]">Thanh toán</h2>

      <div className="mt-5 space-y-3 text-sm font-semibold text-[#766f60]">
        <div className="flex justify-between gap-4">
          <span>Tạm tính</span>
          <span className="text-[#3d3a2c]">{formatVnd(order.subtotal)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span>Phí vận chuyển</span>
          <span className="text-[#3d3a2c]">{formatVnd(order.shippingFee)}</span>
        </div>
        {order.discountAmount > 0 && (
          <div className="flex justify-between gap-4 items-center">
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5">
                Giảm giá
                {order.couponInfo?.source === "ADMIN_COUPON" && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-sm font-bold">Mã hệ thống</span>
                )}
                {(order.couponInfo?.source === "SHOP_COUPON" || order.couponInfo?.source === "SHOP_VOUCHER") && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-sm font-bold">Voucher tiệm</span>
                )}
              </span>
              {order.couponInfo?.code && (
                <span className="text-xs text-[#8a826f] mt-0.5 font-normal">
                  Mã: <strong className="font-extrabold text-[#3d3a2c]">{order.couponInfo.code}</strong> {order.couponInfo.name ? `(${order.couponInfo.name})` : ""}
                </span>
              )}
            </div>
            <span className="text-emerald-600 font-bold">-{formatVnd(order.discountAmount)}</span>
          </div>
        )}
        <div className="border-t border-[#f0e7c8] pt-3">
          <div className="flex justify-between gap-4">
            <span className="text-base font-black text-[#3d3a2c]">
              Tổng thanh toán
            </span>
            <span className="text-xl font-black text-[#b84a25]">
              {formatVnd(order.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-[#ebdcb3]/60 bg-[#fffdf9] p-4 text-sm font-semibold">
        <div className="grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3">
          <span className="text-[#888173] font-medium">Phương thức</span>
          <span className={`justify-self-end inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold leading-none shadow-2xs ${methodDetail.bg}`}>
            <MethodIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="min-w-0 truncate whitespace-nowrap text-right">{paymentMethod}</span>
          </span>
        </div>
        {paymentStatus ? (
          <div className="mt-3 grid grid-cols-[96px_minmax(0,1fr)] items-center gap-3 border-t border-[#f3ebce] pt-3">
            <span className="text-[#888173] font-medium">Trạng thái</span>
            <span className={`justify-self-end inline-flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold leading-snug shadow-2xs ${statusDetail.bg}`}>
              <StatusIcon className="h-3.5 w-3.5 shrink-0" />
              <span className="min-w-0 whitespace-normal text-right">{paymentStatus}</span>
            </span>
          </div>
        ) : null}
      </div>
      {canRepay ? (
        <button
          type="button"
          disabled={paying}
          onClick={handleRepay}
          className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#c04f25] py-3 text-sm font-extrabold text-white transition hover:bg-[#a9411d] disabled:opacity-50 cursor-pointer shadow-sm"
        >
          {paying ? (
            <>
              <Loader2 className="animate-spin" size={14} />
              Đang xử lý...
            </>
          ) : (
            "Thanh toán lại"
          )}
        </button>
      ) : null}
    </section>
  );
}
