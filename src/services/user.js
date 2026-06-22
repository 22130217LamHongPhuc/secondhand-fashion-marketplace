import { http } from "./http";

export const userService = {
  getProfile: async (id) => {
    return http(`/api/users/${id}`);
  },

  updateProfile: async (id, { fullName, phone, avatarUrl }) => {
    return http(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({ fullName, phone, avatarUrl }),
    });
  },

  getAddresses: async (userId) => {
    return http(`/api/users/${userId}/addresses`);
  },

  createAddress: async (userId, addressData) => {
    return http(`/api/users/${userId}/addresses`, {
      method: "POST",
      body: JSON.stringify(addressData),
    });
  },
};
