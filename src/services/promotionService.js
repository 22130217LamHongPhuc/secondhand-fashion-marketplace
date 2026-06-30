import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

export const customerPromotionService = {
  // 1. API Lấy danh sách khuyến mãi của một Cửa hàng
  getShopPromotions: async (shopId, page = 0, size = 10) => {
    const response = await http(
      `/api/v1/promotions/shops/${shopId}?page=${page}&size=${size}`
    );
    return unwrapData(response);
  },

  // 2. API Lưu/Nhận (Claim) Khuyến mãi vào Ví
  claimPromotion: async (promotionId) => {
    const response = await http(`/api/v1/promotions/${promotionId}/claim`, {
      method: "POST",
    });
    return unwrapData(response);
  },

  // 3. API Xem Ví Voucher cá nhân (My Wallet)
  getMyWallet: async (page = 0, size = 10) => {
    const response = await http(
      `/api/v1/promotions/my-wallet?page=${page}&size=${size}`
    );
    return unwrapData(response);
  },
};
