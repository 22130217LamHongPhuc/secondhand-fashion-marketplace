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
    const { keyword, isActive, fromDate, toDate, minPrice, maxPrice, page = 0 } = params;
    const queryParams = { page };
    if (keyword) {
      queryParams.keyword = keyword;
    }
    if (isActive !== undefined && isActive !== null) {
      queryParams.isActive = isActive;
    }
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;
    if (minPrice !== undefined && minPrice !== null) queryParams.minPrice = minPrice;
    if (maxPrice !== undefined && maxPrice !== null) queryParams.maxPrice = maxPrice;
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
    const payload = {
      ...productData,
      categoryId: productData.categoryId ? Number(productData.categoryId) : null,
      basePrice: productData.basePrice ? Number(productData.basePrice) : null,
      salePrice: productData.salePrice ? Number(productData.salePrice) : null,
      stockQuantity: productData.stockQuantity !== "" ? Number(productData.stockQuantity) : 0,
      images: images.map((img, idx) => ({
        imageUrl: img.imageUrl,
        sortOrder: img.sortOrder !== undefined ? img.sortOrder : idx,
        isPrimary: img.isPrimary || false,
      })),
      attributes: attributes.map((attr) => ({
        attrKey: attr.attrKey,
        attrValue: attr.attrValue,
      })),
      tags: tags,
    };

    return axiosInstance.post(BASE, payload);
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
