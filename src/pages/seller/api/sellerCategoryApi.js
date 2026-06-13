import axiosInstance from "@/config/axios";

const sellerCategoryApi = {
  getAll: () => axiosInstance.get("/api/seller/categories"),
};

export default sellerCategoryApi;
