import axiosInstance from "@/config/axios";

const imageApi = {
  /**
   * Upload single image file
   * POST /api/images (multipart/form-data)
   * @param {File} file
   * @returns {Promise<string>} imageUrl
   */
  upload: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axiosInstance.post("/api/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.data; // ApiResponse<String> -> data field contains URL
  },
};

export default imageApi;
