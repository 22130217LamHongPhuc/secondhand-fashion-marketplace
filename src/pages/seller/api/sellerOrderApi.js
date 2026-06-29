import axiosInstance from "@/config/axios";

const BASE = "/api/seller/orders";

/**
 * Seller Order API
 * Maps to SellerOrderController endpoints.
 */
const sellerOrderApi = {

  /**
   * 2. Lay chi tiet don hang
   * GET /api/seller/orders/{id}
   */
  getById: (id) => {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * 3. Tim kiem don hang
   * GET /api/seller/orders
   */
  searchOrders: (params = {}) => {
    const { status, orderCode, fromDate, toDate, minPrice, maxPrice, sortBy, page = 0 } = params;
    const queryParams = { page };
    
    if (status && status !== "ALL") queryParams.status = status;
    if (orderCode) queryParams.orderCode = orderCode;
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;
    if (minPrice !== undefined && minPrice !== null) queryParams.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== null) queryParams.maxPrice = maxPrice;
    if (sortBy) queryParams.sortBy = sortBy;

    return axiosInstance.get(BASE, { params: queryParams });
  },

  /**
   * 5. Xac nhan don hang
   * PUT /api/seller/orders/{id}/confirm
   */
  confirm: (id) => {
    return axiosInstance.put(`${BASE}/${id}/confirm`);
  },

  /**
   * 6. Bat dau giao hang
   * PUT /api/seller/orders/{id}/delivery
   */
  startDelivery: (id) => {
    return axiosInstance.put(`${BASE}/${id}/delivery`);
  },

  /**
   * 7. Hoan tat don hang
   * PUT /api/seller/orders/{id}/complete
   */
  complete: (id) => {
    return axiosInstance.put(`${BASE}/${id}/complete`);
  },

  /**
   * 8. Huy don hang
   * PUT /api/seller/orders/{id}/cancel?reason=Khach%20huy%20don
   * 
   * @param {number} id - Order ID
   * @param {string} reason - Cancel reason
   */
  cancel: (id, reason) => {
    return axiosInstance.put(`${BASE}/${id}/cancel`, null, { params: { reason } });
  },
};

export default sellerOrderApi;
