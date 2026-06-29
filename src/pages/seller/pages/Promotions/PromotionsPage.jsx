import { useState, useEffect } from "react";
import { 
  Tag, 
  Plus, 
  Trash2, 
} from "lucide-react";
import sellerPromotionApi from "../../api/sellerPromotionApi";
import { toastService } from "@/services/toastService";
import AdvancedFilter from "../../components/common/AdvancedFilter";
import ConfirmModal from "@/components/common/ConfirmModal";

const PromotionsPage = () => {
  // Coupons states
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
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
  });
  const [couponFilters, setCouponFilters] = useState({});

  useEffect(() => {
    loadCoupons();
  }, [couponFilters]);

  const loadCoupons = async () => {
    try {
      setLoadingCoupons(true);
      // Lấy danh sách coupons (bây giờ dùng chung API getPromotions)
      const res = await sellerPromotionApi.getPromotions(couponFilters);
      const rawData = res?.data?.data?.content || res?.data?.data || res?.data || res;
      setCoupons(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      toastService.error("Không thể tải danh sách mã giảm giá");
      console.error(err);
    } finally {
      setLoadingCoupons(false);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      setSubmittingCoupon(true);
      const payload = {
        ...couponFormData,
        discountValue: Number(couponFormData.discountValue),
        minOrderValue: couponFormData.minOrderValue ? Number(couponFormData.minOrderValue) : 0,
        maxDiscountAmount: couponFormData.maxDiscountAmount ? Number(couponFormData.maxDiscountAmount) : null,
        usageLimit: couponFormData.usageLimit ? Number(couponFormData.usageLimit) : null,
        startDate: new Date(couponFormData.startDate).toISOString(),
        endDate: new Date(couponFormData.endDate).toISOString(),
      };

      await sellerPromotionApi.createCoupon(payload);
      toastService.success("Tạo mã giảm giá thành công!");
      setShowCouponModal(false);
      loadCoupons();
    } catch (err) {
      toastService.error("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingCoupon(false);
    }
  };

  const handleDeleteCoupon = (id) => {
    setConfirmDeleteId(id);
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-800">
            Quản lý Khuyến mãi
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Kích cầu doanh số bằng các mã giảm giá riêng của shop.
          </p>
        </div>
        <button
          onClick={() => {
            setCouponFormData({
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
            });
            setShowCouponModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark"
        >
          <Plus size={16} />
          <span>Tạo Voucher Mới</span>
        </button>
      </div>

      <AdvancedFilter onApply={(filters) => setCouponFilters(filters)} />

      {/* TABS CONTENT */}
      <div>
        {loadingCoupons ? (
          <div className="py-12 text-center text-neutral-500">Đang tải danh sách voucher...</div>
        ) : coupons.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
            <Tag size={40} className="mx-auto mb-4 text-neutral-400" />
            <h3 className="text-lg font-bold text-neutral-700">Chưa có mã giảm giá nào</h3>
            <p className="mt-1 text-sm text-neutral-400">
              Hãy tạo mã giảm giá riêng của shop để thu hút người mua nhé!
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/50">
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">Code</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">Tên Voucher</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">Loại giảm</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">Giá trị giảm</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">Đã dùng</th>
                  <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">Thời hạn</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">Trạng thái</th>
                  <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-b border-neutral-50 hover:bg-neutral-50/30">
                    <td className="px-6 py-5">
                      <code className="rounded bg-brand-primary/5 px-2.5 py-1 text-sm font-bold text-brand-primary font-mono">
                        {c.code}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-neutral-800">{c.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-400">{c.description || "Không có mô tả"}</p>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-xs font-semibold rounded-full px-2.5 py-1 border ${
                        c.discountType === "PERCENTAGE" 
                          ? "bg-blue-50 text-blue-600 border-blue-200" 
                          : "bg-green-50 text-green-600 border-green-200"
                      }`}>
                        {c.discountType === "PERCENTAGE" ? "Phần trăm" : "Cố định"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-neutral-800">
                        {c.discountType === "PERCENTAGE" 
                          ? `${c.discountValue}%` 
                          : `${c.discountValue.toLocaleString("vi-VN")} đ`}
                      </span>
                      {c.minOrderValue > 0 && (
                        <p className="text-[11px] text-neutral-400">Đơn từ: {c.minOrderValue.toLocaleString("vi-VN")} đ</p>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-semibold text-neutral-700">
                        {c.usedCount || 0} / {c.usageLimit || "∞"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-neutral-500">
                      <div className="flex flex-col text-xs">
                        <span>Bắt đầu: {new Date(c.startDate).toLocaleDateString("vi-VN")}</span>
                        <span>Kết thúc: {new Date(c.endDate).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                        c.isActive 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : "bg-neutral-50 text-neutral-500 border-neutral-200"
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${c.isActive ? "bg-green-500" : "bg-neutral-400"}`} />
                        {c.isActive ? "Đang chạy" : "Vô hiệu"}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">Tạo Voucher Của Shop</h2>
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Mã code *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: COZY50"
                    value={couponFormData.code}
                    onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Tên Voucher *</label>
                  <input
                    type="text"
                    required
                    placeholder="Tên chương trình"
                    value={couponFormData.name}
                    onChange={(e) => setCouponFormData({ ...couponFormData, name: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 mb-1">Mô tả điều kiện</label>
                <textarea
                  placeholder="Ví dụ: Giảm 20k cho sản phẩm áo len mùa đông"
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Loại giảm giá</label>
                  <select
                    value={couponFormData.discountType}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  >
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Giá trị giảm *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder={couponFormData.discountType === "PERCENTAGE" ? "Ví dụ: 15" : "Ví dụ: 30000"}
                    value={couponFormData.discountValue}
                    onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Đơn tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    value={couponFormData.minOrderValue}
                    onChange={(e) => setCouponFormData({ ...couponFormData, minOrderValue: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Số lượng lượt sử dụng</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Để trống nếu không giới hạn"
                    value={couponFormData.usageLimit}
                    onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              {couponFormData.discountType === "PERCENTAGE" && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Giảm tối đa (đ)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Ví dụ: 50000"
                    value={couponFormData.maxDiscountAmount}
                    onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscountAmount: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Ngày bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={couponFormData.startDate}
                    onChange={(e) => setCouponFormData({ ...couponFormData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-500 mb-1">Ngày kết thúc *</label>
                  <input
                    type="datetime-local"
                    required
                    value={couponFormData.endDate}
                    onChange={(e) => setCouponFormData({ ...couponFormData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2 text-sm outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingCoupon}
                  className="rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-50"
                >
                  {submittingCoupon ? "Đang lưu..." : "Tạo Mới"}
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
            await sellerPromotionApi.deleteCoupon(confirmDeleteId);
            toastService.success("Đã xóa mã giảm giá!");
            loadCoupons();
          } catch (err) {
            toastService.error("Xóa thất bại: " + err.message);
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
};

export default PromotionsPage;
