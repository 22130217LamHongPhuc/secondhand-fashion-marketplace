import { useEffect, useState } from "react";
import { couponService } from "@/services/admin";
import "./CouponManagement.css";

export function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minOrderValue: "",
    maxDiscountAmount: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isAutoSave: false,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const res = await couponService.getAll();
      // Handle array unpacking
      const rawData = res?.data || res;
      setCoupons(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setFormData({
      code: "",
      name: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minOrderValue: "0",
      maxDiscountAmount: "",
      usageLimit: "",
      startDate: "",
      endDate: "",
      isAutoSave: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderValue: coupon.minOrderValue || "0",
      maxDiscountAmount: coupon.maxDiscountAmount || "",
      usageLimit: coupon.usageLimit || "",
      startDate: coupon.startDate ? coupon.startDate.substring(0, 16) : "",
      endDate: coupon.endDate ? coupon.endDate.substring(0, 16) : "",
      isAutoSave: coupon.isAutoSave || false,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await couponService.toggleActive(id, !currentActive);
      alert("Cập nhật trạng thái thành công!");
      loadCoupons();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa mã giảm giá này?")) {
      try {
        await couponService.delete(id);
        alert("Xóa mã giảm giá thành công!");
        loadCoupons();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingCoupon) {
        await couponService.update(editingCoupon.id, payload);
        alert("Cập nhật mã giảm giá thành công!");
      } else {
        await couponService.create(payload);
        alert("Tạo mã giảm giá mới thành công!");
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      alert("Lỗi lưu dữ liệu: " + err.message);
    }
  };

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const adminCoupons = coupons.filter(c => c.createdBy === "ADMIN").length;
  const sellerCoupons = coupons.filter(c => c.createdBy === "SELLER").length;

  return (
    <div className="coupon-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý mã giảm giá</h1>
          <p className="page-subtitle">Quản trị các mã khuyến mại áp dụng trên sàn hoặc từng cửa hàng</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Tạo mã mới
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TỔNG SỐ VOUCHER</div>
          <div className="stat-row">
            <div className="stat-number">{totalCoupons}</div>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">VOUCHER HOẠT ĐỘNG</div>
          <div className="stat-row">
            <div className="stat-number">{activeCoupons}</div>
            <div className="stat-icon active">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">VOUCHER TOÀN SÀN (ADMIN)</div>
          <div className="stat-row">
            <div className="stat-number">{adminCoupons}</div>
            <div className="stat-icon platform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">VOUCHER CỦA SHOP</div>
          <div className="stat-row">
            <div className="stat-number">{sellerCoupons}</div>
            <div className="stat-icon shop">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 20a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1"/><path d="M3 7l9-4 9 4"/><path d="M9 20V12h6v8"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="coupons-section">
        {loading ? (
          <div className="loading">Đang tải dữ liệu khuyến mại...</div>
        ) : error ? (
          <div className="error">Lỗi kết nối: {error}</div>
        ) : coupons.length > 0 ? (
          <table className="coupons-table">
            <thead>
              <tr>
                <th>Mã code</th>
                <th>Tên voucher</th>
                <th>Loại giảm</th>
                <th>Giá trị giảm</th>
                <th>Đơn tối thiểu</th>
                <th>Giới hạn lượt</th>
                <th>Thời hạn áp dụng</th>
                <th>Người tạo</th>
                <th>Trạng thái</th>
                <th>Cách lưu</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="code-cell"><code>{coupon.code}</code></td>
                  <td>
                    <div className="name-meta">
                      <span className="coupon-name">{coupon.name}</span>
                      <span className="coupon-desc">{coupon.description || "Không có mô tả"}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${coupon.discountType.toLowerCase()}`}>
                      {coupon.discountType === "PERCENTAGE" ? "Phần trăm" : "Cố định"}
                    </span>
                  </td>
                  <td className="value-cell">
                    {coupon.discountType === "PERCENTAGE" 
                      ? `${coupon.discountValue}%` 
                      : `${coupon.discountValue.toLocaleString("vi-VN")} đ`}
                  </td>
                  <td>{coupon.minOrderValue ? `${coupon.minOrderValue.toLocaleString("vi-VN")} đ` : "0 đ"}</td>
                  <td>
                    <div className="usage-progress">
                      <span>{coupon.usedCount || 0} / {coupon.usageLimit || "∞"}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-meta">
                      <span>Bắt đầu: {new Date(coupon.startDate).toLocaleDateString("vi-VN")}</span>
                      <span>Kết thúc: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`creator-badge ${coupon.createdBy.toLowerCase()}`}>
                      {coupon.createdBy === "ADMIN" ? "Admin" : (coupon.shopName || "Shop")}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${coupon.isActive ? "active" : "inactive"}`}>
                      {coupon.isActive ? "Đang chạy" : "Vô hiệu"}
                    </span>
                  </td>
                  <td>
                    <span className={`save-badge ${coupon.isAutoSave ? "auto" : "manual"}`}>
                      {coupon.isAutoSave ? "⚡ Tự động" : "🔑 Thủ công"}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <div className="actions-wrapper">
                      <button
                        className="btn-icon btn-toggle"
                        onClick={() => handleToggleActive(coupon.id, coupon.isActive)}
                        title={coupon.isActive ? "Tạm dừng" : "Kích hoạt"}
                      >
                        {coupon.isActive ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                        )}
                      </button>
                      <button
                        className="btn-icon btn-edit"
                        onClick={() => handleOpenEdit(coupon)}
                        title="Chỉnh sửa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDelete(coupon.id)}
                        title="Xóa"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">Chưa có mã giảm giá nào được tạo trên sàn.</div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="coupon-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Mã Code <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: VINTAGE50K"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    disabled={!!editingCoupon}
                  />
                </div>
                <div className="form-group">
                  <label>Tên mã voucher <span className="required">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Giảm giá hè"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả điều kiện áp dụng mã..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại giảm giá <span className="required">*</span></label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giá trị giảm <span className="required">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discountType === "PERCENTAGE" ? "Ví dụ: 10 (%)" : "Ví dụ: 50000 (đ)"}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Giá trị đơn tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 100000"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  />
                </div>
                {formData.discountType === "PERCENTAGE" && (
                  <div className="form-group">
                    <label>Giới hạn giảm tối đa (đ)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Không giới hạn"
                      value={formData.maxDiscountAmount}
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tổng số lượt sử dụng tối đa</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Không giới hạn"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Cách phân phối mã <span className="required">*</span></label>
                  <select
                    value={formData.isAutoSave ? "AUTO" : "MANUAL"}
                    onChange={(e) => setFormData({ ...formData, isAutoSave: e.target.value === "AUTO" })}
                  >
                    <option value="MANUAL">🔑 Thủ công (Người dùng tự lưu)</option>
                    <option value="AUTO">⚡ Tự động (Hệ thống tự lưu/áp dụng)</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCoupon ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
