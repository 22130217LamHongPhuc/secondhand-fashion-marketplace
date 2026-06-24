import React, { useState, useEffect } from "react";
import { categoryService } from "../../../services/admin";
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen, 
  Pencil, 
  Trash2, 
  X, 
  ChevronDown, 
  Layers, 
  Shirt, 
  ShoppingBag 
} from "lucide-react";

export function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedParentId, setSelectedParentId] = useState(1); // Default show Subcategories of "Thời trang Nam"
  
  // Modal / Form state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formIcon, setFormIcon] = useState("");
  const [formParentId, setFormParentId] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  const renderCategoryIcon = (name, iconUrl) => {
    const lowerName = (name || "").toLowerCase();
    
    if (iconUrl && iconUrl.trim() && iconUrl !== "📁" && iconUrl !== "🌳" && iconUrl.length <= 4) {
      return <span className="text-base">{iconUrl}</span>;
    }

    // Shirt / Apparel (Áo, Áo thun, Áo sơ mi)
    if (lowerName.includes("áo thun") || lowerName.includes("áo sơ mi") || lowerName === "áo") {
      return <Shirt className="w-4 h-4 text-[#c85a28]" />;
    }
    
    // Pants / Jeans (Quần)
    if (lowerName.includes("quần") || lowerName.includes("jeans") || lowerName.includes("denim")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c85a28]">
          <path d="M6 2L3 22h7l2-9 2 9h7L18 2H6z"/>
        </svg>
      );
    }
    
    // Jacket / Outerwear (Áo khoác)
    if (lowerName.includes("áo khoác") || lowerName.includes("jacket") || lowerName.includes("blazer")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c85a28]">
          <path d="M5 3L2 21h7l3-10 3 10h7L19 3H5z"/>
          <path d="M12 3v8"/>
        </svg>
      );
    }
    
    // Dress / Skirt (Váy & Đầm)
    if (lowerName.includes("váy") || lowerName.includes("đầm") || lowerName.includes("dress") || lowerName.includes("skirt")) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#c85a28]">
          <path d="M6 3h12l3 18H3L6 3z"/>
          <path d="M12 3v18"/>
          <path d="M6 8h12"/>
        </svg>
      );
    }
    
    // Accessories / Shoes (Phụ kiện)
    if (lowerName.includes("phụ kiện") || lowerName.includes("túi") || lowerName.includes("giày") || lowerName.includes("kính") || lowerName.includes("accessories")) {
      return <ShoppingBag className="w-4 h-4 text-[#c85a28]" />;
    }

    // Default icon (Folder)
    return <Folder className="w-4 h-4 text-[#c85a28]" />;
  };

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAll()
      .then((res) => {
        if (res && Array.isArray(res)) {
          setCategories(res);
          const parents = res.filter(c => c.parentId === null);
          if (parents.length > 0) {
            setSelectedParentId(parents[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi tải danh mục:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);
  
  const parentCategories = categories.filter((c) => c.parentId === null);
  
  const subCategories = categories.filter(
    (c) => c.parentId === selectedParentId && c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-5 w-full text-stone-855 pb-10 min-h-[50vh] justify-center items-center">
        <div className="w-10 h-10 border-4 border-[#c85a28]/20 border-t-[#c85a28] rounded-full animate-spin"></div>
        <h2 className="text-stone-750 text-base font-bold">Đang tải sơ đồ danh mục thực tế từ Database...</h2>
      </div>
    );
  }

  const getParentName = (parentId) => {
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Không có";
  };

  const handleNameChange = (val) => {
    setFormName(val);
    const slug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setFormSlug(slug);
  };

  const handleOpenAdd = (type) => {
    setIsEditing(false);
    setEditId(null);
    setFormName("");
    setFormSlug("");
    setFormIcon("");
    setFormParentId(type === "sub" ? selectedParentId.toString() : "");
    setFormSortOrder(categories.length + 1);
    setFormIsActive(true);
    setShowFormModal(true);
  };

  const handleOpenEdit = (category) => {
    setIsEditing(true);
    setEditId(category.id);
    setFormName(category.name);
    setFormSlug(category.slug);
    setFormIcon(category.iconUrl || "");
    setFormParentId(category.parentId ? category.parentId.toString() : "");
    setFormSortOrder(category.sortOrder);
    setFormIsActive(category.isActive);
    setShowFormModal(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formSlug.trim()) {
      alert("Vui lòng điền đầy đủ tên và slug!");
      return;
    }

    const payload = {
      parentId: formParentId ? parseInt(formParentId) : null,
      name: formName,
      slug: formSlug,
      iconUrl: formIcon || "📁",
      sortOrder: parseInt(formSortOrder) || 0,
      isActive: formIsActive
    };

    if (isEditing) {
      categoryService.update(editId, payload)
        .then(() => {
          alert("Đã cập nhật danh mục thành công!");
          fetchCategories();
        })
        .catch(err => alert("Lỗi khi cập nhật danh mục: " + err.message));
    } else {
      categoryService.create(payload)
        .then(() => {
          alert("Đã tạo mới danh mục thành công!");
          fetchCategories();
        })
        .catch(err => alert("Lỗi khi tạo mới danh mục: " + err.message));
    }

    setShowFormModal(false);
  };

  const handleToggleStatus = (id) => {
    const target = categories.find(c => c.id === id);
    if (!target) return;

    categoryService.update(id, {
      ...target,
      isActive: !target.isActive
    })
      .then(() => {
        fetchCategories();
      })
      .catch(err => alert("Lỗi khi đổi trạng thái danh mục: " + err.message));
  };

  const handleDeleteCategory = (id) => {
    const hasChildren = categories.some((c) => c.parentId === id);
    if (hasChildren) {
      alert("Không thể xóa danh mục cha đang chứa các danh mục con! Vui lòng xóa danh mục con trước.");
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      categoryService.delete(id)
        .then(() => {
          alert("Đã xóa danh mục thành công!");
          fetchCategories();
        })
        .catch(err => alert("Lỗi khi xóa danh mục: " + err.message));
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full text-stone-850 pb-10 animate-[fadeIn_0.35s_ease-out]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight m-0 flex items-center gap-2">
            Quản lý Danh mục Hệ thống
          </h1>
          <p className="text-sm text-stone-500 m-0 mt-1">Cấu hình danh mục sản phẩm 2 lớp (cha - con) để người dùng dễ dàng tìm kiếm và đăng bán đồ cũ.</p>
        </div>
        
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button 
            className="flex-1 sm:flex-initial rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all bg-stone-900 text-white hover:bg-stone-800 active:scale-[0.98] shadow-sm border-none"
            onClick={() => handleOpenAdd("parent")}
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Danh mục Cha</span>
          </button>
          
          <button 
            className="flex-1 sm:flex-initial rounded-xl py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 active:scale-[0.98] shadow-sm"
            onClick={() => handleOpenAdd("sub")}
          >
            <Plus className="w-4 h-4 text-[#c85a28]" />
            <span>Thêm Danh mục Con</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.9fr] gap-6">
        
        {/* Left Column: Parent Categories List */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.15)] flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3.5 border-b border-stone-100">
            <Layers className="w-4.5 h-4.5 text-[#c85a28]" />
            <h3 className="text-xs font-black text-stone-900 m-0 uppercase tracking-wider">
              Danh mục Cha ({parentCategories.length})
            </h3>
          </div>
          
          <div className="flex flex-col gap-2.5 max-h-[600px] overflow-y-auto pr-1">
            {parentCategories.map((parent) => (
              <div 
                key={parent.id} 
                className={`border rounded-2xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 ${
                  selectedParentId === parent.id 
                    ? "bg-orange-50/30 border-[#c85a28] shadow-[0_6px_20px_rgba(200,90,40,0.06)]" 
                    : "border-stone-200/70 bg-stone-50/10 hover:bg-stone-50/40"
                }`}
                onClick={() => setSelectedParentId(parent.id)}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all duration-300 ${
                    selectedParentId === parent.id 
                      ? "bg-white border-[#c85a28]/40 text-[#c85a28]" 
                      : "bg-white border-stone-200/80 text-stone-600"
                  }`}>
                    {renderCategoryIcon(parent.name, parent.iconUrl)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="text-sm font-bold text-stone-900 leading-tight m-0">{parent.name}</h4>
                    <span className="text-[10px] text-stone-400 font-mono">/{parent.slug}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <select 
                    value={parent.isActive ? "active" : "inactive"} 
                    onChange={() => handleToggleStatus(parent.id)}
                    className={`py-1 px-2.5 border rounded-full text-[10px] font-bold cursor-pointer outline-none transition-all ${
                      parent.isActive 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    }`}
                  >
                    <option value="active">Bật</option>
                    <option value="inactive">Khóa</option>
                  </select>
                  
                  <button 
                    className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center" 
                    title="Sửa" 
                    onClick={() => handleOpenEdit(parent)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center" 
                    title="Xóa" 
                    onClick={() => handleDeleteCategory(parent.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Subcategories Table */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.15)] flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-3.5 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4.5 h-4.5 text-[#c85a28]" />
              <h3 className="text-xs font-black text-stone-900 m-0 uppercase tracking-wider">
                Danh mục Con của <span className="text-[#c85a28] font-black">"{getParentName(selectedParentId)}"</span>
              </h3>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-[220px]">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Tìm danh mục con..." 
                value={searchTerm}
                className="bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-750 w-full placeholder-stone-400 outline-none transition-all focus:bg-white focus:border-[#c85a28] focus:ring-2 focus:ring-[#c85a28]/10"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-200/70">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="p-3 text-center text-[10px] font-bold text-stone-500 tracking-wider uppercase w-20">Icon</th>
                  <th className="p-3 text-left text-[10px] font-bold text-stone-500 tracking-wider uppercase">Tên danh mục</th>
                  <th className="p-3 text-left text-[10px] font-bold text-stone-500 tracking-wider uppercase">Slug / Đường dẫn</th>
                  <th className="p-3 text-center text-[10px] font-bold text-stone-500 tracking-wider uppercase w-20">Thứ tự</th>
                  <th className="p-3 text-center text-[10px] font-bold text-stone-500 tracking-wider uppercase w-32">Trạng thái</th>
                  <th className="p-3 text-center text-[10px] font-bold text-stone-500 tracking-wider uppercase w-24">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {subCategories.length > 0 ? (
                  subCategories.map((sub) => (
                    <tr key={sub.id} className="hover:bg-stone-50/40 transition-colors">
                      <td className="p-3 align-middle text-center">
                        <div className="w-8 h-8 rounded-xl bg-stone-50 inline-flex items-center justify-center border border-stone-200/50 shadow-sm">
                          {renderCategoryIcon(sub.name, sub.iconUrl)}
                        </div>
                      </td>
                      <td className="p-3 align-middle text-sm font-semibold text-stone-900">
                        {sub.name}
                      </td>
                      <td className="p-3 align-middle text-xs text-stone-500 font-mono">
                        /{sub.slug}
                      </td>
                      <td className="p-3 align-middle text-center text-sm font-bold text-[#c85a28]">
                        {sub.sortOrder}
                      </td>
                      <td className="p-3 align-middle text-center">
                        <select 
                          value={sub.isActive ? "active" : "inactive"} 
                          onChange={() => handleToggleStatus(sub.id)}
                          className={`py-1 px-3 border rounded-full text-xs font-bold cursor-pointer outline-none transition-all ${
                            sub.isActive 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" 
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          <option value="active">Đang chạy</option>
                          <option value="inactive">Tạm khóa</option>
                        </select>
                      </td>
                      <td className="p-3 align-middle text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center" 
                            title="Sửa" 
                            onClick={() => handleOpenEdit(sub)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center" 
                            title="Xóa" 
                            onClick={() => handleDeleteCategory(sub.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-stone-400 text-xs font-semibold">
                      Không tìm thấy danh mục con nào!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal for Add/Edit Category */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1100] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl border border-stone-200/60 overflow-hidden animate-[scaleIn_0.2s_ease-out] [color-scheme:light]">
            
            {/* Modal Header */}
            <div className="bg-stone-50 p-4 px-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="m-0 text-base font-extrabold text-stone-900">
                {isEditing ? "Cập nhật Danh mục" : "Tạo mới Danh mục"}
              </h3>
              <button 
                className="bg-none border-none text-stone-400 cursor-pointer p-1 rounded-lg hover:bg-stone-200/50 hover:text-stone-900 transition-colors flex items-center justify-center"
                onClick={() => setShowFormModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="p-6 flex flex-col gap-4 bg-white">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tên danh mục *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Áo thun Nam, Đầm công sở..." 
                  value={formName}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Slug (Tự động tạo) *</label>
                <input 
                  type="text" 
                  placeholder="ao-thun-nam" 
                  value={formSlug}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-855 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Icon hiển thị</label>
                  <input 
                    type="text" 
                    placeholder="Emoji: 🧥, 👟..." 
                    value={formIcon}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormIcon(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    value={formSortOrder}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormSortOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Thuộc danh mục cha</label>
                <div className="relative">
                  <select 
                    value={formParentId} 
                    className="appearance-none w-full bg-white border border-stone-200 rounded-xl p-2.5 pr-9 text-sm text-stone-700 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 cursor-pointer"
                    onChange={(e) => setFormParentId(e.target.value)}
                  >
                    <option value="">-- Là Danh mục cha chính --</option>
                    {parentCategories
                      .filter((c) => c.id !== editId)
                      .map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 my-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={formIsActive}
                    className="hidden"
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span className={`relative w-[42px] h-[22px] rounded-[34px] transition-all duration-300 inline-block before:content-[""] before:absolute before:h-4 before:w-4 before:left-[3px] before:bottom-[3px] before:bg-white before:rounded-full before:transition-all before:duration-300 ${
                    formIsActive ? "bg-emerald-600 before:translate-x-5" : "bg-stone-250"
                  }`}></span>
                  <span className="text-xs font-bold text-stone-700">Kích hoạt danh mục này</span>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 mt-4 border-t border-stone-100 pt-4">
                <button 
                  type="button" 
                  className="bg-stone-100 hover:bg-stone-200/80 text-stone-700 py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] border-none" 
                  onClick={() => setShowFormModal(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="bg-[#c85a28] hover:bg-[#b84c1a] text-white py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm shadow-orange-700/20 border-none"
                >
                  {isEditing ? "Lưu thay đổi" : "Tạo danh mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
