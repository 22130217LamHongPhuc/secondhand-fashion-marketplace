import React, { useState, useEffect } from "react";
import "./ShopManagement.css";
import { shopService } from "../../../services/admin";

export function ShopManagement() {
  const [shops, setShops] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchShops = () => {
    setLoading(true);
    shopService.getAll()
      .then((res) => {
        if (res && Array.isArray(res)) {
          setShops(res);
          if (res.length > 0) {
            setSelectedShopId(res[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy danh sách shop:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchShops();
  }, []);

  if (loading) {
    return (
      <div className="shop-management-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#3e2723" }}>Đang tải danh sách cửa hàng thực tế từ Database...</h2>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="shop-management-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#3e2723" }}>Chưa có cửa hàng nào đăng ký trên hệ thống!</h2>
      </div>
    );
  }

  const selectedShop = shops.find((s) => s.id === selectedShopId) || shops[0] || {};

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

  // Action: Toggle Verify Tích xanh
  const handleToggleVerify = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    const nextState = !shop.isVerified;
    
    shopService.toggleVerify(id, nextState)
      .then(() => {
        alert(nextState ? `Đã cấp tích xanh xác thực (Verified) cho shop "${shop.name}"!` : `Đã thu hồi tích xanh của shop "${shop.name}"!`);
        fetchShops();
      })
      .catch((err) => alert("Thao tác thất bại: " + err.message));
  };

  // Action: Toggle Active status (Lock/Unlock)
  const handleToggleActive = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;
    const nextState = !shop.isActive;

    shopService.toggleActive(id, nextState)
      .then(() => {
        alert(nextState ? `Đã mở khóa hoạt động cho shop "${shop.name}"!` : `Đã tạm khóa hoạt động shop "${shop.name}"!`);
        fetchShops();
      })
      .catch((err) => alert("Thao tác thất bại: " + err.message));
  };

  // Action: Add Violation Strike
  const handleAddStrike = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;

    shopService.addStrike(id)
      .then((updatedShop) => {
        const nextStrikes = updatedShop.warningStrikes;
        let msg = `Đã phạt cảnh cáo thêm 1 điểm lỗi đối với shop "${shop.name}". (Tổng điểm lỗi hiện tại: ${nextStrikes}/5)`;
        if (nextStrikes >= 5) {
          msg += `\n⚠️ CỬA HÀNG ĐÃ ĐẠT MỨC TỐI ĐA 5 ĐIỂM LỖI! Hệ thống tự động khóa tài khoản shop vĩnh viễn.`;
        }
        alert(msg);
        fetchShops();
      })
      .catch((err) => alert("Thao tác thất bại: " + err.message));
  };

  // Action: Reset Strikes
  const handleResetStrikes = (id) => {
    const shop = shops.find((s) => s.id === id);
    if (!shop) return;

    if (window.confirm(`Bạn có chắc chắn muốn xóa tất cả điểm phạt cảnh cáo của shop "${shop.name}"?`)) {
      shopService.resetStrikes(id)
        .then(() => {
          alert("Đã xóa tất cả điểm phạt thành công!");
          fetchShops();
        })
        .catch((err) => alert("Thao tác thất bại: " + err.message));
    }
  };

  return (
    <div className="shop-management-container">
      {/* Page Header */}
      <div className="shop-page-header">
        <div>
          <h1 className="shop-title">Quản lý Cửa hàng & Chế tài</h1>
          <p className="shop-subtitle">
            Cấp tích xanh xác thực cửa hàng uy tín và áp dụng chế tài cảnh cáo/khóa các shop bán hàng giả, lừa đảo.
          </p>
        </div>
      </div>

      {/* Top statistics widgets */}
      <div className="shop-stats-grid">
        <div className="shop-stat-card">
          <div className="stat-icon-circle blue">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Tổng số Shop trên sàn</span>
            <span className="stat-value">{totalShops} cửa hàng</span>
          </div>
        </div>

        <div className="shop-stat-card">
          <div className="stat-icon-circle green">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Cửa hàng có Tích Xanh</span>
            <span className="stat-value">{verifiedShopsCount} shop uy tín</span>
          </div>
        </div>

        <div className="shop-stat-card">
          <div className="stat-icon-circle red">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Shop đang bị tạm Khóa</span>
            <span className="stat-value">{lockedShopsCount} cửa hàng</span>
          </div>
        </div>

        <div className="shop-stat-card">
          <div className="stat-icon-circle orange">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div className="stat-content">
            <span className="stat-label">Tổng số Warning Strikes phạt</span>
            <span className="stat-value">{totalStrikes} điểm lỗi</span>
          </div>
        </div>
      </div>

      {/* Control Bar (Filters and Search) */}
      <div className="shops-control-bar">
        <div className="filter-tabs-group">
          <button
            className={`filter-tab-item ${filterType === "all" ? "active" : ""}`}
            onClick={() => setFilterType("all")}
          >
            Tất cả cửa hàng
          </button>
          <button
            className={`filter-tab-item ${filterType === "verified" ? "active" : ""}`}
            onClick={() => setFilterType("verified")}
          >
            Shop Tích Xanh
          </button>
          <button
            className={`filter-tab-item ${filterType === "warning" ? "active" : ""}`}
            onClick={() => setFilterType("warning")}
          >
            Shop có Điểm vi phạm
          </button>
          <button
            className={`filter-tab-item ${filterType === "locked" ? "active" : ""}`}
            onClick={() => setFilterType("locked")}
          >
            Cửa hàng bị Khóa
          </button>
        </div>

        <div className="search-box-wrapper">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            placeholder="Tìm kiếm shop, chủ shop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Two Columns Table & Moderation Grid */}
      <div className="shops-two-cols-layout">
        {/* Left Column: Shops List Table */}
        <div className="shops-list-panel">
          <div className="panel-inner-wrapper">
            <table className="shops-data-table">
              <thead>
                <tr>
                  <th>TÊN CỬA HÀNG</th>
                  <th>CHỦ SHOP</th>
                  <th style={{ textAlign: "center" }}>ĐÁNH GIÁ (SAO)</th>
                  <th style={{ textAlign: "center" }}>SẢN PHẨM</th>
                  <th style={{ textAlign: "center" }}>STRIKES</th>
                  <th style={{ textAlign: "center" }}>TÍCH XANH</th>
                  <th style={{ textAlign: "center" }}>TRẠNG THÁI</th>
                </tr>
              </thead>
              <tbody>
                {filteredShops.map((shop) => (
                  <tr
                    key={shop.id}
                    className={`shop-row-item ${selectedShop.id === shop.id ? "selected" : ""}`}
                    onClick={() => setSelectedShopId(shop.id)}
                  >
                    <td>
                      <div className="shop-profile-cell">
                        <img src={shop.avatarUrl} alt={shop.name} className="shop-avatar-thumb" />
                        <div className="shop-name-block">
                          <span className="shop-name-txt">{shop.name}</span>
                          <span className="shop-date-txt">Tham gia: {shop.createdDate}</span>
                        </div>
                      </div>
                    </td>
                    <td className="owner-name-cell">{shop.sellerName}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className="rating-star-badge">⭐ {shop.ratingAvg}</span>
                    </td>
                    <td style={{ textAlign: "center" }} className="products-count-cell">
                      {shop.totalProducts}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`strikes-badge ${shop.warningStrikes > 0 ? "has-strikes" : "clean"}`}>
                        {shop.warningStrikes}/5
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {shop.isVerified ? (
                        <span className="verified-badge-check" title="Đã xác thực">✔️ Tích xanh</span>
                      ) : (
                        <span className="unverified-badge-check">Chưa</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`status-pill ${shop.isActive ? "active" : "blocked"}`}>
                        {shop.isActive ? "Hoạt động" : "Bị khóa"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Moderation Action Control Panel */}
        <div className="moderation-controls-panel">
          <div className="shop-details-header">
            <img src={selectedShop.avatarUrl} alt={selectedShop.name} className="moderation-shop-avatar" />
            <div className="moderation-title-block">
              <div className="shop-title-row">
                <h3 className="moderation-shop-name">{selectedShop.name}</h3>
                {selectedShop.isVerified && <span className="verified-sparkle">👑 Verified</span>}
              </div>
              <p className="moderation-shop-owner">Chủ cửa hàng: <strong>{selectedShop.sellerName}</strong></p>
            </div>
          </div>

          <div className="moderation-body">
            {/* Description Card */}
            <div className="mod-info-card">
              <h4 className="mod-card-title">Mô tả Cửa hàng</h4>
              <p className="mod-desc-text">“{selectedShop.description}”</p>
            </div>

            {/* Violation & Strike Status */}
            <div className="mod-info-card strike-warning-box">
              <div className="strike-level-row">
                <h4 className="mod-card-title">Hồ sơ Vi phạm & Báo cáo</h4>
                <span className={`strike-status-text ${selectedShop.warningStrikes >= 3 ? "danger" : "warning"}`}>
                  Điểm lỗi: {selectedShop.warningStrikes} / 5 strikes
                </span>
              </div>

              {/* Graphical strike meter */}
              <div className="strike-meter-bar">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`strike-dot ${lvl <= selectedShop.warningStrikes ? "filled" : ""}`}
                  ></div>
                ))}
              </div>

              <div className="latest-report-block">
                <span className="report-count-label">🚨 Có <strong>{selectedShop.reportsCount} báo cáo vi phạm</strong> từ người dùng.</span>
                <div className="report-reason-bubble">
                  <strong>Nội dung báo cáo gần nhất:</strong>
                  <p className="reason-txt">“{selectedShop.latestReportReason}”</p>
                </div>
              </div>
            </div>

            {/* Quick Chế tài/Moderation Actions bar */}
            <div className="quick-actions-card">
              <h4 className="mod-card-title">Áp dụng Chế tài Admin</h4>
              
              <div className="mod-actions-buttons-grid">
                {/* Verify / Unverify */}
                <button
                  className={`btn-mod-action ${selectedShop.isVerified ? "danger-outline" : "success-outline"}`}
                  onClick={() => handleToggleVerify(selectedShop.id)}
                >
                  {selectedShop.isVerified ? "Thu hồi Tích xanh" : "Cấp Tích xanh Uy tín"}
                </button>

                {/* Strike punishment */}
                <button
                  className="btn-mod-action warning-solid"
                  onClick={() => handleAddStrike(selectedShop.id)}
                  disabled={selectedShop.warningStrikes >= 5}
                >
                  Phạt 1 điểm Warning Strike
                </button>

                {/* Lock / Unlock */}
                <button
                  className={`btn-mod-action ${selectedShop.isActive ? "danger-solid" : "success-solid"}`}
                  onClick={() => handleToggleActive(selectedShop.id)}
                >
                  {selectedShop.isActive ? "Khóa Cửa Hàng" : "Mở Khóa Hoạt Động"}
                </button>

                {/* Reset Warning Strikes */}
                <button
                  className="btn-mod-action neutral-outline"
                  onClick={() => handleResetStrikes(selectedShop.id)}
                  disabled={selectedShop.warningStrikes === 0}
                >
                  Xóa toàn bộ điểm phạt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
