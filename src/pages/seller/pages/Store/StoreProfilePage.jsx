import { useState, useEffect, useRef } from "react";
import { Pencil, Eye, Lightbulb, Camera, Loader2, Globe } from "lucide-react";
import { useSellerShop, useCreateShop, useUpdateShop } from "../../hooks";
import { imageApi } from "../../api";
import { toastService } from "@/services/toastService";
import { shippingService } from "@/services/shippingService";

// Helper function to slugify name in frontend preview
const slugify = (text) => {
  if (!text) return "";
  let slug = text.toString().toLowerCase();

  // Replace Vietnamese accented characters
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậäå]/g, "a");
  slug = slug.replace(/[éèẻẽẹêếềểễệë]/g, "e");
  slug = slug.replace(/[íìỉĩịï]/g, "i");
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợöø]/g, "o");
  slug = slug.replace(/[úùủũụưứừửữựü]/g, "u");
  slug = slug.replace(/[ýỳỷỹỵÿ]/g, "y");
  slug = slug.replace(/[đ]/g, "d");

  return slug
    .replace(/[^a-z0-9 -]/g, "") // Remove non-alphanumeric except space/hyphen
    .replace(/\s+/g, "-") // Collapse spaces to single hyphen
    .replace(/-+/g, "-") // Collapse consecutive hyphens
    .trim()
    .replace(/^-+/, "") // Trim leading hyphens
    .replace(/-+$/, ""); // Trim trailing hyphens
};

const StoreProfilePage = () => {
  const { data: shop, isLoading, error } = useSellerShop();
  const createShopMutation = useCreateShop();
  const updateShopMutation = useUpdateShop();

  const isRegistration = !shop;

  // Form fields state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [slugPreview, setSlugPreview] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardCode, setWardCode] = useState("");
  const [wardName, setWardName] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);

  // Upload/Preview states
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerUploading, setBannerUploading] = useState(false);

  // Hidden inputs references
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  // Sync data from database when loaded
  useEffect(() => {
    if (shop) {
      setName(shop.name || "");
      setDescription(shop.description || "");
      setAvatarUrl(shop.avatarUrl || "");
      setBannerUrl(shop.bannerUrl || "");
      setSlugPreview(shop.slug || "");
      setAvatarPreview(shop.avatarUrl || "");
      setBannerPreview(shop.bannerUrl || "");
      setProvinceId(shop.provinceId ? String(shop.provinceId) : "");
      setProvinceName(shop.provinceName || "");
      setDistrictId(shop.districtId ? String(shop.districtId) : "");
      setDistrictName(shop.districtName || "");
      setWardCode(shop.wardCode || "");
      setWardName(shop.wardName || "");
      setAddressDetail(shop.addressDetail || "");
    }
  }, [shop]);

  useEffect(() => {
    let cancelled = false;
    const loadProvinces = async () => {
      setAddressLoading(true);
      try {
        const data = await shippingService.getProvinces();
        if (!cancelled) {
          setProvinces(data || []);
        }
      } catch (err) {
        toastService.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch tá»‰nh/thÃ nh tá»« GHN.");
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    };

    loadProvinces();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!provinceId) {
      setDistricts([]);
      return;
    }

    const loadDistricts = async () => {
      setAddressLoading(true);
      try {
        const data = await shippingService.getDistricts(provinceId);
        if (!cancelled) {
          setDistricts(data || []);
        }
      } catch (err) {
        toastService.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch quáº­n/huyá»‡n tá»« GHN.");
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    };

    loadDistricts();

    return () => {
      cancelled = true;
    };
  }, [provinceId]);

  useEffect(() => {
    let cancelled = false;

    if (!districtId) {
      setWards([]);
      return;
    }

    const loadWards = async () => {
      setAddressLoading(true);
      try {
        const data = await shippingService.getWards(districtId);
        if (!cancelled) {
          setWards(data || []);
        }
      } catch (err) {
        toastService.error("KhÃ´ng thá»ƒ táº£i danh sÃ¡ch phÆ°á»ng/xÃ£ tá»« GHN.");
      } finally {
        if (!cancelled) {
          setAddressLoading(false);
        }
      }
    };

    loadWards();

    return () => {
      cancelled = true;
    };
  }, [districtId]);

  // Update slug preview in real-time
  useEffect(() => {
    if (isRegistration) {
      setSlugPreview(slugify(name));
    } else if (shop) {
      // If we are editing and name has changed, show new slug preview, otherwise keep shop slug
      if (name.trim() !== shop.name) {
        setSlugPreview(slugify(name));
      } else {
        setSlugPreview(shop.slug);
      }
    }
  }, [name, isRegistration, shop]);

  const handleProvinceChange = (e) => {
    const selectedId = e.target.value;
    const province = provinces.find(item => String(item.ProvinceID) === String(selectedId));
    setProvinceId(selectedId);
    setProvinceName(province?.ProvinceName || "");
    setDistrictId("");
    setDistrictName("");
    setWardCode("");
    setWardName("");
    setWards([]);
  };

  const handleDistrictChange = (e) => {
    const selectedId = e.target.value;
    const district = districts.find(item => String(item.DistrictID) === String(selectedId));
    setDistrictId(selectedId);
    setDistrictName(district?.DistrictName || "");
    setWardCode("");
    setWardName("");
  };

  const handleWardChange = (e) => {
    const selectedCode = e.target.value;
    const ward = wards.find(item => String(item.WardCode) === String(selectedCode));
    setWardCode(selectedCode);
    setWardName(ward?.WardName || "");
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toastService.warning("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG).");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setAvatarUploading(true);

    try {
      const url = await imageApi.upload(file);
      setAvatarUrl(url);
      toastService.success("Tải ảnh đại diện thành công!");
    } catch (err) {
      toastService.error(`Tải ảnh đại diện thất bại: ${err?.message || err}`);
      setAvatarPreview(avatarUrl || ""); // Revert preview
    } finally {
      setAvatarUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toastService.warning("Vui lòng chọn file hình ảnh hợp lệ (PNG, JPG, JPEG).");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setBannerPreview(localUrl);
    setBannerUploading(true);

    try {
      const url = await imageApi.upload(file);
      setBannerUrl(url);
      toastService.success("Tải ảnh bìa thành công!");
    } catch (err) {
      toastService.error(`Tải ảnh bìa thất bại: ${err?.message || err}`);
      setBannerPreview(bannerUrl || ""); // Revert preview
    } finally {
      setBannerUploading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toastService.warning("Tên cửa hàng không được để trống.");
      return;
    }
    if (!description.trim()) {
      toastService.warning("Mô tả cửa hàng không được để trống.");
      return;
    }
    if (!avatarUrl) {
      toastService.warning("Vui lòng tải lên ảnh đại diện.");
      return;
    }
    if (!bannerUrl) {
      toastService.warning("Vui lòng tải lên ảnh bìa.");
      return;
    }

    if (!provinceId || !districtId || !wardCode || !addressDetail.trim()) {
      toastService.warning("Vui lÃ²ng chá»n Ä‘áº§y Ä‘á»§ Ä‘á»‹a chá»‰ láº¥y hÃ ng cá»§a cá»­a hÃ ng.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      avatarUrl,
      bannerUrl,
      provinceId: Number(provinceId),
      provinceName,
      districtId: Number(districtId),
      districtName,
      wardCode,
      wardName,
      addressDetail: addressDetail.trim(),
    };

    try {
      if (isRegistration) {
        await createShopMutation.mutateAsync(payload);
        toastService.success("Đăng ký cửa hàng thành công!");
      } else {
        // Only submit if there are actual changes
        if (
          name.trim() === shop.name &&
          description.trim() === shop.description &&
          avatarUrl === shop.avatarUrl &&
          bannerUrl === shop.bannerUrl &&
          Number(provinceId) === shop.provinceId &&
          provinceName === (shop.provinceName || "") &&
          Number(districtId) === shop.districtId &&
          districtName === (shop.districtName || "") &&
          wardCode === (shop.wardCode || "") &&
          wardName === (shop.wardName || "") &&
          addressDetail.trim() === (shop.addressDetail || "")
        ) {
          toastService.info("Không có thay đổi nào cần cập nhật.");
          return;
        }
        await updateShopMutation.mutateAsync(payload);
        toastService.success("Cập nhật thông tin cửa hàng thành công!");
      }
    } catch (err) {
      toastService.error(`Thao tác thất bại: ${err?.message || "Đã xảy ra lỗi"}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-brand-primary" />
        <p className="text-sm font-medium text-neutral-500">Đang tải thông tin cửa hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-3">
        <p className="text-red-500 font-medium">Lỗi tải thông tin: {error.message || "Đã có lỗi xảy ra"}</p>
      </div>
    );
  }

  const isSubmitting = createShopMutation.isPending || updateShopMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-neutral-800">
          {isRegistration ? "Đăng ký cửa hàng" : "Hồ sơ cửa hàng"}
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          {isRegistration
            ? "Thiết lập thông tin thương hiệu của bạn để bắt đầu bán hàng trực tuyến."
            : "Cập nhật thông tin nhận diện thương hiệu của bạn để khách hàng dễ dàng tìm thấy."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ══════════════ Left: Form (2 cols) ══════════════ */}
        <form onSubmit={handleSubmit} className="col-span-2 space-y-6">
          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={avatarInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleAvatarChange}
          />
          <input
            type="file"
            ref={bannerInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleBannerChange}
          />

          {/* ── Avatar Section ── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Hình ảnh đại diện
            </p>
            <div className="mt-3 flex items-center gap-5 rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-21.25 w-21.25 overflow-hidden rounded-full border border-neutral-100 bg-brand-light">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400 bg-neutral-50">
                      Chưa có ảnh
                    </div>
                  )}
                </div>
                {avatarUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
              </div>
              {/* Info text + status */}
              <div className="flex flex-col items-start">
                <p className="text-sm text-neutral-600">
                  {avatarUploading ? (
                    <span className="text-blue-500 font-medium flex items-center gap-1.5 animate-pulse">
                      Đang tải ảnh đại diện lên...
                    </span>
                  ) : (
                    <>
                      Khuyên dùng ảnh hình vuông, tối thiểu 500x500px.
                      <br />
                      Định dạng JPG, PNG, JPEG.
                    </>
                  )}
                </p>
                {avatarUploading && (
                  <div className="mt-3 h-1.5 w-44 overflow-hidden rounded-full bg-neutral-100">
                    <div className="h-full w-2/3 rounded-full bg-blue-500 animate-pulse" />
                  </div>
                )}
                
                {!avatarUploading && (
                  <div className="mt-4 flex w-fit items-center gap-2 rounded-xl bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg cursor-pointer">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="flex items-center gap-2 bg-transparent border-none outline-none text-white cursor-pointer p-0 m-0 w-full h-full"
                    >
                      <Camera size={16} />
                      {avatarPreview ? "Thay đổi ảnh đại diện" : "Chọn ảnh đại diện"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Cover Image Section ── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Ảnh bìa cửa hàng
            </p>
            <div className="mt-3 group relative h-52 overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100">
              {bannerPreview ? (
                <img
                  src={bannerPreview}
                  alt="Cover"
                  className="h-full w-full object-cover brightness-75"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-neutral-400 font-medium">
                  Chưa có ảnh bìa (Kích thước khuyên dùng 1200x400)
                </div>
              )}
              {bannerUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
              {/* Overlay button always visible */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-dark hover:shadow-xl cursor-pointer ${bannerUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button
                    type="button"
                    disabled={bannerUploading}
                    onClick={() => bannerInputRef.current?.click()}
                    className="flex items-center gap-2 bg-transparent border-none outline-none text-white cursor-pointer p-0 m-0 w-full h-full"
                  >
                    <Camera size={16} />
                    {bannerPreview ? "Thay đổi ảnh bìa" : "Chọn ảnh bìa"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Store Name ── */}
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Tên cửa hàng *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên cửa hàng của bạn"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-hidden transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          {/* ── Slug Preview ── */}
          <div>
            <label className="text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
              <Globe size={15} className="text-neutral-400" />
              Đường dẫn cửa hàng (Slug)
            </label>
            <div className="relative mt-1.5 flex items-center">
              <span className="absolute left-4 text-sm text-neutral-400 select-none">
                /shop/
              </span>
              <input
                type="text"
                value={slugPreview}
                readOnly
                className="w-full rounded-xl border border-neutral-200 bg-neutral-100 pl-16 pr-4 py-3 text-sm text-neutral-500 outline-hidden cursor-not-allowed"
                placeholder="slug-cua-ban"
              />
            </div>
            <p className="mt-1 text-[11px] text-neutral-400">
              Đường dẫn này được sinh tự động và duy nhất dựa trên tên cửa hàng của bạn.
            </p>
          </div>

          {/* ── Description ── */}
          <div>
            <label className="text-sm font-semibold text-neutral-700">
              Mô tả ngắn *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Chào mừng bạn đến với cửa hàng của tôi. Chúng tôi chuyên cung cấp..."
              className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 outline-hidden transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-neutral-700">
                Địa chỉ lấy hàng *
              </label>
              {addressLoading && (
                <span className="flex items-center gap-1 text-xs font-medium text-neutral-400">
                  <Loader2 size={12} className="animate-spin" />
                  Đang tải GHN...
                </span>
              )}
            </div>

            <div className="mt-1.5 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-500">
                  Tỉnh/TP
                </label>
                <select
                  required
                  value={provinceId}
                  onChange={handleProvinceChange}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-hidden transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                >
                  <option value="">-- Chọn Tỉnh --</option>
                  {provinces.map((province) => (
                    <option key={province.ProvinceID} value={province.ProvinceID}>
                      {province.ProvinceName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-500">
                  Quận/Huyện
                </label>
                <select
                  required
                  value={districtId}
                  onChange={handleDistrictChange}
                  disabled={!provinceId}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-hidden transition-all disabled:cursor-not-allowed disabled:text-neutral-400 focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                >
                  <option value="">-- Chọn Huyện --</option>
                  {districts.map((district) => (
                    <option key={district.DistrictID} value={district.DistrictID}>
                      {district.DistrictName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-neutral-500">
                  Phường/Xã
                </label>
                <select
                  required
                  value={wardCode}
                  onChange={handleWardChange}
                  disabled={!districtId}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-hidden transition-all disabled:cursor-not-allowed disabled:text-neutral-400 focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                >
                  <option value="">-- Chọn Xã --</option>
                  {wards.map((ward) => (
                    <option key={ward.WardCode} value={ward.WardCode}>
                      {ward.WardName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="text"
              required
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="Số nhà, tên đường, tòa nhà..."
              className="mt-3 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-hidden transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          {/* ── Save Button ── */}
          <div className="flex justify-center pt-2 pb-4  ">
            <div
              className="rounded-xl bg-brand-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"><button
                type="submit"
                disabled={isSubmitting || avatarUploading || bannerUploading || addressLoading}
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isRegistration ? "Đăng ký cửa hàng" : "Lưu thay đổi"}
              </button></div>
          </div>
        </form>

        {/* ══════════════ Right: Preview (1 col) ══════════════ */}
        <div className="space-y-4">
          {/* ── Store Preview Card ── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-accent-green" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-accent-green">
                Xem trước cửa hàng
              </p>
              <div className="ml-auto flex gap-1">
                <span className="h-2 w-2 rounded-full bg-brand-primary" />
                <span className="h-2 w-2 rounded-full bg-neutral-200" />
                <span className="h-2 w-2 rounded-full bg-neutral-200" />
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100">
              {/* Cover */}
              <div className="relative h-32 bg-neutral-800">
                {bannerPreview ? (
                  <img
                    src={bannerPreview}
                    alt="Cover"
                    className="h-full w-full object-cover opacity-60"
                  />
                ) : (
                  <div className="h-full w-full bg-neutral-800 opacity-60" />
                )}
                {/* Avatar overlay */}
                <div className="absolute -bottom-7 left-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border-[3px] border-white bg-brand-light shadow-md">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-neutral-100 text-[10px] font-bold text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="px-4 pt-9 pb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-neutral-800 truncate max-w-[70%]">
                    {name.trim() || "Tên cửa hàng"}
                  </h3>
                </div>
                <p className="mt-1 flex items-center gap-1 text-[11px] text-neutral-400">
                  <Globe size={11} />
                  <span className="truncate">
                    {slugPreview ? `/shop/${slugPreview}` : "shop-slug"}
                  </span>
                </p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 rounded-xl border border-neutral-100 py-2.5 bg-neutral-50/50">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Sản phẩm
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-800">
                      {shop?.totalProducts ?? 0}
                    </p>
                  </div>
                  <div className="border-x border-neutral-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Đánh giá
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-800">
                      {shop?.ratingAvg != null ? `${Number(shop.ratingAvg).toFixed(1)}/5` : "–"}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Lượt đánh giá
                    </p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-800">
                      {shop?.totalReviews ?? 0}
                    </p>
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-4 text-xs leading-relaxed text-neutral-500 line-clamp-3">
                  {description.trim() || "Mô tả ngắn về cửa hàng của bạn..."}
                </p>

                {/* Gallery */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-24 overflow-hidden rounded-xl bg-neutral-50 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-medium">Chưa có avatar</span>
                    )}
                  </div>
                  <div className="h-24 overflow-hidden rounded-xl bg-neutral-50 flex items-center justify-center">
                    {bannerPreview ? (
                      <img
                        src={bannerPreview}
                        alt="Banner Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-neutral-400 font-medium">Chưa có ảnh bìa</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tip Card ── */}
          <div className="rounded-2xl bg-accent-green-light/50 p-5 border border-accent-green/10">
            <div className="flex gap-3">
              <Lightbulb
                size={18}
                className="mt-0.5 shrink-0 text-accent-orange"
              />
              <div>
                <p className="text-sm font-bold text-accent-orange">Mẹo nhỏ:</p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600 font-medium">
                  Sử dụng ảnh bìa có tông màu trung tính sẽ làm nổi bật logo và thông tin cửa hàng của bạn hơn trên thiết bị di động.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfilePage;
