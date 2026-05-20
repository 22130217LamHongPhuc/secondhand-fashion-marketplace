import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

export const customerProductService = {
  getById: async (id) => {
    const response = await http(`/api/customer/products/${id}`);
    return unwrapData(response);
  },
};
