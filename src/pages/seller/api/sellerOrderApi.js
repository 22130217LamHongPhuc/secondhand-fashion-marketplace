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
   * 3. Lay danh sach don hang theo trang thai
   * GET /api/seller/orders?status=PENDING&page=0&orderCode=ABC
   */
  getByStatus: (params = {}) => {
    const { status, orderCode, page = 0 } = params;
    const queryParams = { page };
    if ((!status || status === "ALL") && !orderCode) {
      return axiosInstance.get(`${BASE}/all`, { params: queryParams });
    }
    if (status && status !== "ALL") {
      queryParams.status = status;
    }
    if (orderCode) {
      queryParams.orderCode = orderCode;
    }
    return axiosInstance.get(`${BASE}`, { params: queryParams });
  },

  /**
   * 4. Lay danh sach don hang thang hien tai
   * GET /api/seller/orders/current-month?page=0
   */
  getCurrentMonth: (params = {}) => {
    const { page = 0 } = params;
    return axiosInstance.get(`${BASE}/current-month`, { params: { page } });
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
