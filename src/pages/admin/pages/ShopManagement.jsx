import React, { useState, useEffect } from "react";
import { shopService, complaintService } from "../../../services/admin";
import { toastService } from "@/services/toastService";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminLoader from "@/components/common/AdminLoader";
import { 
  Store, 
  Search, 
  Star, 
  CheckCircle, 
  X, 
  Lock, 
  Unlock, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Sparkles 
} from "lucide-react";

export function ShopManagement() {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmResetShopId, setConfirmResetShopId] = useState(null);

  const fetchShops = () => {
    setLoading(true);
    Promise.all([
      shopService.getAll(),
      complaintService.getAll().catch(() => [])
    ])
      .then(([shopsRes, complaintsRes]) => {
        if (shopsRes && Array.isArray(shopsRes)) {
          setShops(shopsRes);
          if (shopsRes.length > 0) {
            setSelectedShopId((prev) => {
              if (prev && shopsRes.some((s) => s.id === prev)) return prev;
              return shopsRes[0].id;
            });
          }
        }
        if (complaintsRes && Array.isArray(complaintsRes)) {
          setComplaints(complaintsRes);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách shop và khiếu nại:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchShops();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterType, searchQuery]);

  if (loading) {
    return <AdminLoader text="Đang tải dữ liệu..." />;
  }

  if (shops.length === 0) {
    return (
      <div className="flex flex-col gap-5 w-full text-stone-850 pb-10 min-h-[50vh] justify-center items-center">
        <Store className="w-12 h-12 text-stone-400" />
        <h2 className="text-stone-750 text-base font-bold">Chưa có cửa hàng nào đăng ký trên hệ thống!</h2>
      </div>
    );
  }

  const selectedShop = shops.find((s) => s.id === selectedShopId) || shops[0] || {};
  const shopComplaints = complaints.filter((c) => c.reportedShop && c.reportedShop.id === selectedShop.id);

  // Stats
  const totalShops = shops.length;
  const verifiedShopsCount = shops.filter((s) => s.isVerified).length;
  const lockedShopsCount = shops.filter((s) => !s.isActive).length;
  const totalStrikes = shops.reduce((sum, s) => sum + (s.warningStrikes || 0), 0);

  // Filter & Search Logic
  const filteredShops = shops.filter((shop) => {
    const sName = shop.name || "";
    const sellerName = shop.owner ? shop.owner.fullName : "Chủ shop";
    const matchesSearch =
      sName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "verified") return shop.isVerified;
    if (filterType === "warning") return (shop.warningStrikes || 0) > 0;
    if (filterType === "locked") return !shop.isActive;
    return true;
  });

  // Pagination logic
  const shopsPerPage = 20;
  const totalPages = Math.ceil(filteredShops.length / shopsPerPage);
  const indexOfLastShop = currentPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = filteredShops.slice(indexOfFirstShop, indexOfLastShop);

  // Action: Toggle Verify Tích xanh
  const handleToggleVerify = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    const nextState = !shop.isVerified;
    
    // 1. Optimistic update
    setShops(prev => prev.map(s => s.id === id ? { ...s, isVerified: nextState } : s));
    toastService.success(nextState ? `Đã cấp tích xanh xác thực (Verified) cho shop "${shop.name}"!` : `Đã thu hồi tích xanh của shop "${shop.name}"!`);

    // 2. Background API call
    shopService.toggleVerify(id, nextState)
      .catch((err) => {
        toastService.error("Thao tác thất bại: " + err.message);
        // Revert
        setShops(prev => prev.map(s => s.id === id ? { ...s, isVerified: !nextState } : s));
      });
  };

  // Action: Toggle Active status (Lock/Unlock)
  const handleToggleActive = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    const nextState = !shop.isActive;

    // 1. Optimistic update
    setShops(prev => prev.map(s => s.id === id ? { ...s, isActive: nextState } : s));
    toastService.success(nextState ? `Đã mở khóa hoạt động cho shop "${shop.name}"!` : `Đã tạm khóa hoạt động shop "${shop.name}"!`);

    // 2. Background API call
    shopService.toggleActive(id, nextState)
      .catch((err) => {
        toastService.error("Thao tác thất bại: " + err.message);
        // Revert
        setShops(prev => prev.map(s => s.id === id ? { ...s, isActive: !nextState } : s));
      });
  };

  // Action: Add Violation Strike
  const handleAddStrike = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    const nextStrikes = (shop.warningStrikes || 0) + 1;
    const nextActive = nextStrikes >= 5 ? false : shop.isActive;

    // 1. Optimistic update
    setShops(prev => prev.map(s => s.id === id ? { ...s, warningStrikes: nextStrikes, isActive: nextActive } : s));
    let msg = `Đã phạt cảnh cáo thêm 1 điểm lỗi đối với shop "${shop.name}". (Tổng điểm lỗi hiện tại: ${nextStrikes}/5)`;
    if (nextStrikes >= 5) {
      msg += `\n⚠️ CỬA HÀNG ĐÃ ĐẠT MỨC TỐI ĐA 5 ĐIỂM LỖI! Hệ thống tự động khóa tài khoản shop vĩnh viễn.`;
      toastService.error(msg, { duration: 6000 });
    } else {
      toastService.warning(msg);
    }

    // 2. Background API call
    shopService.addStrike(id)
      .catch((err) => {
        toastService.error("Thao tác thất bại: " + err.message);
        // Revert
        setShops(prev => prev.map(s => s.id === id ? { ...s, warningStrikes: shop.warningStrikes, isActive: shop.isActive } : s));
      });
  };

  // Action: Reset Strikes
  const handleResetStrikes = (id) => {
    setConfirmResetShopId(id);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-stone-850 pb-10 animate-[fadeIn_0.35s_cubic-bezier(0.4,0,0.2,1)]">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-1">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight m-0">Quản lý cửa hàng</h1>
        </div>
      </div>

      {/* Top statistics widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Tổng số Shop */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">TỔNG SỐ SHOP</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalShops}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-orange-50 text-[#c85a28]">
            <Store className="w-5 h-5 text-[#c85a28]" />
          </div>
        </div>

        {/* Card 2: Shop Tích Xanh */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">SHOP TÍCH XANH</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{verifiedShopsCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-emerald-50 text-emerald-750">
            <Sparkles className="w-5 h-5 text-emerald-750" />
          </div>
        </div>

        {/* Card 3: Shop Bị Khóa */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">SHOP BỊ KHÓA</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{lockedShopsCount}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-rose-50 text-rose-600">
            <Lock className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        {/* Card 4: Điểm cảnh cáo */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">WARNING STRIKES</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalStrikes}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-amber-50 text-amber-700">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
        </div>
      </div>

      {/* Control Bar (Filters and Search) */}
      <div className="flex flex-col gap-4">
        <div className="flex bg-stone-100 border border-stone-200 rounded-xl p-1 gap-1 w-fit flex-wrap">
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              filterType === "all"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setFilterType("all")}
          >
            Tất cả cửa hàng
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              filterType === "verified"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setFilterType("verified")}
          >
            Shop Tích Xanh
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              filterType === "warning"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setFilterType("warning")}
          >
            Có vi phạm
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              filterType === "locked"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => setFilterType("locked")}
          >
            Bị Khóa
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl py-2 px-4 flex items-center gap-2.5 w-full sm:w-[320px] shadow-sm focus-within:border-[#c85a28] transition-all">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm shop, chủ shop..."
            value={searchQuery}
            className="bg-transparent border-none outline-none text-[13px] text-stone-700 w-full placeholder-stone-400"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Two Columns Table & Moderation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Left Column: Shops List Table */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-5 shadow-[0_8px_30px_rgb(238,229,219,0.2)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-150">
                  <th className="p-3 text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase w-12">ID</th>
                  <th className="p-3 text-left text-[11px] font-bold text-stone-500 tracking-wider uppercase">Tên cửa hàng</th>
                  <th className="p-3 text-left text-[11px] font-bold text-stone-500 tracking-wider uppercase">Chủ shop</th>
                  <th className="p-3 text-left text-[11px] font-bold text-stone-500 tracking-wider uppercase">Ngày tham gia</th>
                  <th className="p-3 text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase">Đánh giá</th>
                  <th className="p-3 text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase">Sản phẩm</th>
                  <th className="p-3 text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase">Strikes</th>
                  <th className="p-3 text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase">Tích xanh</th>
                  <th className="p-3 text-center text-[11px] font-bold text-stone-500 tracking-wider uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {currentShops.map((shop) => (
                  <tr
                    key={shop.id}
                    className={`cursor-pointer border-b border-stone-100/80 transition-all duration-150 hover:bg-stone-50/60 ${selectedShop.id === shop.id ? "bg-orange-50/30" : ""}`}
                    onClick={() => setSelectedShopId(shop.id)}
                  >
                    <td className="p-3.5 text-[13px] text-stone-600 align-middle text-center font-bold">#{shop.id}</td>
                    <td className="p-3.5 text-[13px] text-stone-800 align-middle">
                      <div className="flex items-center gap-3">
                        <img src={shop.avatarUrl} alt={shop.name} className={`w-9 h-9 rounded-full object-cover border-[1.5px] ${selectedShop.id === shop.id ? "border-[#c85a28]" : "border-stone-200"}`} />
                        <span className="font-extrabold text-stone-900">{shop.name}</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-[13px] text-stone-600 align-middle font-bold">{shop.sellerName}</td>
                    <td className="p-3.5 text-[13px] text-stone-600 align-middle">{shop.createdDate || "Chưa rõ"}</td>
                    <td className="p-3.5 text-[13px] text-stone-800 align-middle text-center">
                      <span className="bg-amber-50 text-amber-700 p-[3px_8px] rounded-lg text-xs font-bold inline-block border border-amber-100">
                        <span className="flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {shop.ratingAvg}</span>
                      </span>
                    </td>
                    <td className="p-3.5 border-b border-stone-100/80 align-middle text-center font-bold text-stone-850">
                      {shop.totalProducts}
                    </td>
                    <td className="p-3.5 text-[13px] text-stone-800 align-middle text-center">
                      <span className={`inline-block p-[3px_8px] rounded-lg text-xs font-extrabold ${shop.warningStrikes > 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                        {shop.warningStrikes}/5
                      </span>
                    </td>
                    <td className="p-3.5 text-[13px] text-stone-800 align-middle text-center">
                      {shop.isVerified ? (
                        <span className="bg-blue-50 text-blue-650 p-[3.5px_8px] rounded-lg text-[10px] font-bold border border-blue-100 inline-flex items-center gap-1" title="Đã xác thực">
                          <CheckCircle className="w-3 h-3 text-blue-600 fill-white" /> Tích xanh
                        </span>
                      ) : (
                        <span className="text-stone-400 font-medium">Chưa</span>
                      )}
                    </td>
                    <td className="p-3.5 text-[13px] text-stone-800 align-middle text-center">
                      <span className={`inline-flex items-center py-1 px-3.5 rounded-full text-[11px] font-bold uppercase ${shop.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                        {shop.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-4 text-xs">
              <span className="text-stone-500 font-medium">
                Hiển thị {indexOfFirstShop + 1} - {Math.min(indexOfLastShop, filteredShops.length)} của {filteredShops.length} cửa hàng
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white text-stone-600 text-xs font-bold"
                >
                  Trước
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 border rounded-lg cursor-pointer font-bold text-xs ${
                      currentPage === i + 1
                        ? "bg-[#c85a28] border-[#c85a28] text-white"
                        : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-1.5 border border-stone-200 rounded-lg hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-white text-stone-600 text-xs font-bold"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Moderation Action Control Panel */}
        <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-[0_8px_30px_rgb(238,229,219,0.2)] flex flex-col gap-5 h-fit">
          <div className="flex items-center gap-4 border-b border-dashed border-stone-100 pb-5">
            <img src={selectedShop.avatarUrl} alt={selectedShop.name} className="w-[52px] h-[52px] rounded-full object-cover border-2 border-[#c85a28] shadow-sm" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-stone-900 m-0">{selectedShop.name}</h3>
                {selectedShop.isVerified && (
                  <span className="bg-blue-50 text-blue-600 text-[10px] font-bold p-[2px_6px] rounded border border-blue-100 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5 text-blue-650" /> Verified
                  </span>
                )}
              </div>
              <p className="text-[13px] text-stone-500 m-0">Chủ cửa hàng: <strong className="text-stone-700">{selectedShop.sellerName}</strong></p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {/* Description Card */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[11px] font-bold text-stone-400 tracking-wider uppercase m-0">Mô tả Cửa hàng</h4>
              <p className="text-[13px] leading-relaxed text-stone-600 italic m-0 bg-stone-50/50 border border-stone-100 rounded-xl p-[10px_14px]">“{selectedShop.description || "Chưa cập nhật mô tả..."}”</p>
            </div>

            {/* Violation & Strike Status */}
            <div className="flex flex-col gap-3 bg-amber-50/30 border border-amber-100 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1.5">
                <h4 className="text-[11px] font-bold text-stone-500 tracking-wider uppercase m-0">Hồ sơ Vi phạm & Báo cáo</h4>
                <span className={`text-xs font-bold ${selectedShop.warningStrikes >= 3 ? "text-rose-600" : "text-amber-700"}`}>
                  Lỗi: {selectedShop.warningStrikes} / 5 strikes
                </span>
              </div>

              {/* Graphical strike meter */}
              <div className="flex gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`flex-1 h-1.5 rounded-full bg-stone-200 transition-all ${lvl <= selectedShop.warningStrikes ? "bg-rose-500 shadow-sm" : ""}`}
                  ></div>
                ))}
              </div>

              <div className="border-t border-dashed border-amber-100 pt-3 flex flex-col gap-2.5">
                <span className="text-[13px] text-amber-800 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Có <strong>{selectedShop.reportsCount} báo cáo vi phạm</strong> từ người dùng.</span>
                </span>
                {selectedShop.latestReportReason && (
                  <div className="bg-white rounded-lg p-[10px_12px] text-xs text-stone-700 leading-relaxed border border-amber-100/50">
                    <strong className="text-stone-500">Nội dung báo cáo gần nhất:</strong>
                    <p className="m-0 mt-1 text-rose-600 italic">“{selectedShop.latestReportReason}”</p>
                  </div>
                )}
              </div>
            </div>

            {/* Penalty & Complaint History */}
            <div className="flex flex-col gap-3 border border-stone-200/60 rounded-xl p-4 bg-stone-50/50">
              <h4 className="text-[11px] font-bold text-stone-500 tracking-wider uppercase m-0 flex items-center justify-between">
                <span>Lịch sử khiếu nại & xử phạt</span>
                <span className="bg-stone-200 text-stone-600 px-2 py-0.5 rounded text-[10px]">
                  {shopComplaints.length} bản ghi
                </span>
              </h4>
              
              <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {shopComplaints.length === 0 ? (
                  <p className="text-xs text-stone-400 italic m-0 text-center py-4">Chưa có lịch sử khiếu nại hoặc xử phạt nào cho shop này.</p>
                ) : (
                  shopComplaints.map((c) => (
                    <div key={c.id} className="bg-white border border-stone-200/50 rounded-lg p-3 flex flex-col gap-1.5 shadow-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-extrabold text-stone-850 truncate max-w-[160px]">
                          {c.title}
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                          c.status === "RESOLVED" ? "bg-emerald-50 text-emerald-700" :
                          c.status === "REJECTED" ? "bg-stone-100 text-stone-500" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {c.status === "RESOLVED" ? "Đã xử lý" : c.status === "REJECTED" ? "Đã từ chối" : "Chờ xử lý"}
                        </span>
                      </div>
                      
                      {c.content && (
                        <p className="text-[11px] text-stone-500 line-clamp-2 m-0 leading-relaxed">
                          {c.content}
                        </p>
                      )}
                      
                      {c.resolution && (
                        <div className="text-[10px] bg-stone-50 border-l-2 border-[#c85a28] pl-2 py-1 mt-1 text-stone-650 italic">
                          <strong>Kết quả:</strong> {c.resolution}
                        </div>
                      )}
                      
                      <span className="text-[9px] text-stone-400 mt-0.5 self-end">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN") : "Hôm nay"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Chế tài/Moderation Actions bar */}
            <div className="flex flex-col gap-3.5 border-t border-stone-100 pt-5">
              <h4 className="text-[11px] font-bold text-stone-400 tracking-wider uppercase m-0">Áp dụng Chế tài Admin</h4>
              
              <div className="grid grid-cols-1 gap-2.5">
                {/* Verify / Unverify */}
                <button
                  className={`rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none ${selectedShop.isVerified ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                  onClick={() => handleToggleVerify(selectedShop.id)}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{selectedShop.isVerified ? "Thu hồi Tích xanh" : "Cấp Tích xanh Uy tín"}</span>
                </button>

                {/* Strike punishment */}
                <button
                  className="rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-amber-600 border-none text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleAddStrike(selectedShop.id)}
                  disabled={selectedShop.warningStrikes >= 5}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Phạt 1 điểm Warning Strike</span>
                </button>

                {/* Lock / Unlock */}
                <button
                  className={`rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 border-none text-white ${selectedShop.isActive ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
                  onClick={() => handleToggleActive(selectedShop.id)}
                >
                  {selectedShop.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  <span>{selectedShop.isActive ? "Khóa Cửa Hàng" : "Mở Khóa Hoạt Động"}</span>
                </button>

                {/* Reset Warning Strikes */}
                <button
                  className="rounded-xl py-2.5 px-4 text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-1.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleResetStrikes(selectedShop.id)}
                  disabled={selectedShop.warningStrikes === 0}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Xóa toàn bộ điểm phạt</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmResetShopId !== null}
        onClose={() => setConfirmResetShopId(null)}
        onConfirm={() => {
          if (!confirmResetShopId) return;
          shopService.resetStrikes(confirmResetShopId)
            .then(() => {
              toastService.success("Đã xóa tất cả điểm phạt thành công!");
              fetchShops();
            })
            .catch((err) => toastService.error("Thao tác thất bại: " + err.message));
        }}
        title="Xóa điểm phạt"
        message={`Bạn có chắc chắn muốn xóa tất cả điểm phạt cảnh cáo của shop "${shops.find(s => s.id === confirmResetShopId)?.name || ""}"?`}
        confirmText="Xóa điểm phạt"
        cancelText="Hủy"
        type="warning"
      />
    </div>
  );
}
