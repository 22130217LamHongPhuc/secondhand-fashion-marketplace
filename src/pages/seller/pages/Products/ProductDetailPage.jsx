import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ImagePlus, Camera, Lightbulb } from "lucide-react";
import {
  useSellerProductDetail,
  useCreateProduct,
  useUpdateProduct,
} from "../../hooks";
import ErrorState from "../../components/common/ErrorState";

const conditionOptions = ["NEW", "LIKE_NEW", "GOOD", "FAIR"];
const conditionLabels = {
  NEW: "Mới",
  LIKE_NEW: "Như mới",
  GOOD: "Tốt",
  FAIR: "Khá",
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const {
    data: productData,
    isLoading: loading,
    error,
  } = useSellerProductDetail(isEdit ? id : null);
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: "",
    basePrice: "",
    salePrice: "",
    brand: "",
    condition: "GOOD",
    description: "",
    stockQuantity: 1,
    originCountry: "",
    isActive: true,
  });

  const originalDataRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (isEdit && productData && !originalDataRef.current) {
      const formValues = {
        name: productData.name || "",
        basePrice: productData.basePrice || "",
        salePrice: productData.salePrice || "",
        brand: productData.brand || "",
        condition: productData.condition || "GOOD",
        description: productData.description || "",
        stockQuantity: productData.stockQuantity || 1,
        originCountry: productData.originCountry || "",
        isActive: productData.isActive ?? true,
      };
      originalDataRef.current = formValues;
      setFormData(formValues);
      setPreviewUrls((productData.images || []).map((img) => img.url));
    }
  }, [isEdit, productData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newImages = files.map((file) => ({
      file,
      isPrimary: images.length === 0,
    }));
    setImages((prev) => [...prev, ...newImages]);

    const newUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const getChangedFields = () => {
    if (!originalDataRef.current) return formData;

    const changes = {};
    for (const key of Object.keys(formData)) {
      if (String(formData[key]) !== String(originalDataRef.current[key])) {
        changes[key] = formData[key];
      }
    }
    return changes;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.basePrice) {
      alert("Vui lòng điền các trường bắt buộc (Tên, Giá gốc)");
      return;
    }

    try {
      if (isEdit) {
        const changedFields = getChangedFields();
        if (Object.keys(changedFields).length === 0) {
          alert("Không có thay đổi nào.");
          return;
        }
        await updateProduct({ id, updateData: changedFields });
        alert("Cập nhật thành công!");
        navigate("/seller/products");
      } else {
        await createProduct({ productData: formData, images });
        alert("Thêm sản phẩm thành công!");
        navigate("/seller/products");
      }
    } catch (e) {
      alert("Thất bại: " + e);
    }
  };

  if (loading) {
    return <div className="p-10 text-center">Đang tải...</div>;
  }

  if (error && isEdit) {
    return <ErrorState message={error.message || error} variant="fullpage" />;
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-bold text-neutral-800">
        {isEdit ? "Sửa thông tin sản phẩm" : "Thông tin sản phẩm mới"}
      </h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Images */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <ImagePlus size={16} className="text-neutral-500" />
              Hình ảnh sản phẩm{" "}
              {isEdit && (
                <span className="text-xs font-normal text-accent-orange">
                  (Không hỗ trợ đổi ảnh khi sửa)
                </span>
              )}
            </h2>

            <div className="mt-5 flex flex-wrap gap-4">
              {!isEdit && (
                <label className="flex h-32 w-32 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 transition-colors hover:border-brand-primary/40 hover:bg-brand-bg/50">
                  <Camera size={24} className="text-neutral-300" />
                  <span className="mt-2 text-[11px] font-medium text-neutral-400">
                    Thêm ảnh
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="h-32 w-32 overflow-hidden rounded-xl border border-neutral-200"
                >
                  <img
                    src={url}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-bold text-neutral-800">
              🏷️ Chi tiết cơ bản
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <label className="text-sm font-semibold text-neutral-700">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ví dụ: Áo khoác Jean"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Giá bán gốc (đ) *
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Giá khuyến mãi (đ)
                  </label>
                  <input
                    type="number"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Số lượng kho *
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={formData.stockQuantity}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Thương hiệu
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Nhập thương hiệu"
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Tình trạng
                  </label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  >
                    {conditionOptions.map((c) => (
                      <option key={c} value={c}>
                        {conditionLabels[c]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Xuất xứ
                  </label>
                  <input
                    type="text"
                    name="originCountry"
                    value={formData.originCountry}
                    onChange={handleChange}
                    placeholder="Ví dụ: Việt Nam"
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700">
                    Trạng thái hiển thị
                  </label>
                  <div className="mt-1.5 flex h-11.5 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-4">
                    <label className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-neutral-300 text-brand-primary focus:ring-brand-primary"
                      />
                      <span className="text-sm text-neutral-700">
                        Hiển thị sản phẩm
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700">
                  Mô tả sản phẩm
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 pb-4">
            <button
              onClick={() => navigate("/seller/products")}
              className="px-8 py-3 text-sm font-bold text-neutral-600 transition-colors hover:text-neutral-800"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-brand-primary px-12 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
            >
              {isEdit ? "Lưu thay đổi" : "Đăng sản phẩm"}
            </button>
          </div>
        </div>

        {/* Right Preview */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Xem trước hiển thị
            </p>
            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100">
              <div className="relative">
                <img
                  src={
                    previewUrls[0] ||
                    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"
                  }
                  alt="Preview"
                  className="h-72 w-full object-cover"
                />
                {!formData.isActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="rounded bg-black/70 px-3 py-1 text-sm font-bold text-white">
                      Đã ẩn
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="mt-1.5 text-sm font-bold leading-snug text-neutral-800">
                  {formData.name || "Tên sản phẩm"}
                </h3>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-brand-primary">
                    {formData.salePrice || formData.basePrice || "0"}đ
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-accent-green/20 bg-accent-green-light/30 p-4">
            <div className="flex gap-3">
              <Lightbulb
                size={18}
                className="mt-0.5 shrink-0 text-accent-green"
              />
              <div>
                <p className="text-sm font-bold text-accent-green">
                  Mẹo bán hàng nhanh
                </p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                  Sản phẩm có mô tả chi tiết trên 200 chữ và ít nhất 5 hình ảnh
                  có tỉ lệ chốt đơn cao hơn 40%.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
