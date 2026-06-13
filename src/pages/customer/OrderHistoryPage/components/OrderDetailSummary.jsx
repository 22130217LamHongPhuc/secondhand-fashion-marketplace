import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../constants";
import { formatVnd } from "../utils";

export default function OrderDetailSummary({ order }) {
  const paymentMethod =
    PAYMENT_METHOD_LABELS[order.paymentMethod] ||
    order.paymentMethod ||
    "Thanh toán";
  const paymentStatus =
    PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus || "";

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

      <div className="mt-5 rounded-2xl bg-[#fffaf0] p-4 text-sm font-semibold text-[#766f60]">
        <p>
          Phương thức:{" "}
          <span className="font-extrabold text-[#3d3a2c]">{paymentMethod}</span>
        </p>
        {paymentStatus ? (
          <p className="mt-2">
            Trạng thái:{" "}
            <span className="font-extrabold text-[#3d3a2c]">
              {paymentStatus}
            </span>
          </p>
        ) : null}
      </div>
    </section>
  );
}
