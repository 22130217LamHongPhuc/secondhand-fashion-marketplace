import { env } from "@/config/env";

export async function searchProductsByImage({ file, limit = 10 }) {
  if (!file) {
    throw new Error("Missing file");
  }

  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = env.apiBaseUrl || window.location.origin;
  const url = `${baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl}/api/image-search/search-by-image?limit=${limit}`;

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();

  console.log("Search by image result:", data);
  return data;
}
