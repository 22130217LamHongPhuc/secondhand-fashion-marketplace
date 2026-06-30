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
   GLOBAL LOADING FOR SELLER APIS
   ────────────────────────────────────────────── */
let activeSellerRequests = 0;
const handleSellerRequest = (isStarting) => {
  if (isStarting) {
    activeSellerRequests++;
    if (activeSellerRequests === 1) {
      window.dispatchEvent(new CustomEvent("seller-api-loading", { detail: true }));
    }
  } else {
    activeSellerRequests = Math.max(0, activeSellerRequests - 1);
    if (activeSellerRequests === 0) {
      window.dispatchEvent(new CustomEvent("seller-api-loading", { detail: false }));
    }
  }
};

/* ──────────────────────────────────────────────
   REQUEST INTERCEPTOR
   ────────────────────────────────────────────── */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }

    if (config.url?.includes("/seller") && config.method?.toLowerCase() !== "get") {
      handleSellerRequest(true);
    }

    return config;
  },
  (error) => {
    if (error.config?.url?.includes("/seller") && error.config?.method?.toLowerCase() !== "get") {
      handleSellerRequest(false);
    }
    return Promise.reject(error);
  }
);

/* ──────────────────────────────────────────────
   RESPONSE INTERCEPTOR
   ────────────────────────────────────────────── */
axiosInstance.interceptors.response.use(
  // Success — return the full axios response so callers can read headers etc.
  (response) => {
    if (response.config?.url?.includes("/seller") && response.config?.method?.toLowerCase() !== "get") {
      handleSellerRequest(false);
    }
    return response;
  },

  // Error — normalise into a predictable shape
  (error) => {
    if (error.config?.url?.includes("/seller") && error.config?.method?.toLowerCase() !== "get") {
      handleSellerRequest(false);
    }

    if (error.response) {
      // Server responded with a status outside 2xx
      const { status, data } = error.response;

      // Clear auth and redirect to login on 401
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/?login=true";
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
