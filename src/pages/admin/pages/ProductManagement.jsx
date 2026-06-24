import { useEffect, useState } from "react";
import { productService, categoryService } from "@/services/admin";
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Package, 
  Tag, 
  Layers, 
  Store, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  HelpCircle
} from "lucide-react";

const ITEMS_PER_PAGE = 10;
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80";

const getConditionLabel = (cond) => {
  if (cond === "NEW") return "Mới 100%";
  if (cond === "LIKE_NEW") return "Như mới";
  if (cond === "GOOD") return "Tốt";
  if (cond === "FAIR") return "Khá";
  if (cond === "POOR") return "Cũ";
  return cond || "Tốt";
};

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
  const [categories, setCategories] = useState([]);
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
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      const rawData = response?.data || response || [];
      setCategories(rawData);
    } catch (err) {
      console.error("Lỗi khi tải danh mục:", err);
    }
  };

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

  const filteredProducts = products
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

  const totalCount = products.length;
  const sellingCount = products.filter((product) => product.status === "selling").length;
  const pendingCount = products.filter((product) => product.status === "pending").length;
  const violationCount = products.filter((product) => product.status === "violation").length;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const startItem = filteredProducts.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length);

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

  const handleToggleStatus = async (id, isActiveVal) => {
    try {
      await productService.toggleActive(id, isActiveVal);
      alert("Đã cập nhật trạng thái sản phẩm thành công!");
      loadProducts();
    } catch (err) {
      alert("Lỗi khi đổi trạng thái sản phẩm: " + err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-full animate-[fadeIn_0.3s_ease] text-stone-800 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight m-0">Quản trị sản phẩm</h1>
          <p className="text-sm text-stone-500 m-0 mt-1">Xem thông tin sản phẩm, xét duyệt trạng thái, xóa hoặc sửa sản phẩm trên hệ thống.</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-bold cursor-pointer transition-all bg-[#c85a28] hover:bg-[#b84c1a] text-white border-none shadow-md shadow-orange-500/10 active:scale-[0.98] w-full md:w-auto"
          type="button"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Sản Phẩm</span>
        </button>
      </div>

      {/* Tabs list for Statuses */}
      <div className="flex gap-2.5 flex-wrap mb-5">
        <button
          className={`border rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all ${
            activeTab === "all"
              ? "bg-[#c85a28]/10 text-[#c85a28] border-[#c85a28]/35 shadow-sm"
              : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
          }`}
          onClick={() => {
            setActiveTab("all");
            setPage(1);
          }}
        >
          Tất cả <span className="ml-1 opacity-70">({totalCount})</span>
        </button>
        <button
          className={`border rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all ${
            activeTab === "selling"
              ? "bg-[#c85a28]/10 text-[#c85a28] border-[#c85a28]/35 shadow-sm"
              : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
          }`}
          onClick={() => {
            setActiveTab("selling");
            setPage(1);
          }}
        >
          Đang bán <span className="ml-1 opacity-70">({sellingCount})</span>
        </button>
        <button
          className={`border rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all ${
            activeTab === "pending"
              ? "bg-[#c85a28]/10 text-[#c85a28] border-[#c85a28]/35 shadow-sm"
              : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
          }`}
          onClick={() => {
            setActiveTab("pending");
            setPage(1);
          }}
        >
          Chờ duyệt <span className="ml-1 opacity-70">({pendingCount})</span>
        </button>
        <button
          className={`border rounded-xl py-2 px-4 text-xs font-bold cursor-pointer transition-all ${
            activeTab === "violation"
              ? "bg-[#c85a28]/10 text-[#c85a28] border-[#c85a28]/35 shadow-sm"
              : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
          }`}
          onClick={() => {
            setActiveTab("violation");
            setPage(1);
          }}
        >
          Vi phạm <span className="ml-1 opacity-70">({violationCount})</span>
        </button>
      </div>

      {/* Control Bar (Filters and Search) */}
      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="w-full md:flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên sản phẩm, mã SKU..."
            value={searchTerm}
            className="w-full py-2.5 pl-12 pr-4 border border-stone-200 rounded-2xl text-[13px] bg-white transition-all outline-none focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 shadow-sm placeholder-stone-400"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-full md:w-[200px] relative">
          <select
            value={sortFilter}
            onChange={(e) => {
              setSortFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2.5 pr-10 pl-4 border border-stone-200 rounded-2xl bg-white text-stone-750 font-bold text-[13px] cursor-pointer appearance-none outline-none transition-all hover:border-[#c85a28] focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 shadow-sm"
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá tăng dần</option>
            <option value="price-desc">Giá giảm dần</option>
          </select>
          <ChevronDown className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Horizontal Category Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-4.5">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter("all");
            setPage(1);
          }}
          className={`py-1.5 px-4 rounded-full border text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
            categoryFilter === "all"
              ? "bg-[#c85a28] text-white border-[#c85a28] shadow-sm"
              : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
          }`}
        >
          Tất cả danh mục
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setCategoryFilter(cat.name);
              setPage(1);
            }}
            className={`py-1.5 px-4 rounded-full border text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
              categoryFilter === cat.name
                ? "bg-[#c85a28] text-white border-[#c85a28] shadow-sm"
                : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(238,229,219,0.2)] p-6 border border-stone-200/50 flex-1 min-h-0 flex flex-col">
        {loading ? (
          <div className="text-center py-16 text-stone-400 text-sm font-semibold flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[#c85a28] animate-spin"></div>
            <span>Đang tải dữ liệu sản phẩm...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-sm text-rose-600 font-bold bg-rose-50/50 rounded-xl border border-rose-100">Lỗi kết nối: {error}</div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-150">
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider w-20">Hình ảnh</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Thông tin sản phẩm</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Danh mục</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Người bán</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Giá bán</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Kho hàng</th>
                    <th className="p-3.5 text-center font-bold text-stone-500 text-[11px] uppercase tracking-wider w-36">Trạng thái</th>
                    <th className="p-3.5 text-center font-bold text-stone-500 text-[11px] uppercase tracking-wider w-28">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pagedProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-stone-50/40 transition-colors">
                      <td className="p-3.5 align-middle">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-12 h-12 object-cover rounded-xl border border-stone-200/60 shadow-sm shrink-0" 
                          onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                        />
                      </td>
                      <td className="p-3.5 align-middle">
                        <div className="flex flex-col items-start gap-1">
                          <span className="font-extrabold text-stone-900 leading-snug">{product.name}</span>
                          <div className="flex gap-1.5 flex-wrap items-center">
                            <span className="text-[10px] text-stone-405 font-mono">SKU: {product.sku}</span>
                            {product.brand && (
                              <span className="text-[9px] bg-orange-50 text-[#c85a28] px-1.5 py-0.5 rounded font-bold border border-orange-100">
                                {product.brand}
                              </span>
                            )}
                            {product.condition && (
                              <span className="text-[9px] bg-[#e9f4d3] text-[#6a9d2e] px-1.5 py-0.5 rounded font-bold">
                                {getConditionLabel(product.condition)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 align-middle">
                        <span className="py-1 px-2.5 rounded-lg bg-stone-50 border border-stone-200/70 text-stone-605 text-xs font-semibold inline-block">
                          {product.category}
                        </span>
                      </td>
                      <td className="p-3.5 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-stone-100 text-[#c85a28] grid place-items-center text-xs font-extrabold border border-stone-200/50 shrink-0">
                            {product.sellerName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-stone-850 text-xs">{product.sellerName}</span>
                            <span className="text-[10px] text-stone-400">ID: {product.shop?.id || product.shopId || 1}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 align-middle font-bold text-[#c85a28]">
                        {product.price?.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="p-3.5 align-middle">
                        {product.stock > 0 ? (
                          <span className="text-emerald-700 font-semibold">{product.stock} chiếc</span>
                        ) : (
                          <span className="text-rose-700 bg-rose-50 border border-rose-100 py-0.5 px-2 rounded text-[10px] font-bold">Hết hàng</span>
                        )}
                      </td>
                      <td className="p-3.5 align-middle text-center">
                        <select
                          value={product.isActive ? "active" : "inactive"}
                          onChange={(e) => handleToggleStatus(product.id, e.target.value === "active")}
                          className={`py-1 px-3 border rounded-full text-xs font-bold cursor-pointer outline-none transition-all ${
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          <option value="active">Đang bán</option>
                          <option value="inactive">Khóa bán</option>
                        </select>
                      </td>
                      <td className="p-3.5 align-middle text-center">
                        <div className="flex gap-1.5 justify-center items-center">
                          {/* Modern Google Style CRUD icons */}
                          <button
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            type="button"
                            onClick={() => handleOpenModal(product)}
                            title="Sửa sản phẩm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            type="button"
                            onClick={() => handleDelete(product.id)}
                            title="Xóa sản phẩm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination & Status bar */}
            <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
              <button
                onClick={() => setPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="py-2 px-4 bg-white border border-stone-250 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Trước</span>
              </button>
              
              <div className="text-stone-400 text-xs font-semibold">
                Hiển thị {startItem} - {endItem} trên {filteredProducts.length} sản phẩm
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="py-2 px-4 bg-white border border-stone-250 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 rounded-xl font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1"
              >
                <span>Sau</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-stone-400 text-sm font-semibold flex flex-col items-center justify-center gap-3.5">
            <Package className="w-10 h-10 text-stone-300" />
            <span>Không tìm thấy sản phẩm nào phù hợp.</span>
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1100] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl border border-stone-200/60 overflow-hidden animate-[scaleIn_0.2s_ease-out] [color-scheme:light]">
            
            {/* Modal Header */}
            <div className="bg-stone-50 p-4 px-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="m-0 text-base font-extrabold text-stone-900">
                {editingProduct ? "Chỉnh sửa Sản phẩm" : "Tạo Sản phẩm mới"}
              </h3>
              <button 
                className="bg-none border-none text-stone-400 cursor-pointer p-1 rounded-lg hover:bg-stone-200/50 hover:text-stone-900 transition-colors flex items-center justify-center"
                onClick={handleCloseModal}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-white">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tên sản phẩm *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Mô tả sản phẩm</label>
                <textarea
                  name="description"
                  value={formData.description}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={handleFormChange}
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Thương hiệu</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={handleFormChange}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Xuất xứ</label>
                  <input
                    type="text"
                    name="originCountry"
                    value={formData.originCountry}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Danh mục sản phẩm *</label>
                  <div className="relative">
                    <select
                      name="categoryId"
                      value={formData.categoryId || ""}
                      className="appearance-none w-full bg-white border border-stone-200 rounded-xl p-2.5 pr-9 text-sm text-stone-700 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 cursor-pointer"
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Cửa hàng (Shop ID) *</label>
                  <input
                    type="number"
                    name="shopId"
                    value={formData.shopId}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={handleFormChange}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tình trạng *</label>
                  <div className="relative">
                    <select
                      name="condition"
                      value={formData.condition}
                      className="appearance-none w-full bg-white border border-stone-200 rounded-xl p-2.5 pr-9 text-sm text-stone-700 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 cursor-pointer"
                      onChange={handleFormChange}
                    >
                      <option value="NEW">Mới</option>
                      <option value="LIKE_NEW">Như mới</option>
                      <option value="GOOD">Tốt</option>
                      <option value="FAIR">Khá</option>
                      <option value="POOR">Kém</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Số lượng kho *</label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={handleFormChange}
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Giá gốc *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-855 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={handleFormChange}
                    required
                    min="0"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Giá bán (Khuyến mãi)</label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-855 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={handleFormChange}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Hình ảnh (Mỗi URL một dòng)</label>
                <textarea
                  name="imageUrls"
                  value={formData.imageUrls}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="https://example.com/img1.jpg&#10;https://example.com/img2.jpg"
                />
              </div>

              <div className="flex justify-end gap-2.5 mt-4 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  className="bg-stone-100 hover:bg-stone-200/80 text-stone-700 py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] border-none"
                  onClick={handleCloseModal}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="bg-[#c85a28] hover:bg-[#b84c1a] text-white py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm shadow-orange-700/20 border-none"
                >
                  {editingProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
