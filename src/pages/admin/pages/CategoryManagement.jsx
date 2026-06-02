import React, { useState, useEffect } from "react";
import "./CategoryManagement.css";
import { categoryService } from "../../../services/admin";

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

  const fetchCategories = () => {
    setLoading(true);
    categoryService.getAll()
      .then((res) => {
        if (res && Array.isArray(res)) {
          setCategories(res);
          // Set selected parent ID to the first parent category if available
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
  
  // Parent Categories list
  const parentCategories = categories.filter((c) => c.parentId === null);
  
  // Subcategories of selected Parent Category
  const subCategories = categories.filter(
    (c) => c.parentId === selectedParentId && c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="category-management-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#3e2723" }}>Đang tải sơ đồ danh mục thực tế từ Database...</h2>
      </div>
    );
  }

  const getParentName = (parentId) => {
    const parent = categories.find((c) => c.id === parentId);
    return parent ? parent.name : "Không có";
  };

  // Auto generate slug from name
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

  // Open Form to Add
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

  // Open Form to Edit
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

  // Save Add/Edit Category
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
      sortOrder: parseInt(formSortOrder),
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

  // Toggle Category Active status
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

  // Delete Category
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
    <div className="category-management-container">
      {/* Page Header */}
      <div className="category-page-header">
        <div>
          <h1 className="category-title">Quản lý Danh mục Hệ thống</h1>
          <p className="category-subtitle">Cấu hình sơ đồ danh mục cha-con cho người dùng và người bán phân loại đồ cũ.</p>
        </div>
        <div className="header-action-group">
          <button className="add-parent-cat-btn" onClick={() => handleOpenAdd("parent")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>Thêm Danh mục Cha</span>
          </button>
          <button className="add-sub-cat-btn" onClick={() => handleOpenAdd("sub")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            <span>Thêm Danh mục Con</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="category-two-cols-layout">
        {/* Left Column: Parent Categories List */}
        <div className="parent-categories-card">
          <h3 className="section-inner-title">📁 Danh mục Cha (Chính)</h3>
          <div className="parent-cats-list">
            {parentCategories.map((parent) => (
              <div 
                key={parent.id} 
                className={`parent-cat-item-card ${selectedParentId === parent.id ? "active" : ""}`}
                onClick={() => setSelectedParentId(parent.id)}
              >
                <div className="parent-info-left">
                  <span className="parent-icon-bubble">{parent.iconUrl}</span>
                  <div className="parent-name-meta">
                    <h4 className="parent-name-text">{parent.name}</h4>
                    <span className="parent-slug-text">/{parent.slug}</span>
                  </div>
                </div>
                
                <div className="parent-actions-right" onClick={(e) => e.stopPropagation()}>
                  <span className={`status-badge-pill ${parent.isActive ? "active" : "inactive"}`} onClick={() => handleToggleStatus(parent.id)}>
                    {parent.isActive ? "Kích hoạt" : "Khóa"}
                  </span>
                  <button className="icon-btn-edit" title="Sửa" onClick={() => handleOpenEdit(parent)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
                  </button>
                  <button className="icon-btn-delete" title="Xóa" onClick={() => handleDeleteCategory(parent.id)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Subcategories Table */}
        <div className="subcategories-panel-card">
          <div className="sub-header-bar">
            <h3 className="section-inner-title">
              🌳 Danh mục Con của <span className="highlight-parent-title">"{getParentName(selectedParentId)}"</span>
            </h3>
            
            {/* Search filter for subcategories */}
            <div className="sub-search-box">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input 
                type="text" 
                placeholder="Tìm danh mục con..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="subcategories-table-wrapper">
            <table className="subcategories-table">
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>ICON</th>
                  <th>TÊN DANH MỤC CON</th>
                  <th>SLUG / ĐƯỜNG DẪN</th>
                  <th style={{ textAlign: "center" }}>THỨ TỰ</th>
                  <th style={{ textAlign: "center" }}>TRẠNG THÁI</th>
                  <th style={{ textAlign: "center", width: "120px" }}>THAO TÁC</th>
                </tr>
              </thead>
              <tbody>
                {subCategories.length > 0 ? (
                  subCategories.map((sub) => (
                    <tr key={sub.id}>
                      <td style={{ textAlign: "center" }}>
                        <span className="sub-icon-cell">{sub.iconUrl}</span>
                      </td>
                      <td className="sub-name-cell">{sub.name}</td>
                      <td className="sub-slug-cell">/{sub.slug}</td>
                      <td style={{ textAlign: "center" }} className="sub-order-cell">
                        {sub.sortOrder}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span 
                          className={`status-indicator-badge ${sub.isActive ? "active" : "inactive"}`}
                          onClick={() => handleToggleStatus(sub.id)}
                          style={{ cursor: "pointer" }}
                        >
                          {sub.isActive ? "Đang chạy" : "Tạm khóa"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="actions-cell-group">
                          <button className="icon-btn-edit table" onClick={() => handleOpenEdit(sub)}>
                            Sửa
                          </button>
                          <button className="icon-btn-delete table" onClick={() => handleDeleteCategory(sub.id)}>
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "40px 0", color: "#8b7d6a" }}>
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
        <div className="form-modal-overlay">
          <div className="form-modal-card">
            <div className="form-modal-header">
              <h3>{isEditing ? "Cập nhật Danh mục" : "Tạo mới Danh mục"}</h3>
              <button className="close-modal-btn" onClick={() => setShowFormModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSaveCategory} className="category-form-body">
              <div className="form-group-item">
                <label>Tên danh mục *</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Áo thun Nam, Đầm công sở..." 
                  value={formName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-item">
                <label>Slug (Tự động tạo) *</label>
                <input 
                  type="text" 
                  placeholder="ao-thun-nam" 
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  required
                />
              </div>

              <div className="form-group-grid-2">
                <div className="form-group-item">
                  <label>Icon hiển thị</label>
                  <input 
                    type="text" 
                    placeholder="Nhập Icon hoặc Emoji: 🧥, 👟..." 
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                  />
                </div>

                <div className="form-group-item">
                  <label>Thứ tự hiển thị</label>
                  <input 
                    type="number" 
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-item">
                <label>Thuộc danh mục cha</label>
                <select 
                  value={formParentId} 
                  onChange={(e) => setFormParentId(e.target.value)}
                >
                  <option value="">-- Là Danh mục cha chính --</option>
                  {parentCategories
                    .filter((c) => c.id !== editId) // Prevent self-referencing
                    .map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
              </div>

              <div className="form-group-item checkbox">
                <label className="toggle-switch-container">
                  <input 
                    type="checkbox" 
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                  />
                  <span className="toggle-slider-round"></span>
                  <span className="checkbox-label-text">Kích hoạt danh mục này (Được phép chọn và hiển thị)</span>
                </label>
              </div>

              <div className="form-buttons-bar">
                <button type="button" className="btn-cancel-modal" onClick={() => setShowFormModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn-submit-modal">
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
