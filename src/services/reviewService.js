import { http } from "./http";

const API_BASE = "http://localhost:8080/api/customer/reviews";
export const reviewService = {
  async createReview({ orderId, productId, rating, comment, images }) {
    const formData = new FormData();

    formData.append("orderId", orderId);
    formData.append("productId", productId);
    formData.append("rating", rating);
    formData.append("comment", comment);

    images.forEach((file) => {
      formData.append("images", file);
    });
    console.log("formData", formData);

    const response = await fetch(API_BASE, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message ?? "Failed to create review");
    }
    return data;
  },
};
