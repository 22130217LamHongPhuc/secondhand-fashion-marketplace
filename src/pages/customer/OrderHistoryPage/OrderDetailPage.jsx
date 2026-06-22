import { customerOrderService } from "@/services/customerOrder";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import CancelOrderModal from "./components/CancelOrderModal";
import OrderDetailHeader from "./components/OrderDetailHeader";
import OrderDetailItems from "./components/OrderDetailItems";
import OrderDetailSkeleton from "./components/OrderDetailSkeleton";
import OrderDetailSummary from "./components/OrderDetailSummary";
import OrderShippingAddress from "./components/OrderShippingAddress";
import OrderTimeline from "./components/OrderTimeline";
export default function OrderDetailPage() {
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await customerOrderService.getDetail({
          orderId,
        });

        if (!isMounted) return;
        setOrder(result);
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load order detail", err);
        setOrder(null);
        setError("Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleCancelOrder = async (reason) => {
    if (!order || order.status !== "PENDING") return;

    setCancelling(true);
    setCancelError("");

    try {
      const updatedOrder = await customerOrderService.cancel({
        orderId: order.id,
        reason,
      });

      setOrder(updatedOrder);
      setCancelOpen(false);
    } catch (err) {
      console.error("Failed to cancel order", err);
      setCancelError("Không thể hủy đơn hàng. Vui lòng thử lại sau.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="rounded-3xl border border-[#f0b7a9] bg-[#fff0ed] p-8 text-center">
        <h1 className="text-xl font-black text-[#b23b24]">
          Không tìm thấy đơn hàng
        </h1>
        <p className="mt-2 text-sm font-semibold text-[#8f4b3d]">
          {error ||
            "Đơn hàng không tồn tại hoặc không thuộc tài khoản hiện tại."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <OrderDetailHeader order={order} onCancel={() => setCancelOpen(true)} />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <OrderDetailItems items={order.items} />
          <OrderTimeline order={order} />
        </div>

        <aside className="space-y-5">
          <OrderDetailSummary order={order} />
          <OrderShippingAddress address={order.shippingAddress} />
        </aside>
      </div>

      <CancelOrderModal
        open={cancelOpen}
        orderCode={order.orderCode}
        submitting={cancelling}
        error={cancelError}
        onClose={() => {
          if (cancelling) return;
          setCancelOpen(false);
          setCancelError("");
        }}
        onConfirm={handleCancelOrder}
      />
    </div>
  );
}
