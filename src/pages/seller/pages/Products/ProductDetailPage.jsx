import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ImagePlus,
  Camera,
  Lightbulb,
  Plus,
  Trash2,
  Tag,
  Star,
  Loader2,
  RefreshCw,
  Image,
} from "lucide-react";
import {
  useSellerProductDetail,
  useCreateProduct,
  useUpdateProduct,
  useSellerCategories,
} from "../../hooks";
import { imageApi } from "../../api";
import sellerProductApi from "../../api/sellerProductApi";
import { toastService } from "@/services/toastService";
import ErrorState from "../../components/common/ErrorState";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import CloneDataAutocomplete from "../../components/common/CloneDataAutocomplete";

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

  const { data: categories, isLoading: loadingCategories } =
    useSellerCategories();
  const { mutateAsync: createProduct } = useCreateProduct();
  const { mutateAsync: updateProduct } = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    basePrice: "",
    salePrice: "",
    brand: "",
    condition: "GOOD",
    description: "",
    stockQuantity: 1,
    originCountry: "",
    isActive: true,
  });

  const [attributes, setAttributes] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState({});

  const originalDataRef = useRef(null);
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  useEffect(() => {
    if (isEdit && productData && !originalDataRef.current) {
      const formValues = {
        categoryId: productData.categoryId || "",
        name: productData.name || "",
        description: productData.description || "",
        brand: productData.brand || "",
        originCountry: productData.originCountry || "",
        condition: productData.condition || "GOOD",
        basePrice: productData.basePrice || "",
        salePrice: productData.salePrice || "",
        stockQuantity: productData.stockQuantity || 1,
        isActive: productData.isActive ?? true,
      };
      originalDataRef.current = formValues;
      setFormData(formValues);
      setPreviewUrls((productData.images || []).map((img) => img.url));
      setAttributes(productData.attributes || []);
      setTags(productData.tags || []);
    }
  }, [isEdit, productData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > 20) {
      toastService.warning("Bạn chỉ được tải lên tối đa 20 hình ảnh.");
      return;
    }

    const startIdx = images.length;
    const newImages = files.map((file, idx) => {
      const localUrl = URL.createObjectURL(file);
      return {
        id: Math.random().toString(36).substring(2, 9) + Date.now(),
        file,
        previewUrl: localUrl,
        imageUrl: null,
        status: "uploading",
        isPrimary: startIdx === 0 && idx === 0,
      };
    });

    setImages((prev) => [...prev, ...newImages]);

    // Start uploading sequentially
    const uploadSequentially = async (items) => {
      for (const item of items) {
        try {
          const url = await imageApi.upload(item.file);
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id ? { ...img, status: "done", imageUrl: url } : img
            )
          );
        } catch (err) {
          toastService.error(`Tải ảnh thất bại: ${err?.message || err}`);
          setImages((prev) =>
            prev.map((img) =>
              img.id === item.id ? { ...img, status: "error" } : img
            )
          );
        }
      }
    };

    uploadSequentially(newImages);
  };

  const handleSetPrimary = (idx) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === idx,
      })),
    );
  };

  const handleRetryImage = async (idx) => {
    const targetImage = images[idx];
    if (!targetImage || targetImage.status !== "error") return;

    setImages((prev) =>
      prev.map((img, i) =>
        i === idx ? { ...img, status: "uploading" } : img
      )
    );

    try {
      const url = await imageApi.upload(targetImage.file);
      setImages((prev) =>
        prev.map((img) =>
          img.id === targetImage.id ? { ...img, status: "done", imageUrl: url } : img
        )
      );
    } catch (err) {
      toastService.error(`Tải lại ảnh thất bại: ${err?.message || err}`);
      setImages((prev) =>
        prev.map((img) =>
          img.id === targetImage.id ? { ...img, status: "error" } : img
        )
      );
    }
  };

  const handleRemoveImage = (idx) => {
    const targetImage = images[idx];
    if (targetImage && targetImage.previewUrl && targetImage.previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(targetImage.previewUrl);
    }

    const updatedImages = images.filter((_, i) => i !== idx);

    if (updatedImages.length > 0 && !updatedImages.some((img) => img.isPrimary)) {
      updatedImages[0].isPrimary = true;
    }

    setImages(updatedImages);
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const reorderedImages = [...images];
    const [removed] = reorderedImages.splice(sourceIndex, 1);
    reorderedImages.splice(targetIndex, 0, removed);
    setImages(reorderedImages);
  };

  const handleAddAttribute = () => {
    if (attributes.length >= 30) {
      toastService.warning("Bạn chỉ có thể thêm tối đa 30 thuộc tính.");
      return;
    }
    setAttributes((prev) => [...prev, { attrKey: "", attrValue: "" }]);
  };

  const handleAttributeChange = (index, field, value) => {
    setAttributes((prev) =>
      prev.map((attr, idx) =>
        idx === index ? { ...attr, [field]: value } : attr,
      ),
    );

    const errorKey = `attribute_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[errorKey];
        return next;
      });
    }
  };

  const handleRemoveAttribute = (index) => {
    setAttributes((prev) => prev.filter((_, idx) => idx !== index));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`attribute_${index}_attrKey`];
      delete next[`attribute_${index}_attrValue`];
      return next;
    });
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = tagInput.trim();
      if (!val) return;

      if (tags.includes(val)) {
        toastService.warning("Tag này đã tồn tại.");
        return;
      }

      if (tags.length >= 20) {
        toastService.warning("Bạn chỉ có thể thêm tối đa 20 nhãn/tags.");
        return;
      }

      if (val.length > 100) {
        toastService.warning("Mỗi tag chỉ được dài tối đa 100 ký tự.");
        return;
      }

      setTags((prev) => [...prev, val]);
      setTagInput("");

      if (errors.tags) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.tags;
          return next;
        });
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = "Tên sản phẩm không được để trống";
    } else if (formData.name.length > 255) {
      newErrors.name = "Tên sản phẩm tối đa 255 ký tự";
    }

    const baseVal = parseFloat(formData.basePrice);
    if (formData.basePrice === "" || isNaN(baseVal)) {
      newErrors.basePrice = "Giá gốc không được để trống";
    } else if (baseVal <= 0) {
      newErrors.basePrice = "Giá gốc phải lớn hơn 0";
    }

    if (
      formData.salePrice !== "" &&
      formData.salePrice !== null &&
      formData.salePrice !== undefined
    ) {
      const saleVal = parseFloat(formData.salePrice);
      if (isNaN(saleVal) || saleVal <= 0) {
        newErrors.salePrice = "Giá khuyến mãi phải lớn hơn 0";
      } else if (!isNaN(baseVal) && saleVal > baseVal) {
        newErrors.salePrice = "Giá khuyến mãi phải nhỏ hơn hoặc bằng giá gốc";
      }
    }

    const stockVal = parseInt(formData.stockQuantity, 10);
    if (formData.stockQuantity === "" || isNaN(stockVal)) {
      newErrors.stockQuantity = "Số lượng không được để trống";
    } else if (stockVal < 0) {
      newErrors.stockQuantity = "Số lượng không được âm";
    }

    if (formData.brand && formData.brand.length > 100) {
      newErrors.brand = "Thương hiệu tối đa 100 ký tự";
    }

    if (formData.originCountry && formData.originCountry.length > 100) {
      newErrors.originCountry = "Xuất xứ tối đa 100 ký tự";
    }

    if (formData.description && formData.description.length > 5000) {
      newErrors.description = "Mô tả sản phẩm tối đa 5000 ký tự";
    }

    attributes.forEach((attr, idx) => {
      if (!attr.attrKey.trim() && attr.attrValue.trim()) {
        newErrors[`attribute_${idx}_attrKey`] =
          "Tên thuộc tính không được để trống";
      } else if (attr.attrKey.trim() && !attr.attrValue.trim()) {
        newErrors[`attribute_${idx}_attrValue`] =
          "Giá trị thuộc tính không được để trống";
      } else if (attr.attrKey.trim() && attr.attrValue.trim()) {
        if (attr.attrKey.length > 100) {
          newErrors[`attribute_${idx}_attrKey`] = "Tối đa 100 ký tự";
        }
        if (attr.attrValue.length > 255) {
          newErrors[`attribute_${idx}_attrValue`] = "Tối đa 255 ký tự";
        }
      }
    });

    if (tags.length > 20) {
      newErrors.tags = "Tối đa 20 nhãn/tags";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isUploading = images.some((img) => img.status === "uploading");
  const hasUploadError = images.some((img) => img.status === "error");
  const isSubmitDisabled = !isEdit && (isUploading || hasUploadError);

  const handleSubmit = async () => {
    if (!validateForm()) {
      toastService.error("Vui lòng sửa các lỗi nhập liệu trước khi tiếp tục.");
      return;
    }

    try {
      if (isEdit) {
        const changedFields = getChangedFields();
        const hasAttributesChanges =
          JSON.stringify(attributes) !==
          JSON.stringify(productData.attributes || []);
        const hasTagsChanges =
          JSON.stringify(tags) !== JSON.stringify(productData.tags || []);

        if (
          Object.keys(changedFields).length === 0 &&
          !hasAttributesChanges &&
          !hasTagsChanges
        ) {
          toastService.info("Không có thay đổi nào.");
          return;
        }

        const finalPayload = { ...changedFields };
        if (hasAttributesChanges) {
          finalPayload.attributes = attributes.filter(
            (a) => a.attrKey.trim() && a.attrValue.trim(),
          );
        }
        if (hasTagsChanges) {
          finalPayload.tags = tags.filter((t) => t.trim());
        }

        await updateProduct({ id, updateData: finalPayload });
        toastService.success("Cập nhật thành công!");
        navigate("/seller/products");
      } else {
        const imagesPayload = images
          .filter((img) => img.status === "done" && img.imageUrl)
          .map((img, idx) => ({
            imageUrl: img.imageUrl,
            sortOrder: idx,
            isPrimary: img.isPrimary || false,
          }));

        if (imagesPayload.length === 0) {
          toastService.error("Vui lòng thêm và chờ tải lên ít nhất một hình ảnh cho sản phẩm.");
          return;
        }

        if (!imagesPayload.some((img) => img.isPrimary)) {
          imagesPayload[0].isPrimary = true;
        }

        const { ...createFormData } = formData;
        await createProduct({
          productData: createFormData,
          images: imagesPayload,
          attributes: attributes.filter(
            (a) => a.attrKey.trim() && a.attrValue.trim(),
          ),
          tags: tags.filter((t) => t.trim()),
        });
        toastService.success("Thêm sản phẩm thành công!");
        navigate("/seller/products");
      }
    } catch (e) {
      toastService.error("Thất bại: " + (e?.message || e));
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

      {!isEdit && (
        <CloneDataAutocomplete
          fetchOptions={async (keyword) => {
            const res = await sellerProductApi.getAll({ keyword });
            const items = res?.data?.data?.content || [];
            return items.map(p => ({
              id: p.id,
              title: p.name,
              subtitle: `Giá: ${p.basePrice.toLocaleString("vi-VN")} đ`,
              image: p.images?.[0]?.url || null,
            }));
          }}
          fetchDetail={async (id) => {
            const res = await sellerProductApi.getById(id);
            return res?.data?.data || res?.data;
          }}
          onSelectData={(data) => {
            setFormData({
              name: data.name || "",
              categoryId: data.categoryId || "",
              basePrice: data.basePrice || "",
              salePrice: data.salePrice || "",
              brand: data.brand || "",
              condition: data.condition || "GOOD",
              description: data.description || "",
              stockQuantity: data.stockQuantity || 1,
              originCountry: data.originCountry || "",
              isActive: true,
            });
            setAttributes(data.attributes || []);
            setTags(data.tags || []);
            // Clone data doesn't clone images for now, or we can just leave images empty since they need re-upload
            toastService.success("Đã điền dữ liệu từ sản phẩm cũ!");
          }}
        />
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          {/* Images */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <ImagePlus size={16} className="text-neutral-500" />
              Hình ảnh sản phẩm{" "}
              {isEdit ? (
                <span className="text-xs font-normal text-accent-orange">
                  (Không hỗ trợ đổi ảnh khi sửa)
                </span>
              ) : (
                <span className="text-xs font-normal text-neutral-500">
                  (Kéo thả để sắp xếp, click để chọn ảnh chính)
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

              {isEdit
                ? previewUrls.map((url, idx) => {
                  return (
                    <div
                      key={idx}
                      className="group relative h-32 w-32 overflow-hidden rounded-xl border border-neutral-200"
                    >
                      <img
                        src={url}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  );
                })
                : images.map((img, idx) => {
                  const isPrimary = img.isPrimary || false;
                  const isUploading = img.status === "uploading";
                  const isError = img.status === "error";

                  return (
                    <div
                      key={img.id || idx}
                      draggable={!isUploading}
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx)}
                      className={`group relative h-32 w-32 overflow-hidden rounded-xl border transition-all ${isUploading ? "cursor-not-allowed opacity-60" : "cursor-grab active:cursor-grabbing"
                        } ${isPrimary
                          ? "border-brand-primary ring-2 ring-brand-primary/20"
                          : isError
                            ? "border-red-500 ring-2 ring-red-200"
                            : "border-neutral-200 hover:border-brand-primary/40"
                        }`}
                    >
                      <img
                        src={img.previewUrl}
                        alt={`Preview ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />

                      {isPrimary && (
                        <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-brand-primary px-1.5 py-0.5 text-[9px] font-bold text-white shadow-sm">
                          <Star size={8} fill="white" />
                          Chính
                        </span>
                      )}

                      {isUploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                          <Loader2 className="h-6 w-6 animate-spin text-white" />
                          <span className="mt-1 text-[10px] font-semibold text-white">Đang tải...</span>
                        </div>
                      )}

                      {isError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRetryImage(idx)}
                            className="rounded bg-white/95 p-1.5 text-neutral-800 shadow transition hover:bg-white flex items-center gap-1 text-[10px] font-bold"
                            title="Tải lại"
                          >
                            <RefreshCw size={12} className="text-brand-primary" />
                            Thử lại
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="rounded bg-red-500/90 p-1.5 text-white shadow transition hover:bg-red-500"
                            title="Xóa ảnh"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}

                      {!isUploading && !isError && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                          {!isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(idx)}
                              className="rounded bg-white/90 px-2 py-1 text-[10px] font-bold text-neutral-800 shadow transition hover:bg-white"
                            >
                              Làm ảnh chính
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="rounded bg-red-500/90 p-1.5 text-white shadow transition hover:bg-red-500"
                            title="Xóa ảnh"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
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
                  className={`mt-1.5 w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.name
                    ? "border-red-500 focus:ring-red-200"
                    : "border-neutral-200"
                    }`}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-neutral-700">
                  Danh mục sản phẩm
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                >
                  <option value="">Chọn danh mục sản phẩm (tùy chọn)</option>
                  {loadingCategories ? (
                    <option disabled>Đang tải danh mục...</option>
                  ) : (
                    categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
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
                    className={`mt-1.5 w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.basePrice
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200"
                      }`}
                  />
                  {errors.basePrice && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.basePrice}
                    </p>
                  )}
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
                    className={`mt-1.5 w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.salePrice
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200"
                      }`}
                  />
                  {errors.salePrice && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.salePrice}
                    </p>
                  )}
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
                    className={`mt-1.5 w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.stockQuantity
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200"
                      }`}
                  />
                  {errors.stockQuantity && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.stockQuantity}
                    </p>
                  )}
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
                    className={`mt-1.5 w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.brand
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200"
                      }`}
                  />
                  {errors.brand && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.brand}
                    </p>
                  )}
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
                    className={`mt-1.5 w-full rounded-xl border bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.originCountry
                      ? "border-red-500 focus:ring-red-200"
                      : "border-neutral-200"
                      }`}
                  />
                  {errors.originCountry && (
                    <p className="mt-1 text-xs text-red-500 font-medium">
                      {errors.originCountry}
                    </p>
                  )}
                </div>
                {isEdit && (
                  <div>
                    <label className="text-sm font-semibold text-neutral-700">
                      Trạng thái hiển thị
                    </label>
                    {/* Đổi h-11.5 thành h-12 cho chuẩn spacing của Tailwind mặc định */}
                    <div className="mt-1.5 flex h-12 items-center">
                      <ToggleSwitch
                        // Sử dụng !! hoặc ?? false để đảm bảo giá trị truyền vào luôn là boolean (true/false)
                        checked={formData?.isActive ?? false}
                        onChange={(val) =>
                          setFormData((prev) => ({ ...prev, isActive: val }))
                        }
                        label="Hiển thị sản phẩm"
                      />
                    </div>
                  </div>
                )}
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
                  className={`mt-1.5 w-full resize-none rounded-xl border bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors.description
                    ? "border-red-500 focus:ring-red-200"
                    : "border-neutral-200"
                    }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
                📋 Thuộc tính sản phẩm
                <span className="text-xs font-normal text-neutral-500">
                  (Tối đa 30 thuộc tính, VD: Size, Màu sắc, Chất liệu)
                </span>
              </h2>
              <button
                type="button"
                onClick={handleAddAttribute}
                className="flex items-center gap-1 text-xs font-semibold text-brand-primary transition-colors hover:text-brand-dark"
              >
                <Plus size={14} /> Thêm thuộc tính
              </button>
            </div>

            {attributes.length === 0 ? (
              <p className="mt-4 text-xs text-neutral-400 italic">
                Chưa có thuộc tính nào. Nhấp vào "Thêm thuộc tính" để bổ sung
                chi tiết cho sản phẩm.
              </p>
            ) : (
              <div className="mt-4 space-y-3.5">
                {attributes.map((attr, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Tên thuộc tính (VD: kích thước)"
                        value={attr.attrKey}
                        onChange={(e) =>
                          handleAttributeChange(idx, "attrKey", e.target.value)
                        }
                        className={`w-full rounded-xl border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors[`attribute_${idx}_attrKey`]
                          ? "border-red-500 focus:ring-red-200"
                          : "border-neutral-200"
                          }`}
                      />
                      {errors[`attribute_${idx}_attrKey`] && (
                        <p className="mt-0.5 text-[11px] text-red-500 font-medium">
                          {errors[`attribute_${idx}_attrKey`]}
                        </p>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Giá trị (VD: XL)"
                        value={attr.attrValue}
                        onChange={(e) =>
                          handleAttributeChange(
                            idx,
                            "attrValue",
                            e.target.value,
                          )
                        }
                        className={`w-full rounded-xl border bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10 ${errors[`attribute_${idx}_attrValue`]
                          ? "border-red-500 focus:ring-red-200"
                          : "border-neutral-200"
                          }`}
                      />
                      {errors[`attribute_${idx}_attrValue`] && (
                        <p className="mt-0.5 text-[11px] text-red-500 font-medium">
                          {errors[`attribute_${idx}_attrValue`]}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(idx)}
                      className="mt-2 text-neutral-400 hover:text-red-500 transition-colors p-1"
                      title="Xóa thuộc tính"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-bold text-neutral-800 flex items-center gap-2">
              <Tag size={16} className="text-neutral-500" />
              Nhãn sản phẩm (Tags)
              <span className="text-xs font-normal text-neutral-500">
                (Tối đa 20 nhãn, nhấn Enter để thêm)
              </span>
            </h2>

            <div className="mt-4">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Nhập nhãn sản phẩm rồi nhấn Enter (VD: vintage, denim, summer)"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>

            {tags.length > 0 && (
              <div className="mt-3.5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-200"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="rounded-full p-0.5 hover:bg-neutral-300 transition-colors text-neutral-400 hover:text-neutral-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 pb-4">
            <div className="px-8 py-3 border border-neutral-300 rounded-lg bg-white shadow-sm text-sm font-bold text-neutral-600 transition-colors hover:text-neutral-800 hover:bg-neutral-50">
              <button
                type="button"
                onClick={() => navigate("/seller/products")}>
                Hủy
              </button>
            </div>
            <div
              className={`rounded-xl px-12 py-3 text-sm font-semibold text-white shadow-md transition-all ${isSubmitDisabled
                ? "bg-neutral-300 cursor-not-allowed opacity-60"
                : "bg-brand-primary hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
                }`}
            >
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled}

              >
                {isEdit ? "Lưu thay đổi" : "Đăng sản phẩm"}
              </button>
            </div>

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
                {(isEdit ? previewUrls[0] : images[0]?.previewUrl) ? (
                  <img
                    src={isEdit ? previewUrls[0] : images[0]?.previewUrl}
                    alt="Preview"
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-72 w-full flex-col items-center justify-center bg-neutral-50 border border-neutral-100 text-neutral-400">
                    <Image size={40} strokeWidth={1.5} />
                    <span className="mt-2 text-xs">Chưa có hình ảnh sản phẩm</span>
                  </div>
                )}
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
