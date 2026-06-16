import axiosInstance from "@/config/axios";

const BASE = "/api/seller/shop";

/**
 * Seller Shop API
 * Maps to SellerShopController endpoints.
 */
const sellerShopApi = {
  /**
   * Get shop profile of the current seller
   * GET /api/seller/shop
   */
  getMyShop: () => {
    return axiosInstance.get(BASE);
  },

  /**
   * Register a new shop
   * POST /api/seller/shop
   */
  createShop: (data) => {
    return axiosInstance.post(BASE, data);
  },

  /**
   * Update the shop profile
   * PUT /api/seller/shop
   */
  updateShop: (data) => {
    return axiosInstance.put(BASE, data);
  },
};

export default sellerShopApi;
