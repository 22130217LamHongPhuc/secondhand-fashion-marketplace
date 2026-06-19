import {
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  RotateCcw,
  Truck,
} from "lucide-react";
import { formatDate } from "../utils";

export default function OrderTimeline({ order }) {
  const events = [
    {
      label: "Đặt hàng",
      value: order.createdAt,
      icon: CalendarDays,
    },
    {
      label: "Thanh toán",
      value: order.paidAt,
      icon: CircleDollarSign,
    },
    {
      label: order.status === "CANCELLED" ? "Đã hủy" : "Cập nhật",
      value: order.updatedAt,
      icon: order.status === "CANCELLED" ? RotateCcw : Truck,
    },
    {
      label: "Giao thành công",
      value: order.deliveredAt,
      icon: CheckCircle2,
    },
  ].filter((item) => item.value);

  if (!events.length && !order.cancelReason) return null;

  return (
    <section className="rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#3d3a2c]">Tiến trình đơn hàng</h2>

      <div className="mt-5 space-y-4">
        {events.map((event) => {
          const Icon = event.icon;
          return (
            <div key={`${event.label}-${event.value}`} className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fff0e4] text-[#b84a25]">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-sm font-extrabold text-[#3d3a2c]">
                  {event.label}
                </p>
                <p className="mt-0.5 text-xs font-semibold text-[#766f60]">
                  {formatDate(event.value)}
                </p>
              </div>
            </div>
          );
        })}

        {order.cancelReason ? (
          <div className="rounded-2xl bg-[#fff0ed] p-4 text-sm font-semibold text-[#b23b24]">
            Lý do hủy: {order.cancelReason}
          </div>
        ) : null}
      </div>
    </section>
  );
}
