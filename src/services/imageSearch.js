import { http } from "@/services/http";

const API_BASE =
  "http://localhost:8000/api/image-search/search-by-image?limit=10";
export async function searchProductsByImage({ file, limit = 10 }) {
  if (!file) {
    throw new Error("Missing file");
  }

  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(API_BASE, {
    method: "POST",
    body: formData,
  });
  const data = await res.json();

  console.log("Search by image result:", data);
  return data;
}
