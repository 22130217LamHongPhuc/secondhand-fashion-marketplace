import { useEffect, useState } from "react";
import { campaignService } from "@/services/admin";
import "./CampaignManagement.css";

export function CampaignManagement() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);

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
      alert("Cập nhật trạng thái thành công!");
      loadCampaigns();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chiến dịch này không?")) {
      try {
        await campaignService.delete(id);
        alert("Xóa chiến dịch thành công!");
        loadCampaigns();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
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
      // Reload product list
      const res = await campaignService.getProducts(selectedCampaign.id);
      const rawData = res?.data || res;
      setRegisteredProducts(Array.isArray(rawData) ? rawData : []);
    } catch (err) {
      alert("Lỗi cập nhật: " + err.message);
    }
  };

  // General statistics
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.isActive).length;
  const upcomingCampaigns = campaigns.filter(c => new Date(c.startDate) > new Date()).length;

  return (
    <div className="campaign-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản lý chiến dịch Sale</h1>
          <p className="page-subtitle">Tạo các ngày hội mua sắm đồ cũ đồng giá, flash sale và duyệt sản phẩm từ các shop</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            + Chiến dịch mới
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TỔNG SỐ CHIẾN DỊCH</div>
          <div className="stat-row">
            <div className="stat-number">{totalCampaigns}</div>
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ĐANG DIỄN RA</div>
          <div className="stat-row">
            <div className="stat-number">{activeCampaigns}</div>
            <div className="stat-icon active">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">SẮP DIỄN RA</div>
          <div className="stat-row">
            <div className="stat-number">{upcomingCampaigns}</div>
            <div className="stat-icon upcoming">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="campaigns-section">
        {loading ? (
          <div className="loading">Đang tải dữ liệu chiến dịch...</div>
        ) : error ? (
          <div className="error">Lỗi kết nối: {error}</div>
        ) : campaigns.length > 0 ? (
          <div className="campaign-cards-grid">
            {campaigns.map((campaign) => {
              const isExpired = new Date(campaign.endDate) < new Date();
              const isStarted = new Date(campaign.startDate) <= new Date() && !isExpired;

              return (
                <div key={campaign.id} className="campaign-card">
                  {campaign.bannerUrl && (
                    <div className="campaign-banner">
                      <img src={campaign.bannerUrl} alt={campaign.name} />
                    </div>
                  )}
                  <div className="campaign-body">
                    <div className="campaign-badge-row">
                      <span className={`status-tag ${campaign.isActive ? "active" : "inactive"}`}>
                        {campaign.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                      <span className={`time-tag ${isExpired ? "expired" : isStarted ? "started" : "upcoming"}`}>
                        {isExpired ? "Đã kết thúc" : isStarted ? "Đang chạy" : "Chờ bắt đầu"}
                      </span>
                      <span className={`save-tag ${campaign.isAutoSave ? "auto" : "manual"}`}>
                        {campaign.isAutoSave ? "⚡ Tự động" : "🔑 Thủ công"}
                      </span>
                    </div>
                    <h3 className="campaign-name-title">{campaign.name}</h3>
                    <p className="campaign-description-text">{campaign.description || "Chưa có mô tả chi tiết."}</p>
                    
                    <div className="campaign-dates-box">
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        <strong>Bắt đầu:</strong> {new Date(campaign.startDate).toLocaleString("vi-VN")}
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "inline-block", marginRight: "4px", verticalAlign: "middle" }}><path d="M5 2h14"/><path d="M5 22h14"/><path d="M19 2v4c0 4-3 7-7 7s-7-3-7-7V2"/><path d="M5 22v-4c0-4 3-7 7-7s7 3 7 7v4"/></svg>
                        <strong>Kết thúc:</strong> {new Date(campaign.endDate).toLocaleString("vi-VN")}
                      </div>
                    </div>

                    <div className="campaign-actions-footer">
                      <button className="btn btn-secondary btn-full" onClick={() => handleViewProducts(campaign)}>
                        📋 Duyệt sản phẩm
                      </button>
                      <div className="small-actions">
                        <button
                          className="btn-icon"
                          onClick={() => handleToggleActive(campaign.id, campaign.isActive)}
                          title={campaign.isActive ? "Tạm ngưng" : "Kích hoạt"}
                        >
                          {campaign.isActive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="14" y="4" width="4" height="16" rx="1"/><rect x="6" y="4" width="4" height="16" rx="1"/></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                          )}
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => handleOpenEdit(campaign)}
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                        </button>
                        <button
                          className="btn-icon danger"
                          onClick={() => handleDelete(campaign.id)}
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">Chưa có chiến dịch mua sắm nào được tạo trên sàn.</div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingCampaign ? "Chỉnh sửa chiến dịch" : "Tạo chiến dịch mới"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="campaign-form">
              <div className="form-group">
                <label>Tên chiến dịch <span className="required">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Xả tủ Vintage Đồng giá 99K"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Mô tả chiến dịch</label>
                <textarea
                  placeholder="Nhập mô tả chiến dịch, thể lệ tham gia cho các shop..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Ảnh bìa Banner (URL)</label>
                <input
                  type="text"
                  placeholder="Link ảnh minh họa banner..."
                  value={formData.bannerUrl}
                  onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Cách lưu/Áp dụng chiến dịch <span className="required">*</span></label>
                <select
                  value={formData.isAutoSave ? "AUTO" : "MANUAL"}
                  onChange={(e) => setFormData({ ...formData, isAutoSave: e.target.value === "AUTO" })}
                  className="w-full p-2 border border-[#e8dfd5] rounded"
                >
                  <option value="MANUAL">🔑 Thủ công (Người dùng tự bấm tham gia/lưu)</option>
                  <option value="AUTO">⚡ Tự động (Hệ thống tự động lưu/áp dụng)</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Thời gian bắt đầu <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Thời gian kết thúc <span className="required">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Hủy bỏ
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCampaign ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Moderation products Modal */}
      {showProductsModal && selectedCampaign && (
        <div className="modal-overlay" onClick={() => setShowProductsModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Duyệt sản phẩm tham gia</h2>
                <p className="campaign-sub">{selectedCampaign.name}</p>
              </div>
              <button className="close-btn" onClick={() => setShowProductsModal(false)}>×</button>
            </div>
            
            <div className="products-moderation-body">
              {loadingProducts ? (
                <div className="loading">Đang tải danh sách sản phẩm đăng ký...</div>
              ) : registeredProducts.length > 0 ? (
                <table className="moderation-table">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Cửa hàng</th>
                      <th>Giá gốc</th>
                      <th>Giá sale đề xuất</th>
                      <th>Trạng thái duyệt</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registeredProducts.map((reg) => (
                      <tr key={reg.id || `${reg.campaignId}-${reg.productId}`}>
                        <td className="product-info-cell">
                          <div className="product-meta">
                            <span className="product-title">{reg.productName || `ID: ${reg.productId}`}</span>
                          </div>
                        </td>
                        <td>{reg.shopName || "Cửa hàng"}</td>
                        <td>{reg.originalPrice ? `${reg.originalPrice.toLocaleString("vi-VN")} đ` : "-"}</td>
                        <td className="sale-price-cell">{reg.campaignPrice.toLocaleString("vi-VN")} đ</td>
                        <td>
                          <span className={`status-badge ${reg.status.toLowerCase()}`}>
                            {reg.status === "PENDING" ? "Chờ duyệt" : reg.status === "APPROVED" ? "Đã duyệt" : "Từ chối"}
                          </span>
                        </td>
                        <td>
                          <div className="moderation-actions">
                            {reg.status === "PENDING" && (
                              <>
                                <button className="btn btn-success-sm" onClick={() => handleUpdateProductStatus(reg.productId, "APPROVED")}>
                                  Duyệt
                                </button>
                                <button className="btn btn-danger-sm" onClick={() => handleUpdateProductStatus(reg.productId, "REJECTED")}>
                                  Từ chối
                                </button>
                              </>
                            )}
                            {reg.status === "APPROVED" && (
                              <button className="btn btn-danger-sm" onClick={() => handleUpdateProductStatus(reg.productId, "REJECTED")}>
                                Hủy duyệt
                              </button>
                            )}
                            {reg.status === "REJECTED" && (
                              <button className="btn btn-success-sm" onClick={() => handleUpdateProductStatus(reg.productId, "APPROVED")}>
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
                <div className="empty-state">Chưa có cửa hàng nào đăng ký sản phẩm tham gia chiến dịch này.</div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowProductsModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
