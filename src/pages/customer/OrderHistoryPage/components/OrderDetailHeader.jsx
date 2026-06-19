import { ArrowLeft, Ban, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils";
import OrderStatusBadge from "./OrderStatusBadge";

export default function OrderDetailHeader({ order, onCancel }) {
  const navigate = useNavigate();
  const shop = order.shop;
  const canCancel = order.status === "PENDING";

  return (
    <section className="rounded-3xl border border-[#e7dfbd] bg-[#fffaf0] p-6 shadow-sm">
      <button
        type="button"
        onClick={() => navigate("/orders")}
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#b84a25] hover:text-[#8f3519]"
      >
        <ArrowLeft size={17} />
        Quay lại lịch sử đơn hàng
      </button>

      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Chi tiết đơn hàng
            </p>
            <OrderStatusBadge status={order.status} />
          </div>

          <h1 className="mt-2 text-3xl font-black text-[#3d3a2c]">
            {order.orderCode}
          </h1>

          {shop ? (
            <button
              type="button"
              onClick={() => shop.id && navigate(`/shop/${shop.id}`)}
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#766f60] hover:text-[#b84a25]"
            >
              <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[#e3d7b8] bg-white">
                {shop.avatarUrl ? (
                  <img
                    src={shop.avatarUrl}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={15} />
                )}
              </span>
              {shop.name}
            </button>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a907a]">
              Cập nhật gần nhất
            </p>
            <p className="mt-1 text-sm font-extrabold text-[#3d3a2c]">
              {formatDate(order.updatedAt || order.createdAt)}
            </p>
          </div>

          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-full border border-[#f0b7a9] bg-[#fff0ed] px-5 py-2.5 text-sm font-extrabold text-[#b23b24] transition hover:bg-[#ffe4de]"
            >
              <Ban size={16} />
              Hủy đơn hàng
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
