import { useQuery } from "@tanstack/react-query";
import { sellerStatisticApi } from "../api";
import { sellerStatisticKeys } from "./sellerQueryKeys";

export const useSellerDashboard = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerStatisticKeys.dashboard(params),
    queryFn: async () => {
      const res = await sellerStatisticApi.getDashboard(params);
      return res.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};

export const useSellerAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: sellerStatisticKeys.analytics(params),
    queryFn: async () => {
      const res = await sellerStatisticApi.getAnalytics(params);
      return res.data.data;
    },
    staleTime: 60 * 1000, // 1 minute
    gcTime: 10 * 60 * 1000, // 10 minutes
    ...options,
  });
};
