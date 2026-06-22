import { env } from "@/config/env";

export async function http(path, options = {}) {
  const baseUrl = env.apiBaseUrl || window.location.origin;
  // Ensure we don't have double slashes and keep the base path (like /api)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${cleanPath}`;

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers ?? {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData && !hasHeader(headers, "Content-Type")) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === "object" && parsed.message) {
        errorMessage = parsed.message;
      }
    } catch (e) {
      if (text) errorMessage = text;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

function hasHeader(headers, name) {
  const target = name.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === target);
}
