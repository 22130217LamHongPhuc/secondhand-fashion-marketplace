import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

export const shippingService = {
  getProvinces: async () => {
    const response = await http("/api/shipping/provinces");
    return unwrapData(response) || [];
  },

  getDistricts: async (provinceId) => {
    const response = await http(`/api/shipping/districts?provinceId=${Number(provinceId)}`);
    return unwrapData(response) || [];
  },

  getWards: async (districtId) => {
    const response = await http(`/api/shipping/wards?districtId=${Number(districtId)}`);
    return unwrapData(response) || [];
  },

  quoteFee: async ({ customerId, shippingAddressId, items }) => {
    const response = await http("/api/shipping/fee", {
      method: "POST",
      body: JSON.stringify({
        customerId,
        shippingAddressId,
        items,
      }),
    });
    return unwrapData(response);
  },
};
