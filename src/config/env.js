const defaultApiBaseUrl =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:8080";

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
};
