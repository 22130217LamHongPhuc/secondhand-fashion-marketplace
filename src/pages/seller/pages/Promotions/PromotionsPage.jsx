import { useState, useEffect } from "react";
import { 
  Tag, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock
} from "lucide-react";
import sellerPromotionApi from "../../api/sellerPromotionApi";
import sellerProductApi from "../../api/sellerProductApi";
import { toastService } from "@/services/toastService";
import AdvancedFilter from "../../components/common/AdvancedFilter";

const PromotionsPage = () => {
  const [activeTab, setActiveTab] = useState("coupons"); // "coupons" or "campaigns"
  
  // Coupons states
  const [coupons, setCoupons] = useState([]);
  const [loadingCoupons, setLoadingCoupons] = useState(true);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [submittingCoupon, setSubmittingCoupon] = useState(false);
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

  // Campaigns states
  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  
  // Registration states
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [registeredProducts, setRegisteredProducts] = useState([]);
  const [loadingRegisteredProducts, setLoadingRegisteredProducts] = useState(false);
  
  // Shop products list for selection
  const [shopProducts, setShopProducts] = useState([]);
  const [loadingShopProducts, setLoadingShopProducts] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [proposedCampaignPrice, setProposedCampaignPrice] = useState("");
  const [registeringProduct, setRegisteringProduct] = useState(false);

  useEffect(() => {
    if (activeTab === "coupons") {
      loadCoupons();
    } else {
      loadCampaigns();
    }
  }, [activeTab, couponFilters]);

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

  const loadCampaigns = async () => {
    try {
      setLoadingCampaigns(true);
      const res = await sellerPromotionApi.getCampaigns();
      const rawData = res?.data?.data || res?.data || res;
      setCampaigns(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      toastService.error("Không thể tải danh sách chiến dịch");
      console.error(err);
    } finally {
      setLoadingCampaigns(false);
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

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa mã giảm giá này?")) {
      try {
        await sellerPromotionApi.deleteCoupon(id);
        toastService.success("Đã xóa mã giảm giá!");
        loadCoupons();
      } catch (err) {
        toastService.error("Xóa thất bại: " + err.message);
      }
    }
  };

  // Campaign Product Management
  const handleSelectCampaign = async (campaign) => {
    setSelectedCampaign(campaign);
    setRegisteredProducts([]);
    setSelectedProductId("");
    setProposedCampaignPrice("");
    loadRegisteredProducts(campaign.id);
    loadShopProducts();
  };

  const loadRegisteredProducts = async (campaignId) => {
    try {
      setLoadingRegisteredProducts(true);
      const res = await sellerPromotionApi.getCampaignProducts(campaignId);
      const rawData = res?.data?.data || res?.data || res;
      // Filter products belonging to this seller shop (shop ID is usually mock 1 for seller 1)
      const list = Array.isArray(rawData) ? rawData : [];
      setRegisteredProducts(list);
    } catch (err) {
      console.error("Lỗi tải sản phẩm đã đăng ký:", err);
    } finally {
      setLoadingRegisteredProducts(false);
    }
  };

  const loadShopProducts = async () => {
    try {
      setLoadingShopProducts(true);
      const res = await sellerProductApi.getAll({ isActive: true });
      // sellerProductApi.getAll() trả về Spring Page format: res.data.data.content
      const content = res?.data?.data?.content;
      setShopProducts(Array.isArray(content) ? content : []);
    } catch (err) {
      console.error("Lỗi tải sản phẩm của shop:", err);
    } finally {
      setLoadingShopProducts(false);
    }
  };

  const handleRegisterProduct = async (e) => {
    e.preventDefault();
    if (!selectedProductId || !proposedCampaignPrice) {
      toastService.error("Vui lòng chọn sản phẩm và nhập giá sale đề xuất");
      return;
    }

    try {
      setRegisteringProduct(true);
      const payload = {
        productId: Number(selectedProductId),
        campaignPrice: Number(proposedCampaignPrice)
      };
      await sellerPromotionApi.registerProduct(selectedCampaign.id, payload);
      toastService.success("Đăng ký sản phẩm tham gia chiến dịch thành công!");
      setSelectedProductId("");
      setProposedCampaignPrice("");
      loadRegisteredProducts(selectedCampaign.id);
    } catch (err) {
      toastService.error("Đăng ký thất bại: " + (err.response?.data?.message || err.message));
    } finally {
      setRegisteringProduct(false);
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (window.confirm("Bạn có chắc chắn muốn rút sản phẩm này khỏi chiến dịch?")) {
      try {
        await sellerPromotionApi.removeProduct(selectedCampaign.id, productId);
        toastService.success("Đã rút sản phẩm khỏi chiến dịch");
        loadRegisteredProducts(selectedCampaign.id);
      } catch (err) {
        toastService.error("Thao tác thất bại: " + err.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-neutral-800">
            Quản lý Khuyến mãi & Chiến dịch
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Kích cầu doanh số bằng voucher shop và các ngày hội mua sắm của sàn.
          </p>
        </div>
        {activeTab === "coupons" && (
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
        )}
      </div>

      {/* Tabs Selection */}
      <div className="flex border-b border-neutral-200">
        <button
          onClick={() => { setActiveTab("coupons"); setSelectedCampaign(null); }}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-medium transition-all ${
            activeTab === "coupons"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Tag size={16} />
          <span>Voucher của Shop</span>
        </button>
        <button
          onClick={() => { setActiveTab("campaigns"); setSelectedCampaign(null); }}
          className={`flex items-center gap-2 border-b-2 px-6 py-3.5 text-sm font-medium transition-all ${
            activeTab === "campaigns"
              ? "border-brand-primary text-brand-primary"
              : "border-transparent text-neutral-500 hover:text-neutral-700"
          }`}
        >
          <Sparkles size={16} />
          <span>Chiến dịch của Sàn</span>
        </button>
      </div>

      {activeTab === "coupons" && (
        <AdvancedFilter onApply={(filters) => setCouponFilters(filters)} />
      )}

      {/* TABS CONTENT */}
      {activeTab === "coupons" ? (
        /* VOUCHERS TAB */
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
      ) : (
        /* CAMPAIGNS TAB */
        <div>
          {selectedCampaign ? (
            /* CAMPAIGN REGISTRATION PANEL */
            <div className="space-y-6">
              {/* Back to campaigns list */}
              <button
                onClick={() => setSelectedCampaign(null)}
                className="flex items-center gap-1.5 text-sm font-semibold text-brand-primary hover:underline"
              >
                ← Quay lại danh sách chiến dịch
              </button>

              {/* Campaign Highlight Card */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-6">
                  {selectedCampaign.bannerUrl && (
                    <div className="h-32 w-full md:w-56 overflow-hidden rounded-xl bg-neutral-100 flex-shrink-0">
                      <img src={selectedCampaign.bannerUrl} alt={selectedCampaign.name} className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-neutral-800">{selectedCampaign.name}</h2>
                    <p className="text-sm text-neutral-500">{selectedCampaign.description || "Không có mô tả chi tiết."}</p>
                    <div className="flex flex-wrap gap-4 pt-2 text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><Calendar size={14} /> Bắt đầu: {new Date(selectedCampaign.startDate).toLocaleString("vi-VN")}</span>
                      <span className="flex items-center gap-1"><Clock size={14} /> Kết thúc: {new Date(selectedCampaign.endDate).toLocaleString("vi-VN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Product Register Form */}
                <div className="lg:col-span-1 rounded-2xl border border-neutral-200 bg-white p-5 h-fit shadow-sm">
                  <h3 className="text-base font-bold text-neutral-800 mb-4">Đăng ký sản phẩm</h3>
                  <form onSubmit={handleRegisterProduct} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Chọn sản phẩm cũ của shop</label>
                      {loadingShopProducts ? (
                        <div className="text-xs text-neutral-400">Đang tải danh sách sản phẩm...</div>
                      ) : (
                        <select
                          required
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-primary"
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {shopProducts.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.name} ({p.basePrice.toLocaleString("vi-VN")} đ)
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-500 mb-1.5">Giá sale chiến dịch đề xuất (đ)</label>
                      <input
                        type="number"
                        required
                        min="1000"
                        placeholder="Ví dụ: 80000"
                        value={proposedCampaignPrice}
                        onChange={(e) => setProposedCampaignPrice(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-brand-primary"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={registeringProduct}
                      className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white shadow-md hover:bg-brand-dark disabled:opacity-50"
                    >
                      {registeringProduct ? "Đang đăng ký..." : "Gửi Đăng Ký"}
                    </button>
                  </form>
                </div>

                {/* Registered List */}
                <div className="lg:col-span-2 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-neutral-800 mb-4">Sản phẩm đã đăng ký tham gia</h3>
                  {loadingRegisteredProducts ? (
                    <div className="py-6 text-center text-neutral-400">Đang tải danh sách...</div>
                  ) : registeredProducts.length === 0 ? (
                    <div className="py-8 text-center text-neutral-400 text-sm">
                      Chưa có sản phẩm nào được đăng ký cho chiến dịch này.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-neutral-100 text-left text-neutral-400">
                            <th className="pb-3 font-semibold">Sản phẩm</th>
                            <th className="pb-3 font-semibold">Giá sale</th>
                            <th className="pb-3 font-semibold text-center">Trạng thái duyệt</th>
                            <th className="pb-3 font-semibold text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registeredProducts.map(rp => (
                            <tr key={rp.productId} className="border-b border-neutral-50">
                              <td className="py-3.5 font-medium text-neutral-800">
                                {rp.productName || `Sản phẩm ID: ${rp.productId}`}
                              </td>
                              <td className="py-3.5 font-bold text-brand-primary">
                                {rp.campaignPrice.toLocaleString("vi-VN")} đ
                              </td>
                              <td className="py-3.5 text-center">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                                  rp.status === "APPROVED" 
                                    ? "bg-green-50 text-green-700" 
                                    : rp.status === "REJECTED"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-yellow-50 text-yellow-750"
                                }`}>
                                  {rp.status === "APPROVED" ? (
                                    <CheckCircle size={12} />
                                  ) : rp.status === "REJECTED" ? (
                                    <XCircle size={12} />
                                  ) : (
                                    <AlertCircle size={12} />
                                  )}
                                  {rp.status === "APPROVED" ? "Đã duyệt" : rp.status === "REJECTED" ? "Từ chối" : "Đang duyệt"}
                                </span>
                              </td>
                              <td className="py-3.5 text-center">
                                <button
                                  onClick={() => handleRemoveProduct(rp.productId)}
                                  className="text-neutral-400 hover:text-red-500"
                                >
                                  Rút hồ sơ
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* CAMPAIGNS LIST */
            <div>
              {loadingCampaigns ? (
                <div className="py-12 text-center text-neutral-500">Đang tải danh sách chiến dịch...</div>
              ) : campaigns.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-white p-12 text-center">
                  <Sparkles size={40} className="mx-auto mb-4 text-neutral-400" />
                  <h3 className="text-lg font-bold text-neutral-700">Chưa có chiến dịch nào</h3>
                  <p className="mt-1 text-sm text-neutral-400">
                    Admin của sàn chưa tạo chiến dịch mua sắm nào.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {campaigns.map((camp) => (
                    <div key={camp.id} className="flex flex-col rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {camp.bannerUrl && (
                        <div className="h-36 overflow-hidden bg-neutral-100">
                          <img src={camp.bannerUrl} alt={camp.name} className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <h3 className="text-lg font-bold text-neutral-800">{camp.name}</h3>
                          <p className="text-xs text-neutral-400 line-clamp-2">{camp.description || "Ngày hội xả tủ secondhand toàn quốc."}</p>
                          <div className="text-[11px] text-neutral-400 pt-1 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                              <span>Bắt đầu: {new Date(camp.startDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <svg xmlns="http://www.w3.org/2500/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 2h14"/><path d="M5 22h14"/><path d="M19 2v4c0 4-3 7-7 7s-7-3-7-7V2"/><path d="M5 22v-4c0-4 3-7 7-7s7 3 7 7v4"/></svg>
                              <span>Kết thúc: {new Date(camp.endDate).toLocaleDateString("vi-VN")}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSelectCampaign(camp)}
                          className="w-full text-center rounded-xl border border-brand-primary text-brand-primary py-2.5 text-sm font-semibold hover:bg-brand-primary/5 transition-colors"
                        >
                          Tham Gia & Đăng Ký Đồ
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
    </div>
  );
};

export default PromotionsPage;
