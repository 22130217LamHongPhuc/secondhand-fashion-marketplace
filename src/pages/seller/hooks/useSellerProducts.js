import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerProductApi } from "../api";
import { Product, Pagination } from "../models";
import { sellerProductKeys } from "./sellerQueryKeys";

/* ── 1. Danh sach san pham (Tat ca) ── */
export const useSellerProductList = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerProductKeys.list(params),
    queryFn: async () => {
      const res = await sellerProductApi.getAll(params);
      const { data } = res.data;
      return {
        products: Product.fromApiList(data.content),
        pagination: Pagination.fromApi(data),
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/* ── 2. Danh sach san pham theo trang thai ── */
export const useSellerProductsByStatus = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerProductKeys.status(params),
    queryFn: async () => {
      const res = await sellerProductApi.getByStatus(params);
      const { data } = res.data;
      return {
        products: Product.fromApiList(data.content),
        pagination: Pagination.fromApi(data),
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

/* ── 3. Chi tiet san pham ── */
export const useSellerProductDetail = (id, options = {}) => {
  return useQuery({
    queryKey: sellerProductKeys.detail(id),
    queryFn: async () => {
      const res = await sellerProductApi.getById(id);
      const { data } = res.data;
      return Product.fromApi(data);
    },
    enabled: !!id, // Only fetch if ID is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/* ── 4. Tao san pham ── */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await sellerProductApi.create(payload);
      return res.data.data;
    },
    onSuccess: () => {
      // Invalidate all product queries to refresh list
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all });
    },
  });
};

/* ── 5. Cap nhat san pham ── */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const res = await sellerProductApi.update(id, updateData);
      return res.data.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific detail and all lists
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.statuses() });
    },
  });
};

/* ── 6. Xoa san pham ── */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const res = await sellerProductApi.delete(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerProductKeys.all });
    },
  });
};
