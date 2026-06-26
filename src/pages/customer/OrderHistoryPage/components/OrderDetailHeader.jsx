import { useState, useEffect } from "react";
import { ArrowLeft, Ban, Store, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils";
import OrderStatusBadge from "./OrderStatusBadge";
import { customerComplaintService } from "@/services/customerComplaint";

export default function OrderDetailHeader({ order, onCancel, onComplaint, onViewComplaint }) {
  const navigate = useNavigate();
  const shop = order.shop;
  const canCancel = order.status === "PENDING";
  const [complaint, setComplaint] = useState(null);

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

  return (
    <section className="rounded-2xl border border-[#e7dfbd] bg-[#fffaf0] p-5 shadow-sm">
      <button
        type="button"
        onClick={() => navigate("/orders")}
        className="mb-4 inline-flex items-center gap-2 text-xs font-extrabold text-[#b84a25] hover:text-[#8f3519]"
      >
        <ArrowLeft size={15} />
        Quay lại lịch sử đơn hàng
      </button>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Chi tiết đơn hàng
            </p>
            <OrderStatusBadge status={order.status} />
          </div>

          <h1 className="mt-1 text-2xl font-black text-[#3d3a2c]">
            {order.orderCode}
          </h1>

          {shop ? (
            <button
              type="button"
              onClick={() => shop.id && navigate(`/shop/${shop.id}`)}
              className="mt-2.5 inline-flex items-center gap-2 text-xs font-bold text-[#766f60] hover:text-[#b84a25]"
            >
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-[#e3d7b8] bg-white">
                {shop.avatarUrl ? (
                  <img
                    src={shop.avatarUrl}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={13} />
                )}
              </span>
              {shop.name}
            </button>
          ) : null}
        </div>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
          <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm border border-[#e7dfbd]/60">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a907a]">
              Cập nhật gần nhất
            </p>
            <p className="mt-0.5 text-xs font-extrabold text-[#3d3a2c]">
              {formatDate(order.updatedAt || order.createdAt)}
            </p>
          </div>

          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 rounded-full border border-[#f0b7a9] bg-[#fff0ed] px-4 py-2 text-xs font-extrabold text-[#b23b24] transition hover:bg-[#ffe4de]"
            >
              <Ban size={14} />
              Hủy đơn hàng
            </button>
          ) : null}

          {order.status === "DONE" ? (
            complaint ? (
              <button
                type="button"
                onClick={() => onViewComplaint?.(complaint.id)}
                className="inline-flex items-center gap-2 rounded-full border border-[#bfe5c4] bg-[#edf8ed] px-4 py-2 text-xs font-extrabold text-[#2f7d38] transition hover:bg-[#dceddd]"
              >
                <AlertCircle size={14} />
                Xem khiếu nại
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplaint}
                className="inline-flex items-center gap-2 rounded-full border border-[#eadfca] bg-[#fffaf0] px-4 py-2 text-xs font-extrabold text-[#b84a25] transition hover:bg-[#f3ead8]"
              >
                <AlertCircle size={14} />
                Khiếu nại
              </button>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
