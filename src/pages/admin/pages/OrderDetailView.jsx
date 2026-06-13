import React from "react";
import "./OrderDetailView.css";

export function OrderDetailView({ order, onBack, onUpdateStatus, onCancelOrder }) {
  // Map raw status to user-friendly Vietnamese labels and colors
  const getStatusDetails = (status) => {
    const s = (status || "pending").toLowerCase();
    switch (s) {
      case "pending":
        return { label: "Chờ xác nhận", class: "status-pending", icon: "📋" };
      case "confirmed":
        return { label: "Đã xác nhận", class: "status-confirmed", icon: "✅" };
      case "shipping":
      case "shipped":
        return { label: "Đang giao hàng", class: "status-shipping", icon: "🚚" };
      case "done":
      case "delivered":
        return { label: "Hoàn thành", class: "status-delivered", icon: "🎉" };
      case "cancelled":
        return { label: "Đã hủy", class: "status-cancelled", icon: "🚫" };
      default:
        return { label: status, class: "status-pending", icon: "📋" };
    }
  };

  const statusInfo = getStatusDetails(order.status);

  // Dynamic timelines based on current status
  const getTimeline = () => {
    const s = (order.status || "pending").toLowerCase();
    const createdTime = order.createdAt
      ? new Date(order.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "14:25";
    const createdDate = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString("vi-VN")
      : "Hôm nay";

    const baseEvents = [
      { title: "Khách đặt hàng", time: `${createdDate}, ${createdTime}`, active: true }
    ];

    if (s === "pending") {
      return [
        { title: "Chờ xác nhận", time: "Hôm nay, 14:30", active: true, current: true },
        ...baseEvents
      ];
    } else if (s === "confirmed") {
      return [
        { title: "Đã xác nhận", time: "Hôm nay, 15:00", active: true, current: true },
        ...baseEvents
      ];
    } else if (s === "shipping" || s === "shipped") {
      return [
        { title: "Đang giao hàng", time: "Hôm nay, 16:30", active: true, current: true },
        { title: "Đã xác nhận", time: "Hôm nay, 15:00", active: true },
        ...baseEvents
      ];
    } else if (s === "done" || s === "delivered") {
      return [
        { title: "Hoàn thành", time: "Hôm nay, 18:00", active: true, current: true },
        { title: "Đang giao hàng", time: "Hôm nay, 16:30", active: true },
        { title: "Đã xác nhận", time: "Hôm nay, 15:00", active: true },
        ...baseEvents
      ];
    } else if (s === "cancelled") {
      return [
        { title: "Đã hủy đơn", time: "Hôm nay, 15:00", active: true, current: true, danger: true },
        ...baseEvents
      ];
    }
    return baseEvents;
  };

  const timelineEvents = getTimeline();

  // Price formatting helper
  const formatPrice = (price) => {
    return (price || 0).toLocaleString("vi-VN") + " ₫";
  };

  // Safe fallback values
  const subtotal = order.subtotal || order.total || 0;
  const shipping = order.shipping || 30000;
  const discount = order.discount || 50000;
  const total = order.total || (subtotal + shipping - discount);

  return (
    <div className="order-detail-view-container">
      {/* Header with back button */}
      <div className="detail-header-row">
        <button className="back-to-list-btn" type="button" onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onBack();
        }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Chi tiết đơn hàng #ORD-2026-{order.id || "000"}</span>
        </button>
      </div>

      {/* Action and status bar */}
      <div className="status-banner-card">
        <div className="banner-left">
          <span className="banner-label">TRẠNG THÁI HIỆN TẠI</span>
          <span className={`banner-status-badge ${statusInfo.class}`}>
            <span className="badge-icon">{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </span>
        </div>
        <div className="banner-right">
          {((order.status || "pending").toLowerCase() === "pending" ||
            (order.status || "pending").toLowerCase() === "confirmed") && (
            <>
              <button
                className="action-btn-secondary"
                onClick={() => onCancelOrder(order.id)}
              >
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
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span>Hủy đơn</span>
              </button>
              <button
                className="action-btn-primary"
                onClick={() => onUpdateStatus(order.id, "confirmed")}
              >
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
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Xác nhận đơn</span>
              </button>
            </>
          )}

          {((order.status || "pending").toLowerCase() === "shipping" ||
            (order.status || "pending").toLowerCase() === "shipped") && (
            <button
              className="action-btn-primary"
              onClick={() => onUpdateStatus(order.id, "done")}
            >
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Hoàn thành đơn</span>
            </button>
          )}
        </div>
      </div>

      {/* Main layout columns */}
      <div className="detail-layout-grid">
        {/* Left Column: Products and Cost */}
        <div className="detail-left-column">
          <div className="detail-section-card">
            <h3 className="section-title">Sản phẩm trong đơn</h3>
            <div className="products-list-wrapper">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  // Premium fallbacks for fashion item presentation
                  const productImg =
                    item.image ||
                    `https://images.unsplash.com/photo-${
                      index === 0
                        ? "1523381210434-271e8be1f52b"
                        : "1551488831-00ddcb6c6bd3"
                    }?auto=format&fit=crop&w=150&q=80`;
                  const productCondition = item.condition || (index === 0 ? "Cũ - Ngoại hình đẹp" : "Mới 98% - Hộp thay thế");
                  const isVerified = item.isVerified !== false;

                  return (
                    <div className="product-item-row" key={index}>
                      <img
                        className="product-thumbnail"
                        src={productImg}
                        alt={item.productName}
                      />
                      <div className="product-info-details">
                        <span className="product-title-name">{item.productName}</span>
                        <span className="product-meta-desc">Tình trạng: {productCondition}</span>
                        {isVerified && (
                          <span className="verified-product-badge">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span>Đã kiểm định</span>
                          </span>
                        )}
                      </div>
                      <div className="product-pricing-details">
                        <span className="product-price">{formatPrice(item.price)}</span>
                        <span className="product-qty">x{item.quantity || 1}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="no-items-placeholder">Không có thông tin sản phẩm.</div>
              )}
            </div>

            {/* Calculations Card */}
            <div className="billing-calculations-card">
              <div className="calc-row">
                <span className="calc-label">Tạm tính</span>
                <span className="calc-value">{formatPrice(subtotal)}</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Phí vận chuyển</span>
                <span className="calc-value">{formatPrice(shipping)}</span>
              </div>
              <div className="calc-row">
                <span className="calc-label">Giảm giá (Voucher)</span>
                <span className="calc-value discount-text">-{formatPrice(discount)}</span>
              </div>
              <div className="calc-divider"></div>
              <div className="calc-row total-row">
                <span className="total-label">Tổng cộng</span>
                <span className="total-value">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer and Timeline */}
        <div className="detail-right-column">
          {/* Customer Card */}
          <div className="detail-section-card">
            <h3 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="section-title-icon"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Khách hàng</span>
            </h3>
            <div className="customer-info-block">
              <div className="cust-primary-name">{order.customerName || "Khách vãng lai"}</div>
              <div className="cust-detail-text">{order.customerPhone || "Chưa có SĐT"}</div>
              <div className="cust-detail-text">{order.customerEmail || "Chưa có email"}</div>

              <div className="address-section-header">ĐỊA CHỈ GIAO HÀNG</div>
              <div className="cust-address-text">
                {order.shippingAddress || "Chưa cung cấp địa chỉ"}, {order.shippingCity || ""}
              </div>

              <div className="note-section-header">GHI CHÚ</div>
              <div className="cust-note-box">
                {order.note || "Giao giờ hành chính giúp mình nhé."}
              </div>
            </div>
          </div>

          {/* Timeline History Card */}
          <div className="detail-section-card">
            <h3 className="section-title">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="section-title-icon"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Lịch sử đơn</span>
            </h3>
            <div className="timeline-flow-wrapper">
              {timelineEvents.map((event, idx) => (
                <div
                  className={`timeline-step-node ${event.current ? "current-node" : ""} ${
                    event.danger ? "danger-node" : ""
                  }`}
                  key={idx}
                >
                  <div className="node-marker-bullet"></div>
                  {idx < timelineEvents.length - 1 && <div className="node-connector-line"></div>}
                  <div className="node-content-block">
                    <span className="node-event-title">{event.title}</span>
                    <span className="node-event-time">{event.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
