import React, { useEffect, useState } from "react";
import { couponService } from "@/services/admin";
import { toastService } from "@/services/toastService";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminLoader from "@/components/common/AdminLoader";
import { 
  Plus, 
  Tag, 
  CheckCircle, 
  ShieldCheck, 
  Store, 
  Pencil, 
  Trash2, 
  Calendar, 
  Clock, 
  X,
  User,
  Settings
} from "lucide-react";

export function CouponManagement() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

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
    const nextState = !currentActive;

    // 1. Optimistic update
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: nextState } : c));
    toastService.success("Đã cập nhật trạng thái mã giảm giá!");

    // 2. Background API call
    try {
      await couponService.toggleActive(id, nextState);
    } catch (err) {
      toastService.error("Lỗi khi cập nhật trạng thái: " + err.message);
      // Revert
      setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: currentActive } : c));
    }
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
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
        toastService.success("Cập nhật mã giảm giá thành công!");
      } else {
        await couponService.create(payload);
        toastService.success("Tạo mã giảm giá mới thành công!");
      }
      setShowModal(false);
      loadCoupons();
    } catch (err) {
      toastService.error("Lỗi lưu dữ liệu: " + err.message);
    }
  };

  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const adminCoupons = coupons.filter(c => c.createdBy === "ADMIN").length;
  const sellerCoupons = coupons.filter(c => c.createdBy === "SELLER").length;

  return (
    <div className="flex flex-col min-h-full gap-6 w-full text-stone-800 pb-10 animate-[fadeIn_0.3s_ease]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-2">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight m-0">Quản lý mã giảm giá</h1>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-bold cursor-pointer transition-all bg-[#c85a28] hover:bg-[#b84c1a] text-white border-none shadow-md shadow-orange-500/10 active:scale-[0.98] w-full sm:w-auto"
          type="button"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Mới</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Tổng số Voucher</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{totalCoupons}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-orange-50 text-[#c85a28] border border-orange-100/50">
              <Tag className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Đang hoạt động</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{activeCoupons}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-emerald-50 text-emerald-700 border border-emerald-100/50">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Voucher Admin</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{adminCoupons}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-blue-50 text-blue-700 border border-blue-100/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Voucher của Shop</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{sellerCoupons}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-purple-50 text-purple-700 border border-purple-100/50">
              <Store className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-[0_8px_30px_rgba(238,229,219,0.15)] overflow-hidden">
        {loading ? (
          <AdminLoader />
        ) : error ? (
          <div className="text-center py-16 text-rose-600 font-bold">Lỗi kết nối: {error}</div>
        ) : coupons.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80">
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase pl-6 w-32">Mã code</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase">Tên voucher / Mô tả</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-28">Loại giảm</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-32">Giá trị giảm</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-36">Đơn tối thiểu</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-28 text-center">Đã dùng</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-48">Thời hạn áp dụng</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-28">Cách lưu</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-28">Người tạo</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-32 text-center">Trạng thái</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase pr-6 w-24 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-stone-50/45 transition-colors">
                    <td className="p-4 pl-6 align-middle">
                      <code className="bg-orange-50 text-[#c85a28] p-1.5 px-2.5 rounded-lg font-mono font-bold text-xs border border-orange-100">
                        {coupon.code}
                      </code>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-stone-850 text-sm">{coupon.name}</span>
                        <span className="text-[11px] text-stone-400 line-clamp-1">{coupon.description || "Không có mô tả"}</span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        coupon.discountType === "PERCENTAGE" 
                          ? "bg-blue-50 text-blue-700 border border-blue-100" 
                          : "bg-teal-50 text-teal-700 border border-teal-100"
                      }`}>
                        {coupon.discountType === "PERCENTAGE" ? "Phần trăm" : "Cố định"}
                      </span>
                    </td>
                    <td className="p-4 align-middle font-bold text-[#c85a28]">
                      {coupon.discountType === "PERCENTAGE" 
                        ? `${coupon.discountValue}%` 
                        : `${coupon.discountValue.toLocaleString("vi-VN")}đ`}
                    </td>
                    <td className="p-4 align-middle text-stone-600 text-xs font-semibold">
                      {coupon.minOrderValue ? `${coupon.minOrderValue.toLocaleString("vi-VN")}đ` : "0đ"}
                    </td>
                    <td className="p-4 align-middle text-center text-xs font-bold text-stone-700">
                      {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex flex-col gap-1 text-[10px] text-stone-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>Từ: {new Date(coupon.startDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>Đến: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        coupon.isAutoSave ? "bg-amber-50 text-amber-700 border border-amber-100" : "bg-stone-50 text-stone-600 border border-stone-200"
                      }`}>
                        {coupon.isAutoSave ? "Tự động" : "Thủ công"}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-1 text-xs font-semibold text-stone-600">
                        {coupon.createdBy === "ADMIN" ? (
                          <span className="flex items-center gap-1 bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded border border-stone-200/50 text-[10px]">
                            <User className="w-2.5 h-2.5 text-stone-500" /> Admin
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded border border-purple-100/50 text-[10px]">
                            <Store className="w-2.5 h-2.5 text-purple-500" /> {coupon.shopName || "Shop"}
                          </span>
                        )}
                      </div>
                    </td>
                    {/* Standardized Dropdown Select for Status (Admin coupons only) */}
                    <td className="p-4 align-middle text-center">
                      {coupon.createdBy === "ADMIN" ? (
                        <select
                          value={coupon.isActive ? "active" : "inactive"}
                          onChange={() => handleToggleActive(coupon.id, coupon.isActive)}
                          className={`py-1 px-3 border rounded-full text-xs font-bold cursor-pointer outline-none transition-all ${
                            coupon.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          <option value="active">Đang chạy</option>
                          <option value="inactive">Vô hiệu</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          coupon.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {coupon.isActive ? "Đang chạy" : "Vô hiệu"}
                        </span>
                      )}
                    </td>
                    {/* Standardized Action Buttons (Admin coupons only) */}
                    <td className="p-4 pr-6 align-middle text-center">
                      {coupon.createdBy === "ADMIN" ? (
                        <div className="flex gap-1.5 justify-center items-center">
                          <button
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            onClick={() => handleOpenEdit(coupon)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            onClick={() => handleDelete(coupon.id)}
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-stone-400 font-medium">Chỉ xem</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 px-5 text-stone-400 text-xs font-bold">Chưa có mã giảm giá nào được tạo trên hệ thống.</div>
        )}
      </div>

      {/* Form Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1100] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-[600px] shadow-2xl border border-stone-200/60 overflow-hidden animate-[scaleIn_0.2s_ease-out] [color-scheme:light]">
            
            {/* Modal Header */}
            <div className="bg-stone-50 p-4 px-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="m-0 text-base font-extrabold text-stone-900">
                {editingCoupon ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
              </h3>
              <button 
                className="bg-none border-none text-stone-400 cursor-pointer p-1 rounded-lg hover:bg-stone-200/50 hover:text-stone-900 transition-colors flex items-center justify-center"
                onClick={() => setShowModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 bg-white">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Mã Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: VINTAGE50K"
                    value={formData.code}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    disabled={!!editingCoupon}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tên mã voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Giảm giá hè"
                    value={formData.name}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Mô tả chi tiết</label>
                <textarea
                  placeholder="Mô tả điều kiện áp dụng mã..."
                  value={formData.description}
                  rows={2}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 resize-none"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Loại giảm giá *</label>
                  <select
                    value={formData.discountType}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-700 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 cursor-pointer"
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={formData.discountType === "PERCENTAGE" ? "Ví dụ: 10 (%)" : "Ví dụ: 50000 (đ)"}
                    value={formData.discountValue}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-855 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Giá trị đơn tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 100000"
                    value={formData.minOrderValue}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                  />
                </div>
                {formData.discountType === "PERCENTAGE" ? (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Giới hạn giảm tối đa (đ)</label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Không giới hạn"
                      value={formData.maxDiscountAmount}
                      className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                      onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lượt dùng tối đa</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Không giới hạn"
                      value={formData.usageLimit}
                      className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {formData.discountType === "PERCENTAGE" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Lượt dùng tối đa</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Không giới hạn"
                      value={formData.usageLimit}
                      className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                      onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    />
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Cách phân phối mã *</label>
                  <select
                    value={formData.isAutoSave ? "AUTO" : "MANUAL"}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-700 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 cursor-pointer"
                    onChange={(e) => setFormData({ ...formData, isAutoSave: e.target.value === "AUTO" })}
                  >
                    <option value="MANUAL">🔑 Thủ công (Tự lưu)</option>
                    <option value="AUTO">⚡ Tự động (Hệ thống tự áp dụng)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ngày bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ngày kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 mt-4 border-t border-stone-100 pt-4">
                <button 
                  type="button" 
                  className="bg-stone-100 hover:bg-stone-200/80 text-stone-700 py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] border-none" 
                  onClick={() => setShowModal(false)}
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit" 
                  className="bg-[#c85a28] hover:bg-[#b84c1a] text-white py-2.5 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] shadow-sm shadow-orange-700/20 border-none"
                >
                  {editingCoupon ? "Lưu thay đổi" : "Tạo voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          try {
            await couponService.delete(confirmDeleteId);
            toastService.success("Xóa mã giảm giá thành công!");
            loadCoupons();
          } catch (err) {
            toastService.error("Lỗi khi xóa mã giảm giá: " + err.message);
          }
        }}
        title="Xóa mã giảm giá"
        message="Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}
