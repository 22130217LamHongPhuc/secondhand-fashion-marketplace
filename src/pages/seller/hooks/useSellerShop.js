import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sellerShopApi } from "../api";
import { Shop } from "../models";
import { sellerShopKeys } from "./sellerQueryKeys";

/**
 * Hook to fetch current seller's shop profile
 */
export const useSellerShop = (options = {}) => {
  return useQuery({
    queryKey: sellerShopKeys.profile(),
    queryFn: async () => {
      try {
        const res = await sellerShopApi.getMyShop();
        const { data } = res.data;
        return Shop.fromApi(data);
      } catch (error) {
        if (error.status === 404 || (error.response && error.response.status === 404)) {
          return null; // Shop not registered yet
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    ...options,
  });
};

/**
 * Hook to register a new shop
 */
export const useCreateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await sellerShopApi.createShop(payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sellerShopKeys.all });
    },
  });
};

/**
 * Hook to update existing shop profile
 */
export const useUpdateShop = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await sellerShopApi.updateShop(payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      // Opt-in update of local cache and invalidate
      queryClient.setQueryData(sellerShopKeys.profile(), Shop.fromApi(data));
      queryClient.invalidateQueries({ queryKey: sellerShopKeys.profile() });
    },
  });
};
