import { useEffect, useState } from "react";
import { productService } from "@/services/admin";
import "./ProductManagement.css";

const demoProducts = [
  {
    id: 8492,
    name: "Máy ảnh Film Vintage Canon AE-1",
    sellerName: "Minh Anh",
    sellerMeta: "Thành viên 2 năm",
    price: 2500000,
    category: "máy ảnh",
    status: "selling",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=300&q=80",
    createdAt: "2024-10-24T14:30:00.000Z",
    sku: "CAM-B82-V",
  },
  {
    id: 8491,
    name: "Túi Cói Vintage Form Rộng Mùa Hè",
    sellerName: "Lan Ngọc",
    sellerMeta: "Thành viên mới",
    price: 350000,
    category: "phụ kiện",
    status: "pending",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80",
    createdAt: "2024-10-24T09:15:00.000Z",
    sku: "BAG-109-S",
  },
  {
    id: 8488,
    name: "Bình Gốm Cổ Bát Tràng Họa Tiết...",
    sellerName: "Hoàng Tuấn",
    sellerMeta: "Cảnh cáo (1)",
    price: 800000,
    category: "đồ decor",
    status: "violation",
    image: "https://images.unsplash.com/photo-1509749837427-ac94a2553d0e?auto=format&fit=crop&w=300&q=80",
    createdAt: "2024-10-23T16:45:00.000Z",
    sku: "DEC-188-T",
  },
  {
    id: 8485,
    name: "Ghế Gỗ Sồi Bắc Âu (Like New)",
    sellerName: "Đức Phát",
    sellerMeta: "Thành viên Uy tín",
    price: 1200000,
    category: "nội thất",
    status: "selling",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80",
    createdAt: "2024-10-22T10:20:00.000Z",
    sku: "FUR-332-W",
  },
];

export function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("newest");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadProducts();
  }, [page, searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = searchTerm ? { search: searchTerm } : {};
      const response = await productService.getAll(page, 10, filters);
      const apiProducts = response.data || [];
      setProducts(apiProducts.length > 0 ? apiProducts : demoProducts);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      if (!searchTerm) {
        setProducts(demoProducts);
        setTotalPages(1);
      } else {
        setError(err.message);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.update(editingProduct.id, formData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await productService.create(formData);
        alert("Thêm sản phẩm thành công!");
      }
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image: "",
      });
      loadProducts();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      image: product.image,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.delete(id);
        alert("Xóa sản phẩm thành công!");
        loadProducts();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: "",
    });
  };

  const normalizedProducts = products.map((product) => {
    const status = product.status || (product.stock === 0 ? "pending" : "selling");
    return {
      ...product,
      status,
      sellerName: product.sellerName || product.seller || "Minh Anh",
      sellerMeta: product.sellerMeta || "Thành viên mới",
      sku: product.sku || `SKU-${String(product.id).slice(-3)}`,
    };
  });

  const filteredProducts = normalizedProducts
    .filter((product) => {
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "selling" && product.status === "selling") ||
        (activeTab === "pending" && product.status === "pending") ||
        (activeTab === "violation" && product.status === "violation");
      const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;
      return matchesTab && matchesCategory;
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

  return (
    <div className="product-management">
      <div className="page-header">
        <div>
          <p className="page-kicker">Quản trị sản phẩm - Admin Panel</p>
          <h1 className="page-title">Quản trị sản phẩm</h1>
        </div>
        <button
          className="btn btn-primary btn-create"
          onClick={() => {
            setShowForm(true);
            setEditingProduct(null);
          }}
        >
          + Tạo Listing Mới
        </button>
      </div>

      <div className="tabs-row">
        <button className={`tab-pill ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>Tất cả <span>({totalCount})</span></button>
        <button className={`tab-pill ${activeTab === "selling" ? "active" : ""}`} onClick={() => setActiveTab("selling")}>Đang bán <span>({sellingCount})</span></button>
        <button className={`tab-pill ${activeTab === "pending" ? "active" : ""}`} onClick={() => setActiveTab("pending")}>Chờ duyệt <span>({pendingCount})</span></button>
        <button className={`tab-pill ${activeTab === "violation" ? "active" : ""}`} onClick={() => setActiveTab("violation")}>Vi phạm <span>({violationCount})</span></button>
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
        <button className="btn btn-secondary filter-btn" type="button" onClick={() => setCategoryFilter(categoryFilter === "all" ? "phụ kiện" : "all")}>
          Danh mục
        </button>
        <button className="btn btn-secondary filter-btn" type="button" onClick={() => setSortFilter(sortFilter === "newest" ? "price-desc" : "newest")}>
          Mới nhất
        </button>
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? "Cập nhật Sản phẩm" : "Thêm Sản phẩm mới"}</h2>
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên sản phẩm"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Nhập mô tả sản phẩm"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="form-group">
                  <label>Số lượng *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="">Chọn danh mục</option>
                  <option value="áo">Áo</option>
                  <option value="quần">Quần</option>
                  <option value="váy">Váy</option>
                  <option value="giày">Giày</option>
                  <option value="phụ kiện">Phụ kiện</option>
                </select>
              </div>

              <div className="form-group">
                <label>Link ảnh</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? "Cập nhật" : "Thêm"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                {filteredProducts.map((product) => (
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
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleEdit(product)}
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(product.id)}
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Sau
              </button>
            </div>
            <div className="table-footer">Hiển thị 1-10 của {filteredProducts.length} sản phẩm</div>
          </>
        ) : (
          <div className="empty-state">Chưa có sản phẩm nào</div>
        )}
      </div>
    </div>
  );
}
