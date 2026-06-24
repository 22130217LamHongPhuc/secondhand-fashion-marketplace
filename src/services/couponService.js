import { http } from "./http";

const unwrapData = (response) => response?.data ?? response;

export const couponService = {
  getAvailable: async () => {
    const response = await http("/api/promotions/coupons/available");
    const data = unwrapData(response);
    return Array.isArray(data) ? data : [];
  },

  validate: async (code, subtotal) => {
    const response = await http("/api/promotions/coupons/validate", {
      method: "POST",
      body: JSON.stringify({ code, subtotal }),
    });
    const data = unwrapData(response);
    return {
      ...data,
      isValid: data?.isValid ?? data?.valid ?? false,
    };
  },
};
