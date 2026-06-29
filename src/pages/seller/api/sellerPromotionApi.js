import axiosInstance from "@/config/axios";

const BASE = "/api/seller/promotions";
const PROMO_BASE = "/api/v1/seller/promotions";

const sellerPromotionApi = {
  // === Shop Promotion API (new) ===
  getPromotions: (params = {}) => {
    const { keyword, fromDate, toDate, minPrice, maxPrice, sortBy, page = 0, size = 10 } = params;
    const queryParams = { page, size };
    if (keyword) queryParams.keyword = keyword;
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;
    if (minPrice !== undefined && minPrice !== null) queryParams.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== null) queryParams.maxPrice = maxPrice;
    if (sortBy) queryParams.sortBy = sortBy;
    
    return axiosInstance.get(PROMO_BASE, { params: queryParams });
  },
  
  getPromotionDetail: (id) => {
    return axiosInstance.get(`${PROMO_BASE}/${id}`);
  },
  
  createPromotion: (data) => {
    return axiosInstance.post(PROMO_BASE, data);
  },
  
  updatePromotion: (id, data) => {
    return axiosInstance.put(`${PROMO_BASE}/${id}`, data);
  },
  
  changeStatus: (id, status) => {
    return axiosInstance.patch(`${PROMO_BASE}/${id}/status`, null, { params: { status } });
  },

  // === Coupon Management (Old) ===
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

  getCampaignProducts: (campaignId) => {
    return axiosInstance.get(`${BASE}/campaigns/${campaignId}/products`);
  }
};

export default sellerPromotionApi;
