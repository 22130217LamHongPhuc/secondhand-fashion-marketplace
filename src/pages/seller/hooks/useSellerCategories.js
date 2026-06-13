import { useQuery } from "@tanstack/react-query";
import { sellerCategoryApi } from "../api";

export const useSellerCategories = () => {
  return useQuery({
    queryKey: ["seller", "categories"],
    queryFn: async () => {
      const res = await sellerCategoryApi.getAll();
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
};
