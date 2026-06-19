import axiosInstance from "@/config/axios";

const BASE = "/api/seller/promotions";

const sellerPromotionApi = {
  // Coupon Management
  getCoupons: () => {
    return axiosInstance.get(`${BASE}/coupons`);
  },
  
  createCoupon: (data) => {
    return axiosInstance.post(`${BASE}/coupons`, data);
  },
  
  updateCoupon: (id, data) => {
    return axiosInstance.put(`${BASE}/coupons/${id}`, data);
  },
  
  deleteCoupon: (id) => {
    return axiosInstance.delete(`${BASE}/coupons/${id}`);
  },

  // Campaign Management
  getCampaigns: () => {
    return axiosInstance.get(`${BASE}/campaigns`);
  },
  
  registerProduct: (campaignId, data) => {
    return axiosInstance.post(`${BASE}/campaigns/${campaignId}/register`, data);
  },

  removeProduct: (campaignId, productId) => {
    return axiosInstance.delete(`${BASE}/campaigns/${campaignId}/products/${productId}`);
  },

  // We can query admin campaigns products endpoint to check registration details for simplicity
  getCampaignProducts: (campaignId) => {
    return axiosInstance.get(`/api/admin/promotions/campaigns/${campaignId}/products`);
  }
};

export default sellerPromotionApi;
