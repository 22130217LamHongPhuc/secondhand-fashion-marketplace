import React, { useEffect, useState } from "react";
import { bannerService } from "@/services/admin";
import { toastService } from "@/services/toastService";
import imageApi from "@/pages/seller/api/imageApi";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminLoader from "@/components/common/AdminLoader";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Link as LinkIcon, 
  Eye, 
  EyeOff, 
  ArrowUpDown,
  Upload,
  Calendar,
  Sparkles
} from "lucide-react";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    orderNum: 0,
    isActive: true,
  });

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.getAll();
      const rawData = res?.data || res;
      setBanners(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      imageUrl: "",
      linkUrl: "",
      orderNum: banners.length,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl || "",
      linkUrl: banner.linkUrl || "",
      orderNum: banner.orderNum ?? 0,
      isActive: banner.isActive ?? true,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toastService.error("Vui lòng tải lên file ảnh hợp lệ.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toastService.error("Kích thước ảnh tối đa là 5MB.");
      return;
    }

    try {
      setUploading(true);
      const url = await imageApi.upload(file);
      setFormData(prev => ({ ...prev, imageUrl: url }));
      toastService.success("Tải ảnh lên thành công!");
    } catch (err) {
      console.error(err);
      toastService.error("Có lỗi xảy ra khi tải ảnh lên.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imageUrl) {
      toastService.error("Vui lòng chọn hoặc tải lên ảnh banner.");
      return;
    }

    try {
      if (editingBanner) {
        await bannerService.update(editingBanner.id, formData);
        toastService.success("Cập nhật banner trang chủ thành công!");
      } else {
        await bannerService.create(formData);
        toastService.success("Thêm banner trang chủ mới thành công!");
      }
      setShowModal(false);
      loadBanners();
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Có lỗi xảy ra khi lưu banner.");
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await bannerService.delete(confirmDeleteId);
      toastService.success("Xóa banner trang chủ thành công!");
      setConfirmDeleteId(null);
      loadBanners();
    } catch (err) {
      console.error(err);
      toastService.error("Không thể xóa banner này.");
    }
  };

  const handleToggleActive = async (banner) => {
    const newStatus = !banner.isActive;
    try {
      // Optimistic update
      setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: newStatus } : b));
      await bannerService.toggleActive(banner.id, newStatus);
      toastService.success(newStatus ? "Đã kích hoạt banner!" : "Đã tạm ẩn banner!");
    } catch (err) {
      console.error(err);
      toastService.error("Có lỗi xảy ra khi thay đổi trạng thái banner.");
      // Rollback
      loadBanners();
    }
  };

  if (loading && banners.length === 0) {
    return <AdminLoader />;
  }

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-orange-500">Hệ thống</span>
          </div>
          <h1 className="text-3xl font-black text-neutral-800 tracking-tight mt-1">Quản lý Banner Trang chủ</h1>
          <p className="text-sm text-neutral-500 mt-1">Thiết lập các chiến dịch hình ảnh nổi bật hiển thị ở đầu trang chủ khách hàng.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-md shadow-orange-500/10 hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-600/20 active:scale-[0.98] transition"
        >
          <Plus size={18} />
          <span>Thêm banner mới</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          Lỗi tải dữ liệu: {error}. Vui lòng tải lại trang.
        </div>
      )}

      {/* Main Grid Banner List */}
      {banners.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-neutral-200 rounded-2xl">
          <ImageIcon className="h-16 w-16 text-neutral-300 stroke-[1.5] mb-4" />
          <h3 className="text-lg font-bold text-neutral-700">Chưa có banner nào</h3>
          <p className="text-sm text-neutral-400 mt-1 mb-6">Hãy tạo banner đầu tiên để hiển thị trên slider trang chủ.</p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-neutral-800 transition"
          >
            Tạo banner ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner.id}
              className={`group relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 hover:shadow-md ${
                banner.isActive ? "border-neutral-100" : "border-neutral-200 opacity-75 bg-neutral-50/50"
              }`}
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[21/9] bg-neutral-950 overflow-hidden">
                <img
                  src={banner.imageUrl}
                  alt={banner.title || "Banner Preview"}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-102"
                />
                
                {/* Dark overlay with hover details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5">
                  <span className="text-xs font-bold text-orange-400 bg-orange-950/40 backdrop-blur-md px-2.5 py-1 rounded-full self-start mb-2 border border-orange-500/20">
                    Thứ tự: {banner.orderNum}
                  </span>
                  
                  {banner.title && (
                    <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-1">{banner.title}</h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-xs text-white/80 line-clamp-2 mt-1">{banner.subtitle}</p>
                  )}
                </div>

                {/* Status Indicator */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`p-2 rounded-xl backdrop-blur-md transition shadow-md border ${
                      banner.isActive
                        ? "bg-emerald-500/20 border-emerald-500/35 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-neutral-900/60 border-neutral-700/50 text-neutral-400 hover:bg-neutral-900/80"
                    }`}
                    title={banner.isActive ? "Ẩn banner" : "Hiện banner"}
                  >
                    {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              {/* Bottom control bar */}
              <div className="p-4 flex items-center justify-between bg-white border-t border-neutral-100">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <LinkIcon size={14} className="text-neutral-300" />
                  <span className="truncate max-w-[200px]" title={banner.linkUrl}>
                    {banner.linkUrl ? banner.linkUrl : "Không thiết lập liên kết"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEditModal(banner)}
                    className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition active:scale-95"
                    title="Chỉnh sửa"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmDeleteId(banner.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition active:scale-95"
                    title="Xóa banner"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-neutral-100 transform transition-all animate-slideUp">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <h2 className="text-lg font-bold text-neutral-800">
                {editingBanner ? "Chỉnh sửa Banner" : "Thêm Banner mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Image upload area */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Ảnh banner (bắt buộc)</label>
                <div className="relative border-2 border-dashed border-neutral-200 hover:border-orange-400 rounded-xl overflow-hidden aspect-[21/9] bg-neutral-50 flex flex-col items-center justify-center group transition">
                  {formData.imageUrl ? (
                    <>
                      <img
                        src={formData.imageUrl}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                        <label className="cursor-pointer rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 hover:bg-neutral-50 shadow transition">
                          Thay đổi ảnh
                          <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                        </label>
                      </div>
                    </>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center justify-center p-4 w-full h-full">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                          <span className="text-xs text-neutral-500 font-semibold">Đang tải ảnh lên...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-neutral-400 group-hover:text-orange-500 transition mb-2" />
                          <span className="text-xs text-neutral-500 font-semibold group-hover:text-neutral-700">Tải ảnh banner lên</span>
                          <span className="text-[10px] text-neutral-400 mt-1">Hỗ trợ file PNG, JPG, JPEG (Max 5MB)</span>
                        </>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                    </label>
                  )}
                </div>
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Tiêu đề chính</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ví dụ: BST Vintage mới"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.orderNum}
                    onChange={(e) => setFormData(prev => ({ ...prev, orderNum: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    min="0"
                    className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Phụ đề / Mô tả ngắn</label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="Ví dụ: Giảm thêm tới 50% cho các sản phẩm retro độc bản."
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Liên kết URL (khi click vào banner)</label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                  placeholder="Ví dụ: /shops hoặc link web ngoài"
                  className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20"
                />
              </div>

              {/* Status active */}
              <div className="flex items-center gap-3 py-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-neutral-300 text-orange-500 focus:ring-orange-500"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-neutral-700 select-none cursor-pointer">
                  Kích hoạt hiển thị banner ngay
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-neutral-200 px-5 py-2.5 text-sm font-bold text-neutral-500 hover:bg-neutral-50 active:scale-95 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 active:scale-95 transition disabled:opacity-50"
                >
                  Lưu thông tin
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleDelete}
        title="Xóa banner trang chủ"
        message="Bạn có chắc chắn muốn xóa banner này? Giao diện trang chủ sẽ không hiển thị banner này nữa."
        type="danger"
      />
    </div>
  );
}
