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

  const [errors, setErrors] = useState({});

  const validateField = (name, value, currentData) => {
    let error = null;
    switch (name) {
      case "code":
        if (!value || !value.trim()) error = "Mã khuyến mãi không được để trống";
        else if (value.length < 5 || value.length > 20) error = "Mã khuyến mãi phải từ 5-20 ký tự";
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = "Mã khuyến mãi chỉ được chứa chữ và số, không có khoảng trắng hay dấu";
        break;
      case "name":
        if (!value || !value.trim()) error = "Tên chương trình không được để trống";
        else if (value.length > 100) error = "Tên chương trình tối đa 100 ký tự";
        break;
      case "description":
        if (value && value.length > 500) error = "Mô tả tối đa 500 ký tự";
        break;
      case "discountValue":
        const dVal = parseFloat(value);
        if (value === "" || isNaN(dVal)) error = "Mức giảm không được để trống";
        else if (dVal <= 0) error = "Mức giảm phải lớn hơn 0";
        else if (currentData.discountType === "PERCENTAGE" && dVal > 100) error = "Mức giảm phần trăm tối đa là 100";
        break;
      case "maxDiscountAmount":
        if (currentData.discountType === "PERCENTAGE") {
          const maxVal = parseFloat(value);
          if (value === "" || isNaN(maxVal)) error = "Mức giảm tối đa không được để trống";
          else if (maxVal <= 0) error = "Mức giảm tối đa phải lớn hơn 0";
        }
        break;
      case "minOrderValue":
        if (value !== "") {
          const minVal = parseFloat(value);
          if (isNaN(minVal) || minVal < 0) error = "Giá trị đơn hàng tối thiểu không được âm";
        }
        break;
      case "minOrderItems":
        if (value !== "") {
          const minItems = parseInt(value, 10);
          if (isNaN(minItems) || minItems < 1) error = "Số lượng sản phẩm tối thiểu phải từ 1";
        }
        break;
      case "quantity":
        const qty = parseInt(value, 10);
        if (value === "" || isNaN(qty)) error = "Tổng số lượng mã không được để trống";
        else if (qty < 1) error = "Tổng số lượng mã phải từ 1";
        break;
      case "startDate":
        if (!value) error = "Vui lòng chọn thời gian bắt đầu";
        else {
          const start = new Date(value).getTime();
          if (start < Date.now() - 60000) error = "Thời gian bắt đầu không được nhỏ hơn thời gian hiện tại";
        }
        break;
      case "endDate":
        if (!value) error = "Vui lòng chọn thời gian kết thúc";
        else if (currentData.startDate) {
          const start = new Date(currentData.startDate).getTime();
          const end = new Date(value).getTime();
          if (end <= start) error = "Thời gian kết thúc phải sau thời gian bắt đầu";
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === "code" ? value.toUpperCase() : value;

    setFormData((prev) => {
      const nextData = { ...prev, [name]: finalValue };

      // Validate the field that just changed
      const fieldError = validateField(name, finalValue, nextData);
      setErrors((prevErrors) => {
        const nextErrors = { ...prevErrors };
        if (fieldError) {
          nextErrors[name] = fieldError;
        } else {
          delete nextErrors[name];
        }

        // Re-validate related fields
        if (name === "discountType") {
          const valError = validateField("discountValue", nextData.discountValue, nextData);
          if (valError) nextErrors.discountValue = valError;
          else delete nextErrors.discountValue;

          const maxError = validateField("maxDiscountAmount", nextData.maxDiscountAmount, nextData);
          if (maxError) nextErrors.maxDiscountAmount = maxError;
          else delete nextErrors.maxDiscountAmount;
        }

        if (name === "startDate" && nextData.endDate) {
          const endError = validateField("endDate", nextData.endDate, nextData);
          if (endError) nextErrors.endDate = endError;
          else delete nextErrors.endDate;
        }

        return nextErrors;
      });

      return nextData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields before submit
    const newErrors = {};
    for (const key of Object.keys(formData)) {
      const error = validateField(key, formData[key], formData);
      if (error) {
        newErrors[key] = error;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toastService.error("Vui lòng sửa các lỗi nhập liệu trước khi tiếp tục");
      return;
    }

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
            const items = res?.data?.content || [];
            return items.map(p => ({
              id: p.id,
              title: p.name,
              subtitle: `Mã: ${p.code} - Giảm: ${p.discountValue}`,
            }));
          }}
          fetchDetail={async (id) => {
            const res = await sellerPromotionApi.getPromotionDetail(id);
            return res?.data || null;
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
            setErrors({}); // Clear errors on clone
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
                onChange={handleChange}
                placeholder="VD: SUMMER2024"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.code
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.code && <p className="text-xs text-accent-red">{errors.code}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.name
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.name && <p className="text-xs text-accent-red">{errors.name}</p>}
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
              className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                errors.description
                  ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                  : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              }`}
            ></textarea>
            {errors.description && <p className="text-xs text-accent-red">{errors.description}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.discountValue
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.discountValue && <p className="text-xs text-accent-red">{errors.discountValue}</p>}
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
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                    errors.maxDiscountAmount
                      ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                      : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  }`}
                />
                {errors.maxDiscountAmount && <p className="text-xs text-accent-red">{errors.maxDiscountAmount}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.minOrderValue
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.minOrderValue && <p className="text-xs text-accent-red">{errors.minOrderValue}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.minOrderItems
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.minOrderItems && <p className="text-xs text-accent-red">{errors.minOrderItems}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.quantity
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.quantity && <p className="text-xs text-accent-red">{errors.quantity}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.startDate
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.startDate && <p className="text-xs text-accent-red">{errors.startDate}</p>}
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
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  errors.endDate
                    ? "border-accent-red focus:border-accent-red focus:ring-1 focus:ring-accent-red"
                    : "border-neutral-300 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                }`}
              />
              {errors.endDate && <p className="text-xs text-accent-red">{errors.endDate}</p>}
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
              {isPending ? "Đang xử lý..." : "Lưu khuyến mãi"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePromotionPage;
