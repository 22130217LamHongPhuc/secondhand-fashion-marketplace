import { env } from "@/config/env";

export async function http(path, options = {}) {
  const baseUrl = env.apiBaseUrl || window.location.origin;
  // Ensure we don't have double slashes and keep the base path (like /api)
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${baseUrl.endsWith("/") ? baseUrl : baseUrl + "/"}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}: ${text || response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}
