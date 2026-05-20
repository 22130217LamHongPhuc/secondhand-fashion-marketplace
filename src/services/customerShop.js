import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

export const customerShopService = {
  list: async (options = {}) => {
    const { keyword, page, size } = options;

    const params = new URLSearchParams();
    if (keyword !== undefined && keyword !== null && String(keyword).trim()) {
      params.set("keyword", String(keyword).trim());
    }
    if (page !== undefined && page !== null) params.set("page", String(page));
    if (size !== undefined && size !== null) params.set("size", String(size));

    const query = params.toString();
    const response = await http(
      query ? `/api/customer/shops?${query}` : `/api/customer/shops`,
    );
    return unwrapData(response);
  },
  getById: async (shopId, options = {}) => {
    const { page, size } = options;

    const params = new URLSearchParams();
    if (page !== undefined && page !== null) params.set("page", String(page));
    if (size !== undefined && size !== null) params.set("size", String(size));

    const query = params.toString();

    const response = await http(
      query
        ? `/api/customer/shops/${shopId}?${query}`
        : `/api/customer/shops/${shopId}`,
    );
    return unwrapData(response);
  },
};
