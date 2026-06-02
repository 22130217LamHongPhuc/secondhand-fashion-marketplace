import { useEffect, useState } from "react";
import { productService } from "@/services/admin";
import "./ProductManagement.css";

const ITEMS_PER_PAGE = 10;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80";

const normalizeProduct = (product) => {
  const primaryImage = product?.images?.[0]?.url || product?.image || FALLBACK_IMAGE;
  const categoryName = product?.category?.name || product?.categoryName || product?.category || "Chưa phân loại";
  const priceValue = product?.salePrice ?? product?.basePrice ?? product?.price ?? 0;
  const stockValue = product?.stockQuantity ?? product?.stock ?? 0;
  const isActive = product?.isActive ?? product?.status === "selling";
  const sellerName = product?.shop?.name || product?.sellerName || product?.seller || "Cửa hàng";
  const sellerMeta = product?.condition || product?.sellerMeta || "Dữ liệu từ DB";

  return {
    ...product,
    category: categoryName,
    price: Number(priceValue) || 0,
    stock: Number(stockValue) || 0,
    image: primaryImage,
    status: product?.status || (isActive ? "selling" : "pending"),
    sellerName,
    sellerMeta,
    sku: product?.sku || `SKU-${String(product?.id ?? "").slice(-3) || "000"}`,
    createdAt: product?.createdAt || new Date().toISOString(),
  };
};

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    brand: "",
    originCountry: "",
    condition: "GOOD",
    basePrice: "",
    salePrice: "",
    stockQuantity: "",
    categoryId: 1,
    shopId: 1,
    imageUrls: "",
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      const rawData = response?.data || response || {};
      const apiProducts = rawData.data || rawData.content || rawData.items || (Array.isArray(rawData) ? rawData : []);
      setProducts(apiProducts.map(normalizeProduct));
      setError(null);
    } catch (err) {
      setProducts([]);
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const normalizedProducts = products;

  const filteredProducts = normalizedProducts
    .filter((product) => {
      const searchValue = searchTerm.trim().toLowerCase();
      const matchesSearch =
        !searchValue ||
        [product.name, product.sku, product.category, product.sellerName]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchValue));

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "selling" && product.status === "selling") ||
        (activeTab === "pending" && product.status === "pending") ||
        (activeTab === "violation" && product.status === "violation");

      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

      return matchesSearch && matchesTab && matchesCategory;
    })
    .sort((a, b) => {
      if (sortFilter === "price-asc") return a.price - b.price;
      if (sortFilter === "price-desc") return b.price - a.price;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const totalCount = normalizedProducts.length;
  const sellingCount = normalizedProducts.filter((product) => product.status === "selling").length;
  const pendingCount = normalizedProducts.filter((product) => product.status === "pending").length;
  const violationCount = normalizedProducts.filter((product) => product.status === "violation").length;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

  const getStatusLabel = (status) => {
    if (status === "selling") return "Đang bán";
    if (status === "pending") return "Chờ duyệt";
    if (status === "violation") return "Vi phạm";
    return "Đang bán";
  };

  const getStatusClass = (status) => {
    if (status === "selling") return "status-badge status-selling";
    if (status === "pending") return "status-badge status-pending";
    if (status === "violation") return "status-badge status-violation";
    return "status-badge status-selling";
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || "",
        description: product.description || "",
        brand: product.brand || "",
        originCountry: product.originCountry || "",
        condition: product.condition || "GOOD",
        basePrice: product.basePrice || product.price || "",
        salePrice: product.salePrice || "",
        stockQuantity: product.stockQuantity || product.stock || "",
        categoryId: product.category?.id || product.categoryId || 1,
        shopId: product.shop?.id || product.shopId || 1,
        imageUrls: product.images?.map(i => i.url).join("\n") || product.image || "",
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        brand: "",
        originCountry: "",
        condition: "GOOD",
        basePrice: "",
        salePrice: "",
        stockQuantity: "",
        categoryId: 1,
        shopId: 1,
        imageUrls: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        basePrice: parseFloat(formData.basePrice) || 0,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        categoryId: parseInt(formData.categoryId) || null,
        shopId: parseInt(formData.shopId) || 1,
        imageUrls: formData.imageUrls.split("\n").filter((url) => url.trim() !== ""),
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await productService.create(payload);
        alert("Tạo sản phẩm thành công!");
      }
      handleCloseModal();
      loadProducts();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.delete(id);
        alert("Xóa sản phẩm thành công!");
        loadProducts();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  return (
    <div className="product-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản trị sản phẩm</h1>
        </div>
        <button className="btn btn-primary btn-create" type="button" onClick={() => handleOpenModal()}>
          + Tạo Listing Mới
        </button>
      </div>

      <div className="tabs-row">
        <button className={`tab-pill ${activeTab === "all" ? "active" : ""}`} onClick={() => { setActiveTab("all"); setPage(1); }}>Tất cả <span>({totalCount})</span></button>
        <button className={`tab-pill ${activeTab === "selling" ? "active" : ""}`} onClick={() => { setActiveTab("selling"); setPage(1); }}>Đang bán <span>({sellingCount})</span></button>
        <button className={`tab-pill ${activeTab === "pending" ? "active" : ""}`} onClick={() => { setActiveTab("pending"); setPage(1); }}>Chờ duyệt <span>({pendingCount})</span></button>
        <button className={`tab-pill ${activeTab === "violation" ? "active" : ""}`} onClick={() => { setActiveTab("violation"); setPage(1); }}>Vi phạm <span>({violationCount})</span></button>
      </div>

      <div className="control-bar">
        <div className="search-box large">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="btn btn-secondary filter-btn" type="button" onClick={() => { setCategoryFilter(categoryFilter === "all" ? "phụ kiện" : "all"); setPage(1); }}>
          Danh mục
        </button>
        <button className="btn btn-secondary filter-btn" type="button" onClick={() => { setSortFilter(sortFilter === "newest" ? "price-desc" : "newest"); setPage(1); }}>
          Mới nhất
        </button>
      </div>

      {/* Products Table */}
      <div className="products-section">
        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="error">Lỗi: {error}</div>
        ) : filteredProducts.length > 0 ? (
          <>
            <table className="products-table">
              <thead>
                <tr>
                  <th>HÌNH ẢNH</th>
                  <th>Tên sản phẩm</th>
                  <th>Người bán</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {pagedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img src={product.image} alt={product.name} className="product-thumb large" />
                    </td>
                    <td>
                      <div className="product-name-cell">
                        <span className="product-name">{product.name}</span>
                        <span className="product-sku">SKU: {product.sku}</span>
                      </div>
                    </td>
                    <td>
                      <div className="seller-cell">
                        <div className="seller-avatar">{product.sellerName.slice(0, 2).toUpperCase()}</div>
                        <div className="seller-meta">
                          <span className="seller-name">{product.sellerName}</span>
                          <span className="seller-role">{product.sellerMeta}</span>
                        </div>
                      </div>
                    </td>
                    <td className="price-cell">{product.price?.toLocaleString("vi-VN")}đ</td>
                    <td>
                      <span className={getStatusClass(product.status)}>{getStatusLabel(product.status)}</span>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-wrapper">
                        <button className="btn-icon btn-edit" type="button" onClick={() => handleOpenModal(product)} title="Sửa sản phẩm">
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/>
                          </svg>
                        </button>
                        <button className="btn-icon btn-delete" type="button" onClick={() => handleDelete(product.id)} title="Xóa sản phẩm">
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Sau
              </button>
            </div>
            <div className="table-footer">Hiển thị {startItem}-{endItem} của {filteredProducts.length} sản phẩm</div>
          </>
        ) : (
          <div className="empty-state">Chưa có sản phẩm nào</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? "Chỉnh sửa Sản phẩm" : "Tạo Sản phẩm mới"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea name="description" value={formData.description} onChange={handleFormChange} rows="3" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleFormChange} />
                </div>
                <div className="form-group">
                  <label>Xuất xứ</label>
                  <input type="text" name="originCountry" value={formData.originCountry} onChange={handleFormChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tình trạng *</label>
                  <select name="condition" value={formData.condition} onChange={handleFormChange}>
                    <option value="NEW">Mới</option>
                    <option value="LIKE_NEW">Như mới</option>
                    <option value="GOOD">Tốt</option>
                    <option value="FAIR">Khá</option>
                    <option value="POOR">Kém</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Số lượng kho *</label>
                  <input type="number" name="stockQuantity" value={formData.stockQuantity} onChange={handleFormChange} required min="0" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Giá gốc *</label>
                  <input type="number" name="basePrice" value={formData.basePrice} onChange={handleFormChange} required min="0" />
                </div>
                <div className="form-group">
                  <label>Giá bán (Khuyến mãi)</label>
                  <input type="number" name="salePrice" value={formData.salePrice} onChange={handleFormChange} min="0" />
                </div>
              </div>
              <div className="form-group">
                <label>Hình ảnh (Mỗi URL một dòng)</label>
                <textarea name="imageUrls" value={formData.imageUrls} onChange={handleFormChange} rows="3" placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Hủy</button>
                <button type="submit" className="btn btn-primary">{editingProduct ? "Cập nhật" : "Tạo mới"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
