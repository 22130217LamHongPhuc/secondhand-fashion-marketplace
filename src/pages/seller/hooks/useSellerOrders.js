import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerOrderApi } from "../api";
import { Order, Pagination } from "../models";
import { sellerOrderKeys } from "./sellerQueryKeys";

/* ── 1. Danh sach don hang theo trang thai ── */
export const useSellerOrdersByStatus = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerOrderKeys.status(params),
    queryFn: async () => {
      const res = await sellerOrderApi.getByStatus(params);
      const { data } = res.data;
      return {
        orders: Order.fromApiList(data.content),
        pagination: Pagination.fromApi(data),
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/* ── 2. Chi tiet don hang ── */
export const useSellerOrderDetail = (id, options = {}) => {
  return useQuery({
    queryKey: sellerOrderKeys.detail(id),
    queryFn: async () => {
      const res = await sellerOrderApi.getById(id);
      const { data } = res.data;
      return Order.fromApi(data);
    },
    enabled: !!id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/* ── 3. Danh sach don hang thang hien tai ── */
export const useSellerCurrentMonthOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerOrderKeys.currentMonth(params),
    queryFn: async () => {
      const res = await sellerOrderApi.getCurrentMonth(params);
      const { data } = res.data;
      return {
        orders: Order.fromApiList(data.content),
        pagination: Pagination.fromApi(data),
      };
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

/* ── 4. Xac nhan don hang ── */
export const useConfirmOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await sellerOrderApi.confirm(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    },
  });
};

/* ── 5. Bat dau giao hang ── */
export const useStartDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await sellerOrderApi.startDelivery(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    },
  });
};

/* ── 6. Hoan tat don hang ── */
export const useCompleteOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await sellerOrderApi.complete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    },
  });
};

/* ── 7. Huy don hang ── */
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const res = await sellerOrderApi.cancel(id, reason);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerOrderKeys.all });
    },
  });
};
