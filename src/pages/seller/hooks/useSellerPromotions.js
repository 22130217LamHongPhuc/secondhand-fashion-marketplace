import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerPromotionApi } from "../api";
import { Pagination } from "../models";
import { sellerPromotionKeys } from "./sellerQueryKeys";

/* ── 1. Danh sách khuyến mãi (Phân trang) ── */
export const useSellerPromotionList = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerPromotionKeys.list(params),
    queryFn: async () => {
      const res = await sellerPromotionApi.getPromotions(params);
      const data = res.data;
      return {
        promotions: data.content || [],
        pagination: Pagination.fromApi(data),
      };
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};

/* ── 2. Tạo mã khuyến mãi mới ── */
export const useCreatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await sellerPromotionApi.createPromotion(payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerPromotionKeys.lists() });
    },
  });
};

/* ── 3. Cập nhật mã khuyến mãi ── */
export const useUpdatePromotion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updateData }) => {
      const res = await sellerPromotionApi.updatePromotion(id, updateData);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sellerPromotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: sellerPromotionKeys.lists() });
    },
  });
};

/* ── 4. Thay đổi trạng thái mã khuyến mãi ── */
export const useChangePromotionStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }) => {
      const res = await sellerPromotionApi.changeStatus(id, status);
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: sellerPromotionKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: sellerPromotionKeys.lists() });
    },
  });
};
