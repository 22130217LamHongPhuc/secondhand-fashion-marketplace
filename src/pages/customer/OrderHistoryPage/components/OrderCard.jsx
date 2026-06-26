import { useState, useEffect } from "react";
import {
  Ban,
  CalendarDays,
  CreditCard,
  PackageSearch,
  Store,
  WalletCards,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../constants";
import { formatDate, formatVnd } from "../utils";
import OrderStatusBadge from "./OrderStatusBadge";
import { customerOrderService } from "@/services/customerOrder";
import { toastService } from "@/services/toastService";
import { customerComplaintService } from "@/services/customerComplaint";

export default function OrderCard({ order, onCancel, onComplaint, onViewComplaint }) {
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [complaint, setComplaint] = useState(null);

  const canCancel = order.status === "PENDING";
  const canRepay =
    order.status === "PENDING" &&
    order.paymentMethod === "WALLET" &&
    order.paymentStatus !== "PAID";

  const paymentMethod =
    PAYMENT_METHOD_LABELS[order.paymentMethod] ||
    order.paymentMethod ||
    "Thanh toán";
  const paymentStatus =
    PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus || "";

  useEffect(() => {
    if (order.status !== "DONE") return;
    let isMounted = true;

    const fetchComplaint = () => {
      customerComplaintService.checkComplaintByOrder(order.id)
        .then((res) => {
          if (isMounted) setComplaint(res);
        })
        .catch((err) => console.error(err));
    };

    fetchComplaint();

    const handleCreated = (e) => {
      if (e.detail?.orderId === order.id) {
        fetchComplaint();
      }
    };

    window.addEventListener("secondhand-complaint-created", handleCreated);
    return () => {
      isMounted = false;
      window.removeEventListener("secondhand-complaint-created", handleCreated);
    };
  }, [order.id, order.status]);

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

  return (
    <article className="overflow-hidden rounded-2xl border border-[#e7dfbd] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e7c8] bg-[#fffaf0] px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e3d7b8] bg-white">
            {order.shopAvatarUrl ? (
              <img
                src={order.shopAvatarUrl}
                alt={order.shopName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Store size={16} className="text-[#b84a25]" />
            )}
          </div>

          <div className="min-w-0">
            <button
              type="button"
              onClick={() => order.shopId && navigate(`/shop/${order.shopId}`)}
              className="truncate text-sm font-extrabold text-[#3d3a2c] hover:text-[#b84a25]"
            >
              {order.shopName}
            </button>
            <p className="text-xs font-semibold text-[#8a826f]">
              {order.orderCode}
            </p>
          </div>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
        <div className="h-28 w-24 overflow-hidden rounded-xl bg-[#e8e2c6]">
          {order.thumbnailUrl ? (
            <img
              src={order.thumbnailUrl}
              alt={order.firstProductName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#9a907a]">
              <PackageSearch size={26} />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h3 className="line-clamp-2 text-base font-extrabold text-[#3d3a2c]">
            {order.firstProductName}
          </h3>
          <p className="mt-1 text-sm font-semibold text-[#766f60]">
            {order.itemCount > 1
              ? `và ${order.itemCount - 1} sản phẩm khác`
              : "1 sản phẩm"}
          </p>

          <div className="mt-4 grid gap-2 text-xs font-semibold text-[#756d5d] sm:grid-cols-2">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={14} className="text-[#b84a25]" />
              {formatDate(order.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <CreditCard size={14} className="text-[#b84a25]" />
              {paymentMethod}
            </span>
            {paymentStatus ? (
              <span className="inline-flex items-center gap-2 sm:col-span-2">
                <WalletCards size={14} className="text-[#b84a25]" />
                {paymentStatus}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <div className="text-left md:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a907a]">
              Tổng thanh toán
            </p>
            <p className="mt-1 text-xl font-extrabold text-[#b84a25]">
              {formatVnd(order.total)}
            </p>
            <p className="mt-1 text-xs font-semibold text-[#8a826f]">
              Phí vận chuyển {formatVnd(order.shippingFee)}
            </p>
          </div>

          <div className="flex flex-wrap justify-start gap-2 md:justify-end">
            {canCancel ? (
              <button
                type="button"
                onClick={() => onCancel?.(order)}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#f0b7a9] bg-[#fff0ed] px-4 py-2.5 text-sm font-extrabold text-[#b23b24] transition hover:bg-[#ffe4de]"
              >
                <Ban size={15} />
                Hủy đơn
              </button>
            ) : null}

            {canRepay ? (
              <button
                type="button"
                disabled={paying}
                onClick={handleRepay}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#c04f25] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#a9411d] disabled:opacity-50 cursor-pointer"
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

            {order.status === "DONE" ? (
              complaint ? (
                <button
                  type="button"
                  onClick={() => onViewComplaint?.(complaint.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#bfe5c4] bg-[#edf8ed] px-5 py-2.5 text-sm font-extrabold text-[#2f7d38] transition hover:bg-[#dceddd] cursor-pointer"
                >
                  <AlertCircle size={15} />
                  Xem khiếu nại
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onComplaint?.(order)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#eadfca] bg-[#fffaf0] px-5 py-2.5 text-sm font-extrabold text-[#b84a25] transition hover:bg-[#f3ead8]"
                >
                  <AlertCircle size={15} />
                  Khiếu nại
                </button>
              )
            ) : null}

            <button
              type="button"
              onClick={() => navigate(`/orders/${order.id}`)}
              className="rounded-full bg-[#3d3a2c] px-5 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#29271f] cursor-pointer"
            >
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
