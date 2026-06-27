import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { toastService } from "@/services/toastService";
import { useUpdatePromotion } from "../../hooks";

const EditPromotionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { mutateAsync: updatePromotion, isPending } = useUpdatePromotion();

  // Get promotion from route state if available (from ShopPromotionsPage)
  const initialPromo = location.state?.promotion;

  // Helper function to format dates for input datetime-local
  const formatForInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState(() => {
    if (initialPromo) {
      return {
        code: initialPromo.code || "",
        name: initialPromo.name || "",
        description: initialPromo.description || "",
        discountType: initialPromo.discountType || "FIXED_AMOUNT",
        discountValue: initialPromo.discountValue || "",
        maxDiscountAmount: initialPromo.maxDiscountAmount || "",
        minOrderValue: initialPromo.minOrderValue || "",
        minOrderItems: initialPromo.minOrderItems || "",
        quantity: initialPromo.quantity || "",
        startDate: formatForInput(initialPromo.startDate),
        endDate: formatForInput(initialPromo.endDate),
      };
    }
    return {
      code: "",
      name: "",
      description: "",
      discountType: "FIXED_AMOUNT",
      discountValue: "",
      maxDiscountAmount: "",
      minOrderValue: "",
      minOrderItems: "",
      quantity: "",
      startDate: "",
      endDate: "",
    };
  });

  const [hasClaims] = useState(() => initialPromo ? initialPromo.usedQuantity > 0 : false);

  useEffect(() => {
    if (!initialPromo) {
      toastService.error("Không tìm thấy thông tin mã khuyến mãi");
      navigate("/seller/shop-promotions");
    }
  }, [initialPromo, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        endDate: new Date(formData.endDate).toISOString(),
        quantity: Number(formData.quantity),
      };

      // Only include sensitive fields if no claims
      if (!hasClaims) {
        payload.discountValue = Number(formData.discountValue);
        payload.minOrderValue = formData.minOrderValue ? Number(formData.minOrderValue) : 0;
        payload.minOrderItems = formData.minOrderItems ? Number(formData.minOrderItems) : 1;
        payload.maxDiscountAmount = formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null;
      }

      await updatePromotion({ id, updateData: payload });
      toastService.success("Cập nhật mã khuyến mãi thành công!");
      navigate("/seller/shop-promotions");
    } catch (error) {
      console.error(error);
      toastService.error(error.response?.data?.message || "Có lỗi xảy ra khi cập nhật mã");
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="rounded-xl bg-white text-neutral-500 shadow-sm transition-all hover:bg-neutral-50 hover:text-brand-primary">
          <button
            onClick={() => navigate("/seller/shop-promotions")}
            className="flex h-10 w-10 items-center justify-center w-full h-full"
          >
            <ChevronLeft size={20} />
          </button>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold text-neutral-800">
            Chỉnh sửa mã khuyến mãi
          </h1>
          <p className="text-sm text-neutral-500">
            Mã: <span className="font-semibold text-brand-primary">{formData.code}</span>
          </p>
        </div>
      </div>

      {hasClaims && (
        <div className="flex items-start gap-3 rounded-xl bg-accent-yellow-light p-4 text-accent-orange">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Mã này đã có lượt sử dụng</p>
            <p>Để đảm bảo tính nhất quán, bạn chỉ có thể sửa <b>Tên, Mô tả, Ngày kết thúc (kéo dài)</b> và <b>Tổng số lượng (tăng thêm)</b>. Các thiết lập về mức giảm không thể thay đổi.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">Thông tin cơ bản</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Mã giảm giá (Code)
              </label>
              <input
                type="text"
                name="code"
                disabled
                value={formData.code}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Tên chương trình <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Sale Mùa Hè 2024"
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <label className="text-sm font-medium text-neutral-700">Mô tả chi tiết</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Nhập mô tả cho mã khuyến mãi..."
              className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
            ></textarea>
          </div>
        </div>

        {/* Cài đặt mức giảm */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">Thiết lập mức giảm</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Loại giảm giá
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                disabled
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed outline-none"
              >
                <option value="FIXED_AMOUNT">Giảm theo số tiền (VND)</option>
                <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Mức giảm ({formData.discountType === 'PERCENTAGE' ? '%' : 'VND'}) {hasClaims ? '' : <span className="text-accent-red">*</span>}
              </label>
              <input
                type="number"
                name="discountValue"
                required={!hasClaims}
                disabled={hasClaims}
                min="1"
                max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                value={formData.discountValue}
                onChange={handleChange}
                className={`w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all ${hasClaims ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  }`}
              />
            </div>

            {formData.discountType === 'PERCENTAGE' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  Mức giảm tối đa (VND) {hasClaims ? '' : <span className="text-accent-red">*</span>}
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  required={!hasClaims}
                  disabled={hasClaims}
                  min="1"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  className={`w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all ${hasClaims ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                    }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Điều kiện áp dụng */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">Điều kiện sử dụng</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Giá trị đơn hàng tối thiểu (VND)
              </label>
              <input
                type="number"
                name="minOrderValue"
                disabled={hasClaims}
                min="0"
                value={formData.minOrderValue}
                onChange={handleChange}
                className={`w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all ${hasClaims ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Số lượng sản phẩm tối thiểu
              </label>
              <input
                type="number"
                name="minOrderItems"
                disabled={hasClaims}
                min="1"
                value={formData.minOrderItems}
                onChange={handleChange}
                className={`w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all ${hasClaims ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : "focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  }`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Tổng số lượng mã <span className="text-accent-red">*</span>
              </label>
              <input
                type="number"
                name="quantity"
                required
                min={initialPromo?.quantity || 1} // Không được giảm số lượng hiện có
                value={formData.quantity}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              {hasClaims && <p className="text-[11px] text-neutral-500">Chỉ có thể tăng thêm số lượng.</p>}
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">Thời gian hiệu lực</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Từ ngày
              </label>
              <input
                type="datetime-local"
                name="startDate"
                disabled
                value={formData.startDate}
                className="w-full rounded-xl border border-neutral-300 bg-neutral-100 px-4 py-2.5 text-sm text-neutral-500 cursor-not-allowed outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Đến ngày <span className="text-accent-red">*</span>
              </label>
              <input
                type="datetime-local"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                min={formatForInputMinDate(initialPromo?.endDate)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
              {hasClaims && <p className="text-[11px] text-neutral-500">Chỉ có thể gia hạn (kéo dài) thời gian.</p>}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <div className="rounded-xl border border-neutral-300 bg-white text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50">
            <button
              type="button"
              onClick={() => navigate("/seller/shop-promotions")}
              className="px-6 py-2.5 w-full h-full flex items-center justify-center"
            >
              Hủy
            </button>
          </div>
          <div className={`rounded-xl bg-brand-primary text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98] ${isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2.5 w-full h-full flex items-center justify-center"
            >
              {isPending ? "Đang lưu..." : "Cập nhật khuyến mãi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// Helper function to format ISO date to datetime-local min attribute
function formatForInputMinDate(isoString) {
  if (!isoString) return undefined;
  const d = new Date(isoString);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default EditPromotionPage;
