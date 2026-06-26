import { http } from "./http";

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

    const token = localStorage.getItem("token");
    return http("/api/customer/reviews", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
  },
};
