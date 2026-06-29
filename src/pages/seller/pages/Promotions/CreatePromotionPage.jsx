import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { toastService } from "@/services/toastService";
import { useCreatePromotion } from "../../hooks";
import CloneDataAutocomplete from "../../components/common/CloneDataAutocomplete";
import sellerPromotionApi from "../../api/sellerPromotionApi";

const CreatePromotionPage = () => {
  const navigate = useNavigate();
  const { mutateAsync: createPromotion, isPending } = useCreatePromotion();

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discountType: "FIXED_AMOUNT",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderValue: "0",
    minOrderItems: "1",
    quantity: "",
    startDate: "",
    endDate: "",
  });

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
        ...formData,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        minOrderItems: formData.minOrderItems ? Number(formData.minOrderItems) : 1,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        quantity: Number(formData.quantity),
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      await createPromotion(payload);
      toastService.success("Tạo mã khuyến mãi thành công!");
      navigate("/seller/shop-promotions");
    } catch (error) {
      console.error(error);
      toastService.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo mã khuyến mãi");
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
            Tạo mã khuyến mãi mới
          </h1>
          <p className="text-sm text-neutral-500">
            Tạo mã giảm giá để thu hút khách hàng mua sắm
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CloneDataAutocomplete
          fetchOptions={async (keyword) => {
            const res = await sellerPromotionApi.getPromotions({ keyword });
            const items = res?.data?.data?.content || [];
            return items.map(p => ({
              id: p.id,
              title: p.name,
              subtitle: `Mã: ${p.code} - Giảm: ${p.discountValue}`,
            }));
          }}
          fetchDetail={async (id) => {
            const res = await sellerPromotionApi.getPromotionDetail(id);
            return res?.data?.data || res?.data;
          }}
          onSelectData={(data) => {
            setFormData({
              code: "", // Usually we shouldn't clone the exact code to avoid duplicate constraint
              name: data.name || "",
              description: data.description || "",
              discountType: data.discountType || "FIXED_AMOUNT",
              discountValue: data.discountValue || "",
              maxDiscountAmount: data.maxDiscountAmount || "",
              minOrderValue: data.minOrderValue || "0",
              minOrderItems: data.minOrderItems || "1",
              quantity: data.quantity || "",
              startDate: data.startDate ? data.startDate.substring(0, 16) : "",
              endDate: data.endDate ? data.endDate.substring(0, 16) : "",
            });
            toastService.success("Đã sao chép dữ liệu khuyến mãi cũ. Vui lòng nhập mã code mới!");
          }}
        />

        {/* Thông tin cơ bản */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">Thông tin cơ bản</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Mã giảm giá (Code) <span className="text-accent-red">*</span>
              </label>
              <input
                type="text"
                name="code"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="VD: SUMMER2024"
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
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
                Loại giảm giá <span className="text-accent-red">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              >
                <option value="FIXED_AMOUNT">Giảm theo số tiền (VND)</option>
                <option value="PERCENTAGE">Giảm theo phần trăm (%)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Mức giảm ({formData.discountType === 'PERCENTAGE' ? '%' : 'VND'}) <span className="text-accent-red">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                required
                min="1"
                max={formData.discountType === 'PERCENTAGE' ? "100" : undefined}
                value={formData.discountValue}
                onChange={handleChange}
                placeholder={formData.discountType === 'PERCENTAGE' ? "VD: 10" : "VD: 50000"}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            {formData.discountType === 'PERCENTAGE' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-700">
                  Mức giảm tối đa (VND) <span className="text-accent-red">*</span>
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  required
                  min="1"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  placeholder="VD: 100000"
                  className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
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
                min="0"
                value={formData.minOrderValue}
                onChange={handleChange}
                placeholder="VD: 0"
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Số lượng sản phẩm tối thiểu
              </label>
              <input
                type="number"
                name="minOrderItems"
                min="1"
                value={formData.minOrderItems}
                onChange={handleChange}
                placeholder="VD: 1"
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
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
                min="1"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="VD: 100"
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-neutral-800">Thời gian hiệu lực</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-700">
                Từ ngày <span className="text-accent-red">*</span>
              </label>
              <input
                type="datetime-local"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
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
                className="w-full rounded-xl border border-neutral-300 px-4 py-2.5 text-sm outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
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
          <div className={`rounded-xl bg-brand-primary text-sm font-semibold text-black shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98] ${isPending ? "opacity-70 cursor-not-allowed" : ""
            }`}>
            <button
              type="submit"
              disabled={isPending}
              className="px-8 py-2.5 w-full h-full flex items-center justify-center"
            >
              {isPending ? "Đang xử lý..." : "Lưu khuyến mãi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePromotionPage;
