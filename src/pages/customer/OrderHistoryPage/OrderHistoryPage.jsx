import Pagination from "../ProductListPage/components/Pagination";
import { customerOrderService } from "@/services/customerOrder";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CancelOrderModal from "./components/CancelOrderModal";
import EmptyOrders from "./components/EmptyOrders";
import OrderCard from "./components/OrderCard";
import OrderSkeleton from "./components/OrderSkeleton";
import { ORDER_STATUS_OPTIONS } from "./constants";
import { getStoredCustomerId } from "./utils";

function toListOrderFromDetail(order) {
  const firstItem = order.items?.[0];

  return {
    id: order.id,
    orderCode: order.orderCode,
    shopName: order.shop?.name || "Cửa hàng",
    shopAvatarUrl: order.shop?.avatarUrl || "",
    shopId: order.shop?.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    subtotal: order.subtotal,
    shippingFee: order.shippingFee,
    total: order.total,
    itemCount: order.items?.length || 0,
    thumbnailUrl: firstItem?.thumbnailUrl || "",
    firstProductName: firstItem?.productName || "Sản phẩm",
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

export default function OrderHistoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get("status") || "";
  const pageRaw = Number(searchParams.get("page"));
  const sizeRaw = Number(searchParams.get("size"));
  const customerIdRaw = Number(searchParams.get("customerId"));

  const page = Number.isFinite(pageRaw) && pageRaw >= 0 ? pageRaw : 0;
  const size = Number.isFinite(sizeRaw) && sizeRaw > 0 ? sizeRaw : 10;
  const customerId = 501 


  const [orders, setOrders] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const activeStatus = useMemo(() => {
    return ORDER_STATUS_OPTIONS.some((option) => option.value === status)
      ? status
      : "";
  }, [status]);

  const updateQueryParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      });

      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await customerOrderService.getHistory({
          customerId,
          status: activeStatus || null,
          page,
          size,
        });

        if (!isMounted) return;
        setOrders(result.orders);
        setTotalElements(result.totalElements);
        setTotalPages(result.totalPages || 1);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load order history", err);
        setOrders([]);
        setTotalElements(0);
        setTotalPages(1);
        setError("Không thể tải lịch sử đơn hàng. Vui lòng thử lại sau.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [activeStatus, customerId, page, size]);

  const handleStatusChange = (nextStatus) => {
    updateQueryParams({ status: nextStatus || null, page: 0 });
  };

  const handleCancelOrder = async (reason) => {
    if (!cancelTarget || cancelTarget.status !== "PENDING") return;

    setCancelling(true);
    setCancelError("");

    try {
      const updatedOrder = await customerOrderService.cancel({
        customerId,
        orderId: cancelTarget.id,
        reason,
      });
      const listOrder = toListOrderFromDetail(updatedOrder);

      setOrders((current) => {
        if (activeStatus && listOrder.status !== activeStatus) {
          return current.filter((order) => order.id !== listOrder.id);
        }

        return current.map((order) =>
          order.id === listOrder.id ? { ...order, ...listOrder } : order,
        );
      });

      if (activeStatus && listOrder.status !== activeStatus) {
        setTotalElements((current) => Math.max(0, current - 1));
      }

      setCancelTarget(null);
    } catch (err) {
      console.error("Failed to cancel order", err);
      setCancelError("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setCancelling(false);
    }
  };

  const showingFrom = totalElements === 0 ? 0 : page * size + 1;
  const showingTo = Math.min((page + 1) * size, totalElements);

  return (
    <div className="space-y-7">
      <section className="rounded-3xl border border-[#e7dfbd] bg-[#fffaf0] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Tài khoản của tôi
            </p>
            <h1 className="mt-2 text-3xl font-black text-[#3d3a2c]">
              Lịch sử đơn hàng
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#766f60]">
              Theo dõi trạng thái mua hàng, thanh toán và các sản phẩm bạn đã đặt.
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a907a]">
              Tổng đơn hàng
            </p>
            <p className="mt-1 text-2xl font-black text-[#b84a25]">
              {totalElements.toLocaleString("vi-VN")}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#e7dfbd] bg-white/75 p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#3d3a2c]">
            <Search size={17} className="text-[#b84a25]" />
            Lọc theo trạng thái
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 hidden-scrollbar">
            {ORDER_STATUS_OPTIONS.map((option) => {
              const isActive = activeStatus === option.value;
              return (
                <button
                  key={option.value || "all"}
                  type="button"
                  onClick={() => handleStatusChange(option.value)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-extrabold transition ${
                    isActive
                      ? "bg-[#3d3a2c] text-white"
                      : "bg-[#f6f4dd] text-[#6f6758] hover:bg-[#efe7c5]"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-bold text-[#766f60]">
            Hiển thị {showingFrom}-{showingTo} trong{" "}
            {totalElements.toLocaleString("vi-VN")} đơn hàng
          </p>
          <select
            value={size}
            onChange={(event) =>
              updateQueryParams({ size: Number(event.target.value), page: 0 })
            }
            className="rounded-xl border border-[#e7dfbd] bg-white px-3 py-2 text-sm font-bold text-[#3d3a2c] outline-none focus:border-[#b84a25]"
          >
            <option value={5}>5 / trang</option>
            <option value={10}>10 / trang</option>
            <option value={20}>20 / trang</option>
            <option value={50}>50 / trang</option>
          </select>
        </div>

        {error ? (
          <div className="rounded-2xl border border-[#f0b7a9] bg-[#fff0ed] p-5 text-sm font-bold text-[#b23b24]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <OrderSkeleton key={index} />
            ))}
          </div>
        ) : orders.length ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id ?? order.orderCode}
                order={order}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        ) : (
          <EmptyOrders hasFilter={Boolean(activeStatus)} />
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={(nextPage) => updateQueryParams({ page: nextPage })}
        />
      </section>

      <CancelOrderModal
        open={Boolean(cancelTarget)}
        orderCode={cancelTarget?.orderCode}
        submitting={cancelling}
        error={cancelError}
        onClose={() => {
          if (cancelling) return;
          setCancelTarget(null);
          setCancelError("");
        }}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
}
