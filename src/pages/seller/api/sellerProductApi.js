import axiosInstance from "@/config/axios";

const BASE = "/api/seller/products";

/**
 * Seller Product API
 * Maps to SellerProductController endpoints.
 */
const sellerProductApi = {
  /**
   * 1. Lay danh sach san pham (cursor + page)
   * GET /api/seller/products?lastId=0&page=0
   */
  /**
   * 1. Lay danh sach san pham (keyword + isActive + page)
   * GET /api/seller/products?keyword=&isActive=&page=0
   */
  getAll: (params = {}) => {
    const { keyword, isActive, page = 0 } = params;
    const queryParams = { page };
    if (keyword) {
      queryParams.keyword = keyword;
    }
    if (isActive !== undefined && isActive !== null) {
      queryParams.isActive = isActive;
    }
    return axiosInstance.get(BASE, {
      params: queryParams,
    });
  },

  /**
   * 2. Lay chi tiet san pham
   * GET /api/seller/products/{id}
   */
  getById: (id) => {
    return axiosInstance.get(`${BASE}/${id}`);
  },

  /**
   * 4. Tao san pham (multipart/form-data)
   * POST /api/seller/products
   *
   * @param {Object} productData — plain fields (name, basePrice, …)
   * @param {Array}  images      — array of { file: File, sortOrder, isPrimary }
   * @param {Array}  attributes  — array of { attrKey, attrValue }
   * @param {Array}  tags        — array of strings
   */
  create: ({ productData = {}, images = [], attributes = [], tags = [] }) => {
    const formData = new FormData();

    // Append scalar fields
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });

    // Append images
    images.forEach((img, idx) => {
      if (img.file) {
        formData.append(`images[${idx}].file`, img.file);
      }
      if (img.sortOrder !== undefined) {
        formData.append(`images[${idx}].sortOrder`, img.sortOrder);
      }
      if (img.isPrimary !== undefined) {
        formData.append(`images[${idx}].isPrimary`, img.isPrimary);
      }
    });

    // Append attributes
    attributes.forEach((attr, idx) => {
      formData.append(`attributes[${idx}].attrKey`, attr.attrKey);
      formData.append(`attributes[${idx}].attrValue`, attr.attrValue);
    });

    // Append tags
    tags.forEach((tag, idx) => {
      formData.append(`tags[${idx}]`, tag);
    });

    return axiosInstance.post(BASE, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * 5. Cap nhat san pham (JSON body)
   * PUT /api/seller/products/{id}
   */
  update: (id, data) => {
    return axiosInstance.put(`${BASE}/${id}`, data);
  },

  /**
   * 6. Xoa san pham
   * DELETE /api/seller/products/{id}
   * Luu y: backend hien tra ve 501 Not Implemented.
   */
  delete: (id) => {
    return axiosInstance.delete(`${BASE}/${id}`);
  },
};

export default sellerProductApi;
