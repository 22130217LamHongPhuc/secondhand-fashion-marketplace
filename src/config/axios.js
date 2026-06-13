import axios from "axios";
import { env } from "./env";

/**
 * Shared Axios instance.
 * - baseURL is read from VITE_API_BASE_URL (.env) or falls back to current origin.
 * - Request interceptor attaches the Bearer token from localStorage.
 * - Response interceptor unwraps successful responses and normalises errors
 *   into a consistent shape that matches the backend error contract.
 */
const axiosInstance = axios.create({
  baseURL: env.apiBaseUrl || window.location.origin,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ──────────────────────────────────────────────
   REQUEST INTERCEPTOR
   ────────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/* ──────────────────────────────────────────────
   RESPONSE INTERCEPTOR
   ────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  // Success — return the full axios response so callers can read headers etc.
  (response) => response,

  // Error — normalise into a predictable shape
  (error) => {
    if (error.response) {
      // Server responded with a status outside 2xx
      const { status, data } = error.response;

      // Optional: redirect to login on 401
      if (status === 401) {
        localStorage.removeItem("token");
        // window.location.href = "/login";
      }

      // Re-throw with the backend error body so hooks can read `message`, `errors`, etc.
      return Promise.reject({
        status,
        message: data?.message || error.message,
        errors: data?.errors || {},
        raw: data,
      });
    }

    // Network error / timeout
    return Promise.reject({
      status: 0,
      message: error.message || "Network error",
      errors: {},
      raw: null,
    });
  },
);

export default axiosInstance;
