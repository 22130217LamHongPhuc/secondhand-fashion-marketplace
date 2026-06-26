import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

export const customerComplaintService = {
  createComplaint: async ({ orderId, title, content }) => {
    const response = await http("/api/customer/complaints", {
      method: "POST",
      body: JSON.stringify({ orderId, title, content }),
    });
    return unwrapData(response);
  },

  getComplaints: async () => {
    const response = await http("/api/customer/complaints");
    return unwrapData(response);
  },

  getComplaintDetail: async (id) => {
    const response = await http(`/api/customer/complaints/${id}`);
    return unwrapData(response);
  },

  checkComplaintByOrder: async (orderId) => {
    const response = await http(`/api/customer/complaints/order/${orderId}`);
    return unwrapData(response);
  },
};
