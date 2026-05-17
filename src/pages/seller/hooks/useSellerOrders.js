import { useState, useCallback } from "react";
import sellerOrderApi from "../api/sellerOrderApi";
import { Order, Pagination } from "../models";

/**
 * Custom hook for seller order operations.
 *
 * Provides:
 *  - orders / order        — data state
 *  - pagination            — pagination metadata from backend
 *  - loading / error       — request status
 *  - fetchOrders             — get paginated list
 *  - fetchOrderById          — get single order detail
 *  - fetchOrdersByStatus     — get filtered by status
 *  - fetchCurrentMonthOrders — get current month orders
 *  - confirmOrder            — confirm pending order
 *  - startDelivery           — start shipping order
 *  - completeOrder           — complete order
 *  - cancelOrder             — cancel order with reason
 */
const useSellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [order, setOrder] = useState(null);
  const [pagination, setPagination] = useState(Pagination.empty());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── 1. Lay danh sach don hang ── */
  const fetchOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.getAll(params);
      const { data } = res.data;
      setOrders(Order.fromApiList(data.content));
      setPagination(Pagination.fromApi(data));
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch orders");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 2. Lay chi tiet don hang ── */
  const fetchOrderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.getById(id);
      const { data } = res.data;
      const orderModel = Order.fromApi(data);
      setOrder(orderModel);
      return orderModel;
    } catch (err) {
      setError(err.message || "Failed to fetch order details");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 3. Lay danh sach don hang theo trang thai ── */
  const fetchOrdersByStatus = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.getByStatus(params);
      const { data } = res.data;
      setOrders(Order.fromApiList(data.content));
      setPagination(Pagination.fromApi(data));
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch orders by status");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 4. Lay danh sach don hang thang hien tai ── */
  const fetchCurrentMonthOrders = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.getCurrentMonth(params);
      const { data } = res.data;
      setOrders(Order.fromApiList(data.content));
      setPagination(Pagination.fromApi(data));
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch current month orders");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 5. Xac nhan don hang ── */
  const confirmOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.confirm(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to confirm order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 6. Bat dau giao hang ── */
  const startDelivery = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.startDelivery(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to start delivery");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 7. Hoan tat don hang ── */
  const completeOrder = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.complete(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to complete order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 8. Huy don hang ── */
  const cancelOrder = useCallback(async (id, reason) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerOrderApi.cancel(id, reason);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to cancel order");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    order,
    pagination,
    loading,
    error,
    fetchOrders,
    fetchOrderById,
    fetchOrdersByStatus,
    fetchCurrentMonthOrders,
    confirmOrder,
    startDelivery,
    completeOrder,
    cancelOrder,
  };
};

export default useSellerOrders;
