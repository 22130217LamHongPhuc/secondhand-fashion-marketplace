import axiosInstance from "@/config/axios";

const BASE = "/api/seller/stat";

/**
 * Seller Statistic API
 * Maps to SellerStatisticController endpoints.
 */
const sellerStatisticApi = {
  /**
   * 1. Lấy dữ liệu Dashboard
   * GET /api/seller/stat/dashboard
   */
  getDashboard: (params = {}) => {
    return axiosInstance.get(`${BASE}/dashboard`, { params });
  },

  /**
   * 2. Lấy dữ liệu Analytics
   * GET /api/seller/stat/analytics
   */
  getAnalytics: (params = {}) => {
    return axiosInstance.get(`${BASE}/analytics`, { params });
  },
};

export default sellerStatisticApi;
