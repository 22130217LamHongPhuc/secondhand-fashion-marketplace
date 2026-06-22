import { http } from "./http";

export const authService = {
  login: async ({ email, password }) => {
    return http("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async ({ email, password, fullName, phone, avatarUrl }) => {
    return http("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, fullName, phone, avatarUrl }),
    });
  },

  verify: async ({ email, code }) => {
    return http("/api/auth/verify", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    });
  },

  forgotPassword: async ({ email }) => {
    return http("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async ({ email, code, newPassword }) => {
    return http("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    });
  },

  googleLogin: async ({ idToken }) => {
    return http("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  },
};
