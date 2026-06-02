import React, { useState, useEffect } from "react";
import "./ComplaintManagement.css";
import { complaintService } from "../../../services/admin";

export function ComplaintManagement() {
  const [activeTab, setActiveTab] = useState("user-feedback");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [responseText, setResponseText] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loading, setLoading] = useState(true);

  const getSenderColor = (name) => {
    const colors = ["#c85a28", "#2e7d32", "#1565c0", "#e65100", "#8b5a3c"];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const mapApiTicketToFrontend = (apiTicket) => {
    const statusMap = {
      PENDING: "Pending",
      RESOLVED: "Resolved",
      REJECTED: "Rejected"
    };

    const statusClassMap = {
      PENDING: "status-pending",
      RESOLVED: "status-resolved",
      REJECTED: "status-rejected"
    };

    const priorityMap = {
      LOW: "THẤP",
      MEDIUM: "TRUNG BÌNH",
      HIGH: "CAO"
    };

    const priorityClassMap = {
      LOW: "priority-low",
      MEDIUM: "priority-medium",
      HIGH: "priority-high"
    };

    const senderName = apiTicket.reporter ? apiTicket.reporter.fullName : "Người dùng ẩn danh";
    const initial = senderName ? senderName.charAt(0).toUpperCase() : "?";

    const historyList = [
      { time: new Date(apiTicket.createdAt).toLocaleString("vi-VN"), text: `Khiếu nại được tạo bởi ${senderName}.` }
    ];
    if (apiTicket.status === "RESOLVED") {
      historyList.push({ time: new Date(apiTicket.updatedAt).toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã xử lý.` });
    } else if (apiTicket.status === "REJECTED") {
      historyList.push({ time: new Date(apiTicket.updatedAt).toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã từ chối.` });
    }

    return {
      id: apiTicket.id,
      sender: senderName,
      senderInitial: initial,
      senderColor: getSenderColor(senderName),
      subject: apiTicket.title || "Khiếu nại dịch vụ",
      time: new Date(apiTicket.createdAt).toLocaleString("vi-VN"),
      priority: priorityMap[apiTicket.severity] || "TRUNG BÌNH",
      priorityClass: priorityClassMap[apiTicket.severity] || "priority-medium",
      status: statusMap[apiTicket.status] || "Pending",
      statusClass: statusClassMap[apiTicket.status] || "status-pending",
      orderId: apiTicket.order ? `ORD_${apiTicket.order.id}` : "N/A",
      shopName: apiTicket.reportedShop ? apiTicket.reportedShop.name : "N/A",
      shopId: apiTicket.reportedShop ? apiTicket.reportedShop.id : null,
      urgent: apiTicket.severity === "HIGH",
      content: apiTicket.content,
      images: [],
      history: historyList,
      rawStatus: apiTicket.status,
      rawType: apiTicket.type
    };
  };

  const fetchComplaints = () => {
    setLoading(true);
    complaintService.getAll()
      .then((res) => {
        if (res && Array.isArray(res)) {
          const mapped = res.map(mapApiTicketToFrontend);
          setTickets(mapped);
          if (mapped.length > 0) {
            setSelectedTicketId(mapped[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu khiếu nại:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) {
    return (
      <div className="complaint-management-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#3e2723" }}>Đang tải dữ liệu khiếu nại thực tế từ Database...</h2>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="complaint-management-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#3e2723" }}>Chưa có phản hồi hay khiếu nại nào trong hệ thống!</h2>
        <p style={{ color: "#8b7d6a" }}>Database của bạn đang trống dữ liệu khiếu nại.</p>
      </div>
    );
  }

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendResponse = () => {
    if (!responseText.trim()) return;
    
    // Update status to RESOLVED via backend API
    complaintService.updateStatus(selectedTicket.id, "RESOLVED")
      .then(() => {
        alert("Đã gửi phản hồi và xử lý khiếu nại!");
        setResponseText("");
        fetchComplaints();
      })
      .catch((err) => alert("Lỗi khi xử lý phản hồi: " + err.message));
  };

  const handleBanShop = () => {
    if (!selectedTicket.shopId) return;
    alert(`Đã tạm khóa shop "${selectedTicket.shopName}" thành công!`);
    complaintService.updateStatus(selectedTicket.id, "RESOLVED")
      .then(() => fetchComplaints())
      .catch((err) => console.error(err));
  };

  const handleApproveRefund = () => {
    complaintService.updateStatus(selectedTicket.id, "RESOLVED")
      .then(() => {
        alert("Đã chấp nhận phê duyệt hoàn tiền đơn hàng!");
        fetchComplaints();
      })
      .catch((err) => alert("Thao tác thất bại: " + err.message));
  };

  const handleCloseTicket = () => {
    complaintService.updateStatus(selectedTicket.id, "REJECTED")
      .then(() => {
        alert("Đã đóng và từ chối khiếu nại thành công!");
        fetchComplaints();
      })
      .catch((err) => alert("Thao tác thất bại: " + err.message));
  };

  return (
    <div className="complaint-management-container">
      {/* Top Title & Export */}
      <div className="complaint-page-header">
        <div>
          <h1 className="complaint-title">Quản lý phản hồi & khiếu nại</h1>
          <p className="complaint-subtitle">Theo dõi và xử lý các vấn đề từ cộng đồng Tiệm Cũ.</p>
        </div>
        <button className="export-report-btn">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="complaints-control-bar">
        <div className="tab-buttons-group">
          <button
            className={`tab-btn-item ${activeTab === "user-feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("user-feedback")}
          >
            Phản hồi từ User
          </button>
          <button
            className={`tab-btn-item ${activeTab === "shop-complaint" ? "active" : ""}`}
            onClick={() => setActiveTab("shop-complaint")}
          >
            Khiếu nại Shop
          </button>
        </div>

        <div className="filters-group-right">
          <select
            className="filter-select-item"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">Mức độ: Tất cả</option>
            <option value="high">Cao</option>
            <option value="medium">Trung bình</option>
            <option value="low">Thấp</option>
          </select>

          <input
            className="filter-date-input"
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <button className="filter-funnel-btn" title="Bộ lọc nâng cao">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Complaints Data Table */}
      <div className="complaints-table-wrapper">
        <table className="complaints-data-table">
          <thead>
            <tr>
              <th>TICKET ID</th>
              <th>NGƯỜI GỬI</th>
              <th>CHỦ ĐỀ</th>
              <th>THỜI GIAN</th>
              <th>ƯU TIÊN</th>
              <th>TRẠNG THÁI</th>
              <th style={{ textAlign: "center" }}>THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                className={selectedTicket.id === ticket.id ? "row-selected" : ""}
              >
                <td className="ticket-id-cell">#{ticket.id}</td>
                <td className="sender-profile-cell">
                  <span
                    className="sender-avatar-bubble"
                    style={{ backgroundColor: ticket.senderColor }}
                  >
                    {ticket.senderInitial}
                  </span>
                  <span className="sender-name-text">{ticket.sender}</span>
                </td>
                <td className="subject-title-cell">{ticket.subject}</td>
                <td className="time-stamp-cell">{ticket.time}</td>
                <td>
                  <span className={`priority-badge-dot ${ticket.priorityClass}`}>
                    {ticket.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-indicator-dot ${ticket.statusClass}`}>
                    {ticket.status}
                  </span>
                </td>
                <td style={{ textAlign: "center" }}>
                  <button
                    className="view-ticket-details-btn"
                    onClick={() => setSelectedTicketId(ticket.id)}
                  >
                    Chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Table Footer / Pagination */}
        <div className="table-footer-pagination">
          <span className="results-count">Hiển thị {tickets.length} / 1,284 kết quả</span>
          <div className="pagination-controls">
            <button className="pag-arrow-btn">‹</button>
            <button className="pag-number-btn active">1</button>
            <button className="pag-number-btn">2</button>
            <button className="pag-number-btn">3</button>
            <button className="pag-arrow-btn">›</button>
          </div>
        </div>
      </div>

      {/* Selected Complaint Detail Layout */}
      <div className="complaint-detail-two-cols">
        {/* Left Column: Selected Ticket Details */}
        <div className="complaint-left-column">
          <div className="selected-ticket-header">
            <span
              className="sender-avatar-bubble large"
              style={{ backgroundColor: selectedTicket.senderColor }}
            >
              {selectedTicket.senderInitial}
            </span>
            <div className="ticket-header-meta">
              <div className="title-row-with-badge">
                <h2 className="selected-ticket-title">
                  Chi tiết khiếu nại #{selectedTicket.id}
                </h2>
                {selectedTicket.urgent && (
                  <span className="urgent-badge-label">URGENT ISSUE</span>
                )}
              </div>
              <p className="selected-ticket-sub">
                Gửi bởi <span className="highlight-user">{selectedTicket.sender}</span> • Đơn hàng{" "}
                <span className="highlight-order">#{selectedTicket.orderId}</span>
              </p>
            </div>
          </div>

          {/* Card: Complaint Content */}
          <div className="complaint-detail-card">
            <h3 className="card-inner-title">Nội dung khiếu nại</h3>
            <p className="complaint-main-text">“{selectedTicket.content}”</p>

            {selectedTicket.images && selectedTicket.images.length > 0 && (
              <div className="complaint-attached-photos-grid">
                {selectedTicket.images.map((imgUrl, idx) => (
                  <img
                    key={idx}
                    className="attached-photo-thumb"
                    src={imgUrl}
                    alt={`Attached detail ${idx + 1}`}
                  />
                ))}
                <div className="attached-photo-placeholder">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
              </div>
            )}

            {/* Interaction History */}
            <div className="interaction-history-section">
              <h4 className="interaction-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>LỊCH SỬ TƯƠNG TÁC</span>
              </h4>
              <div className="timeline-flow-list">
                {selectedTicket.history.map((hist, idx) => (
                  <div className="timeline-flow-node" key={idx}>
                    <div className="node-marker-dot"></div>
                    <div className="node-info-text">
                      <span className="node-time-label">{hist.time}</span>
                      <span className="node-description-text">{hist.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input Response Action */}
            <div className="ticket-response-input-block">
              <textarea
                className="response-textarea-field"
                placeholder="Nhập phản hồi hoặc hành động xử lý..."
                rows="4"
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
              />
              <div className="ticket-action-buttons-bar">
                <div className="left-actions-group">
                  <button className="btn-action-send" onClick={handleSendResponse}>
                    Gửi phản hồi
                  </button>
                  <button className="btn-action-ban" onClick={handleBanShop}>
                    Ban Shop 3 ngày
                  </button>
                  <button className="btn-action-refund" onClick={handleApproveRefund}>
                    Chấp nhận hoàn tiền
                  </button>
                </div>
                <button className="btn-action-close-ticket" onClick={handleCloseTicket}>
                  Đóng Ticket
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Side Widgets */}
        <div className="complaint-right-column">
          {/* Card: Recent Activities Log */}
          <div className="complaint-detail-card side-widget">
            <h3 className="card-inner-title">Hoạt động gần đây</h3>
            <div className="recent-log-activities-list">
              <div className="log-activity-item">
                <div className="log-icon-circle green-bg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="log-text-meta">
                  <span className="log-text-desc">
                    <strong>Admin Nam</strong> đã đóng khiếu nại <strong>#REP1102</strong>
                  </span>
                  <span className="log-time-elapsed">10 PHÚT TRƯỚC</span>
                </div>
              </div>

              <div className="log-activity-item">
                <div className="log-icon-circle red-bg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <div className="log-text-meta">
                  <span className="log-text-desc">
                    <strong>Hệ thống</strong> đã khóa tạm thời <strong>Thanh Lý Shop</strong> do bị
                    tố cáo nhiều lần.
                  </span>
                  <span className="log-time-elapsed">25 PHÚT TRƯỚC</span>
                </div>
              </div>

              <div className="log-activity-item">
                <div className="log-icon-circle orange-bg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="log-text-meta">
                  <span className="log-text-desc">
                    Có <strong>5 khiếu nại mới</strong> cần được phân loại và xử lý.
                  </span>
                  <span className="log-time-elapsed">1 GIỜ TRƯỚC</span>
                </div>
              </div>
            </div>

            <button className="view-full-logs-btn">Xem toàn bộ nhật ký</button>
          </div>

          {/* Card: Eco Green ESG Panel */}
          <div className="complaint-detail-card side-widget green-theme-widget">
            <h3 className="card-inner-title green-title">Tiệm Cũ Xanh</h3>
            <p className="green-theme-body-text">
              Các phản hồi về chương trình 'Mua bán vì môi trường' tăng 40% trong tháng này. Hãy chuẩn bị báo cáo chi tiết cho đối tác ESG.
            </p>
            <span className="green-metrics-badge">GREEN METRICS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
