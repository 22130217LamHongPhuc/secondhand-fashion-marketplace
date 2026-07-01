import React, { useEffect, useState } from "react";
import { campaignService } from "@/services/admin";
import { 
  Plus, 
  Megaphone, 
  CheckCircle, 
  Calendar, 
  Clock, 
  Pencil, 
  Trash2, 
  X,
  Sparkles,
  ClipboardList,
  Eye,
  Check,
  AlertCircle
} from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

export function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ isOpen: false, campaignId: null });

  // Registered products moderation states
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [registeredProducts, setRegisteredProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    bannerUrl: "",
    startDate: "",
    endDate: "",
    isAutoSave: false,
  });

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const res = await campaignService.getAll();
      const rawData = res?.data || res;
      setCampaigns(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setFormData({
      name: "",
      description: "",
      bannerUrl: "",
      startDate: "",
      endDate: "",
      isAutoSave: false,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description || "",
      bannerUrl: campaign.bannerUrl || "",
      startDate: campaign.startDate ? campaign.startDate.substring(0, 16) : "",
      endDate: campaign.endDate ? campaign.endDate.substring(0, 16) : "",
      isAutoSave: campaign.isAutoSave || false,
    });
    setShowModal(true);
  };

  const handleToggleActive = async (id, currentActive) => {
    try {
      await campaignService.toggleActive(id, !currentActive);
      loadCampaigns();
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái: " + err.message);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmModal({ isOpen: true, campaignId: id });
  };

  const executeDelete = async () => {
    try {
      await campaignService.delete(deleteConfirmModal.campaignId);
      alert("Xóa chiến dịch thành công!");
      loadCampaigns();
    } catch (err) {
      alert("Lỗi khi xóa chiến dịch: " + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
      };

      if (editingCampaign) {
        await campaignService.update(editingCampaign.id, payload);
        alert("Cập nhật chiến dịch thành công!");
      } else {
        await campaignService.create(payload);
        alert("Tạo chiến dịch mới thành công!");
      }
      setShowModal(false);
      loadCampaigns();
    } catch (err) {
      alert("Lỗi lưu chiến dịch: " + err.message);
    }
  };

  // View registered products for campaign
  const handleViewProducts = async (campaign) => {
    setSelectedCampaign(campaign);
    setShowProductsModal(true);
    setLoadingProducts(true);
    try {
      const res = await campaignService.getProducts(campaign.id);
      const rawData = res?.data || res;
      setRegisteredProducts(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      console.error(err);
      setRegisteredProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Approve / Reject registered product
  const handleUpdateProductStatus = async (productId, status) => {
    try {
      await campaignService.updateProductStatus(selectedCampaign.id, productId, status);
      alert(`Đã ${status === "APPROVED" ? "DUYỆT" : "TỪ CHỐI"} sản phẩm tham gia chiến dịch!`);
      const res = await campaignService.getProducts(selectedCampaign.id);
      const rawData = res?.data || res;
      setRegisteredProducts(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const upcomingCampaigns = campaigns.filter(c => new Date(c.startDate) > new Date()).length;

  return (
    <div className="flex flex-col min-h-full gap-6 w-full text-stone-800 pb-10 animate-[fadeIn_0.3s_ease]">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight m-0">Quản lý Chiến dịch Sale</h1>
          <p className="text-sm text-stone-500 m-0 mt-1">Cấu hình các chương trình khuyến mại lớn, flash sale toàn sàn và phê duyệt sản phẩm đăng ký tham gia.</p>
        </div>
        <button
          className="flex items-center justify-center gap-2 rounded-xl py-2.5 px-5 text-sm font-bold cursor-pointer transition-all bg-[#c85a28] hover:bg-[#b84c1a] text-white border-none shadow-md shadow-orange-500/10 active:scale-[0.98] w-full sm:w-auto"
          type="button"
          onClick={handleOpenCreate}
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Chiến dịch</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Tổng số chiến dịch</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{totalCampaigns}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-orange-50 text-[#c85a28] border border-orange-100/50">
              <Megaphone className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Đang hoạt động</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{activeCampaigns}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-emerald-50 text-emerald-700 border border-emerald-100/50">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-[0_8px_30px_rgba(238,229,219,0.12)]">
          <div className="text-[10px] font-black text-stone-400 tracking-wider uppercase">Sắp diễn ra</div>
          <div className="flex items-center justify-between gap-3 mt-2.5">
            <div className="text-2xl font-extrabold text-stone-900 leading-none">{upcomingCampaigns}</div>
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-blue-50 text-blue-700 border border-blue-100/50">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-[0_8px_30px_rgba(238,229,219,0.15)] overflow-hidden">
        {loading ? (
          <div className="flex flex-col gap-3 justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-[#c85a28]/25 border-t-[#c85a28] rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-stone-500">Đang tải dữ liệu chiến dịch...</span>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-rose-600 font-bold">Lỗi kết nối: {error}</div>
        ) : campaigns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80">
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase pl-6">Chiến dịch</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-28">Cách lưu</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-48">Thời hạn chạy</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-40 text-center">Duyệt sản phẩm</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-32 text-center">Trạng thái</th>
                  <th className="p-4 text-[10px] font-bold text-stone-500 tracking-wider uppercase pr-6 w-24 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {campaigns.map((campaign) => {
                  const isExpired = new Date(campaign.endDate) < new Date();
                  const isStarted = new Date(campaign.startDate) <= new Date() && !isExpired;

                  return (
                    <tr key={campaign.id} className="hover:bg-stone-50/45 transition-colors">
                      <td className="p-4 pl-6 align-middle">
                        <div className="flex items-center gap-3.5">
                          {campaign.bannerUrl ? (
                            <img 
                              src={campaign.bannerUrl} 
                              alt={campaign.name} 
                              className="w-12 h-8 rounded-lg object-cover border border-stone-200/60 shrink-0 bg-stone-50"
                            />
                          ) : (
                            <div className="w-12 h-8 rounded-lg bg-orange-50 border border-orange-100/50 flex items-center justify-center text-[#c85a28] shrink-0">
                              <Sparkles className="w-4 h-4" />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-stone-850 text-sm">{campaign.name}</span>
                            <span className="text-[11px] text-stone-400 line-clamp-1">{campaign.description || "Chưa có mô tả chi tiết."}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                          campaign.isAutoSave ? "bg-blue-50 text-blue-700 border border-blue-100" : "bg-stone-50 text-stone-600 border border-stone-200"
                        }`}>
                          {campaign.isAutoSave ? "Tự động" : "Thủ công"}
                        </span>
                      </td>
                      <td className="p-4 align-middle">
                        <div className="flex flex-col gap-1 text-[10px] text-stone-500 font-medium">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-stone-400" />
                            <span>Từ: {new Date(campaign.startDate).toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>Đến: {new Date(campaign.endDate).toLocaleString("vi-VN")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 align-middle text-center">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-[#c85a28] hover:bg-orange-100 border border-orange-150 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm shadow-orange-500/5"
                          onClick={() => handleViewProducts(campaign)}
                        >
                          <ClipboardList className="w-3.5 h-3.5" />
                          <span>Duyệt sản phẩm</span>
                        </button>
                      </td>
                      {/* Standardized Dropdown Select for Status */}
                      <td className="p-4 align-middle text-center">
                        <select
                          value={campaign.isActive ? "active" : "inactive"}
                          onChange={() => handleToggleActive(campaign.id, campaign.isActive)}
                          className={`py-1 px-3 border rounded-full text-xs font-bold cursor-pointer outline-none transition-all ${
                            campaign.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                          }`}
                        >
                          <option value="active">Hoạt động</option>
                          <option value="inactive">Tắt</option>
                        </select>
                      </td>
                      {/* Standardized Action Buttons */}
                      <td className="p-4 pr-6 align-middle text-center">
                        <div className="flex gap-1.5 justify-center items-center">
                          <button
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            onClick={() => handleOpenEdit(campaign)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            className="p-1.5 rounded-lg text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            onClick={() => handleDelete(campaign.id)}
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20 px-5 text-stone-400 text-xs font-bold">Chưa có chiến dịch mua sắm nào được tạo trên hệ thống.</div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1100] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-[550px] shadow-2xl border border-stone-200/60 overflow-hidden animate-[scaleIn_0.2s_ease-out] [color-scheme:light]">
            
            {/* Modal Header */}
            <div className="bg-stone-50 p-4 px-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="m-0 text-base font-extrabold text-stone-900">
                {editingCampaign ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}
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
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Tên chiến dịch *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Xả tủ Vintage Đồng giá 99K"
                  value={formData.name}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Mô tả chiến dịch</label>
                <textarea
                  placeholder="Nhập mô tả chiến dịch, thể lệ tham gia cho các shop..."
                  value={formData.description}
                  rows={3}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 resize-none"
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Ảnh bìa Banner (URL)</label>
                <input
                  type="text"
                  placeholder="Link ảnh minh họa banner..."
                  value={formData.bannerUrl}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Cách lưu/Áp dụng chiến dịch *</label>
                <select
                  value={formData.isAutoSave ? "AUTO" : "MANUAL"}
                  onChange={(e) => setFormData({ ...formData, isAutoSave: e.target.value === "AUTO" })}
                  className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-700 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5 cursor-pointer"
                >
                  <option value="MANUAL">🔑 Thủ công (Shop tự đăng ký tham gia)</option>
                  <option value="AUTO">⚡ Tự động (Hệ thống tự áp dụng)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Thời gian bắt đầu *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    className="bg-white border border-stone-200 rounded-xl p-2.5 text-sm text-stone-850 outline-none transition-all focus:border-[#c85a28] focus:ring-4 focus:ring-[#c85a28]/5"
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Thời gian kết thúc *</label>
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
                  {editingCampaign ? "Lưu thay đổi" : "Tạo chiến dịch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation products Modal */}
      {showProductsModal && selectedCampaign && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-[1100] animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-[850px] shadow-2xl border border-stone-200/60 overflow-hidden animate-[scaleIn_0.2s_ease-out] [color-scheme:light]">
            
            {/* Modal Header */}
            <div className="bg-stone-50 p-4 px-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="m-0 text-base font-extrabold text-stone-900 flex items-center gap-2">
                  Duyệt sản phẩm tham gia
                </h3>
                <p className="m-0 mt-0.5 text-xs text-stone-400">Chiến dịch: {selectedCampaign.name}</p>
              </div>
              <button 
                className="bg-none border-none text-stone-400 cursor-pointer p-1 rounded-lg hover:bg-stone-200/50 hover:text-stone-900 transition-colors flex items-center justify-center"
                onClick={() => setShowProductsModal(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 bg-white">
              <div className="overflow-x-auto rounded-xl border border-stone-200/70 max-h-[50vh]">
                {loadingProducts ? (
                  <div className="flex flex-col gap-3 justify-center items-center py-16">
                    <div className="w-8 h-8 border-4 border-[#c85a28]/25 border-t-[#c85a28] rounded-full animate-spin"></div>
                    <span className="text-xs font-semibold text-stone-400">Đang tải danh sách sản phẩm đăng ký...</span>
                  </div>
                ) : registeredProducts.length > 0 ? (
                  <table className="w-full border-collapse text-left">
                    <thead className="bg-stone-50 border-b border-stone-200/80 sticky top-0 z-10">
                      <tr>
                        <th className="p-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase pl-5">Sản phẩm</th>
                        <th className="p-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-48">Cửa hàng</th>
                        <th className="p-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-32">Giá gốc</th>
                        <th className="p-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-36">Giá sale đề xuất</th>
                        <th className="p-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase w-32 text-center">Trạng thái</th>
                        <th className="p-3 text-[10px] font-bold text-stone-500 tracking-wider uppercase pr-5 w-44 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {registeredProducts.map((reg) => (
                        <tr key={reg.id || `${reg.campaignId}-${reg.productId}`} className="hover:bg-stone-50/40 transition-colors">
                          <td className="p-3 pl-5 align-middle">
                            <span className="font-bold text-stone-850 text-xs">{reg.productName || `ID: ${reg.productId}`}</span>
                          </td>
                          <td className="p-3 align-middle text-xs font-semibold text-stone-600">
                            {reg.shopName || "Cửa hàng"}
                          </td>
                          <td className="p-3 align-middle text-xs text-stone-500 font-mono">
                            {reg.originalPrice ? `${reg.originalPrice.toLocaleString("vi-VN")} đ` : "-"}
                          </td>
                          <td className="p-3 align-middle text-xs font-bold text-[#c85a28] font-mono">
                            {reg.campaignPrice.toLocaleString("vi-VN")} đ
                          </td>
                          <td className="p-3 align-middle text-center">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              reg.status === "PENDING" 
                                ? "bg-amber-50 text-amber-700 border border-amber-100" 
                                : reg.status === "APPROVED" 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : "bg-rose-50 text-rose-700 border border-rose-100"
                            }`}>
                              {reg.status === "PENDING" ? "Chờ duyệt" : reg.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                            </span>
                          </td>
                          <td className="p-3 pr-5 align-middle text-center">
                            <div className="flex justify-center gap-1.5">
                              {reg.status === "PENDING" && (
                                <>
                                  <button 
                                    className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
                                    onClick={() => handleUpdateProductStatus(reg.productId, "APPROVED")}
                                  >
                                    Duyệt
                                  </button>
                                  <button 
                                    className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
                                    onClick={() => handleUpdateProductStatus(reg.productId, "REJECTED")}
                                  >
                                    Từ chối
                                  </button>
                                </>
                              )}
                              {reg.status === "APPROVED" && (
                                <button 
                                  className="px-2.5 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
                                  onClick={() => handleUpdateProductStatus(reg.productId, "REJECTED")}
                                >
                                  Hủy duyệt
                                </button>
                              )}
                              {reg.status === "REJECTED" && (
                                <button 
                                  className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-[10px] font-bold cursor-pointer active:scale-95 transition-all"
                                  onClick={() => handleUpdateProductStatus(reg.productId, "APPROVED")}
                                >
                                  Duyệt lại
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-16 text-stone-400 text-xs font-bold">Chưa có cửa hàng nào đăng ký sản phẩm tham gia chiến dịch này.</div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="bg-stone-50 p-4 px-6 border-t border-stone-100 flex justify-end">
              <button 
                className="bg-stone-100 hover:bg-stone-200/80 text-stone-700 py-2 px-4 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-[0.98] border-none" 
                onClick={() => setShowProductsModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteConfirmModal.isOpen}
        onClose={() => setDeleteConfirmModal({ isOpen: false, campaignId: null })}
        onConfirm={executeDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa chiến dịch này không?"
        type="danger"
      />
    </div>
  );
}
