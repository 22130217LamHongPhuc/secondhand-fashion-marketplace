import { useState, useCallback } from "react";
import { sellerProductApi } from "../api";

/**
 * Custom hook for seller product operations.
 *
 * Provides:
 *  - products / product    — data state
 *  - pagination            — pagination metadata from backend
 *  - loading / error       — request status
 *  - fetchProducts         — get paginated list
 *  - fetchProductById      — get single product detail
 *  - fetchProductsByStatus — get filtered by isActive
 *  - createProduct         — create with multipart form-data
 *  - updateProduct         — update via JSON
 *  - deleteProduct         — delete by id
 */
const useSellerProducts = () => {
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState(null);
  const [pagination, setPagination] = useState({
    totalPages: 0,
    totalElements: 0,
    currentPage: 0,
    size: 5,
    isFirst: true,
    isLast: true,
    isEmpty: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* ── helpers ── */
  const extractPagination = (data) => ({
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    currentPage: data.number ?? 0,
    size: data.size ?? 5,
    isFirst: data.first ?? true,
    isLast: data.last ?? true,
    isEmpty: data.empty ?? true,
  });

  /* ── 1. Lay danh sach san pham ── */
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerProductApi.getAll(params);
      const { data } = res.data; // unwrap { data, message }
      setProducts(data.content ?? []);
      setPagination(extractPagination(data));
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch products");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 2. Lay chi tiet san pham ── */
  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerProductApi.getById(id);
      const { data } = res.data;
      setProduct(data);
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch product");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 3. Lay san pham theo trang thai ── */
  const fetchProductsByStatus = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerProductApi.getByStatus(params);
      const { data } = res.data;
      setProducts(data.content ?? []);
      setPagination(extractPagination(data));
      return data;
    } catch (err) {
      setError(err.message || "Failed to fetch products by status");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 4. Tao san pham ── */
  const createProduct = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerProductApi.create(payload);
      const { data } = res.data;
      return data;
    } catch (err) {
      setError(err.message || "Failed to create product");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 5. Cap nhat san pham ── */
  const updateProduct = useCallback(async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerProductApi.update(id, updateData);
      const { data } = res.data;
      return data;
    } catch (err) {
      setError(err.message || "Failed to update product");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── 6. Xoa san pham ── */
  const deleteProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerProductApi.delete(id);
      return res.data;
    } catch (err) {
      setError(err.message || "Failed to delete product");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // State
    products,
    product,
    pagination,
    loading,
    error,

    // Actions
    fetchProducts,
    fetchProductById,
    fetchProductsByStatus,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

export default useSellerProducts;
