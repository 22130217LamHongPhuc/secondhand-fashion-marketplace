import React from "react";

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
    const formatLogTime = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      const today = new Date();
      const isToday = d.getDate() === today.getDate() &&
                      d.getMonth() === today.getMonth() &&
                      d.getFullYear() === today.getFullYear();
      
      const timeStr = d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
      if (isToday) {
        return `Hôm nay, ${timeStr}`;
      }
      return `${d.toLocaleDateString("vi-VN")}, ${timeStr}`;
    };

    if (order.statusLogs && order.statusLogs.length > 0) {
      // Sort status logs descending by createdAt
      const sortedLogs = [...order.statusLogs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      return sortedLogs.map((log, idx) => {
        let title = "Cập nhật trạng thái";
        const st = (log.status || "pending").toLowerCase();
        switch (st) {
          case "pending":
            title = "Khách đặt hàng";
            break;
          case "confirmed":
            title = "Đã xác nhận";
            break;
          case "shipping":
          case "shipped":
            title = "Đang giao hàng";
            break;
          case "done":
          case "delivered":
            title = "Hoàn thành";
            break;
          case "cancelled":
            title = "Đã hủy đơn";
            break;
          default:
            title = log.status;
        }

        return {
          title,
          time: formatLogTime(log.createdAt),
          active: true,
          current: idx === 0,
          danger: st === "cancelled"
        };
      });
    }

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
        { title: "Chờ xác nhận", time: `${createdDate}, ${createdTime}`, active: true, current: true },
        ...baseEvents
      ];
    } else if (s === "confirmed") {
      return [
        { title: "Đã xác nhận", time: `${createdDate}, ${createdTime}`, active: true, current: true },
        ...baseEvents
      ];
    } else if (s === "shipping" || s === "shipped") {
      return [
        { title: "Đang giao hàng", time: `${createdDate}, ${createdTime}`, active: true, current: true },
        { title: "Đã xác nhận", time: `${createdDate}, ${createdTime}`, active: true },
        ...baseEvents
      ];
    } else if (s === "done" || s === "delivered") {
      return [
        { title: "Hoàn thành", time: `${createdDate}, ${createdTime}`, active: true, current: true },
        { title: "Đang giao hàng", time: `${createdDate}, ${createdTime}`, active: true },
        { title: "Đã xác nhận", time: `${createdDate}, ${createdTime}`, active: true },
        ...baseEvents
      ];
    } else if (s === "cancelled") {
      return [
        { title: "Đã hủy đơn", time: `${createdDate}, ${createdTime}`, active: true, current: true, danger: true },
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

  const getStatusBadgeClass = (classType = "") => {
    const s = classType.toLowerCase();
    const base = "flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-bold border ";
    if (s.includes("pending")) return base + "bg-[#fdf2d7] text-[#b35900] border-[#f6dfaf]";
    if (s.includes("confirmed")) return base + "bg-[#e2f4df] text-[#276f27] border-[#c1e7bd]";
    if (s.includes("shipping")) return base + "bg-[#e3f2fd] text-[#0d47a1] border-[#bbdefb]";
    if (s.includes("delivered") || s.includes("done")) return base + "bg-[#efebe9] text-[#4e342e] border-[#d7ccc8]";
    if (s.includes("cancelled")) return base + "bg-[#ffebee] text-[#c62828] border-[#ffcdd2]";
    return base + "bg-[#fdf2d7] text-[#b35900] border-[#f6dfaf]";
  };

  return (
    <div className="flex flex-col gap-5 w-full text-[#3e2723] pb-10 animate-[fadeIn_0.35s_cubic-bezier(0.4,0,0.2,1)]">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <button
          className="bg-none border-none flex items-center gap-2.5 text-[#3e2723] text-2xl font-bold cursor-pointer py-1 px-2 rounded-lg transition-all hover:-translate-x-1 hover:text-[#c85a28]"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBack();
          }}
        >
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
      <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-4 px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_4px_16px_rgba(139,90,60,0.04)]">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold text-[#8b7d6a] tracking-widest">TRẠNG THÁI HIỆN TẠI</span>
          <span className={getStatusBadgeClass(statusInfo.class)}>
            <span className="text-sm">{statusInfo.icon}</span>
            <span>{statusInfo.label}</span>
          </span>
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-end">
          {(order.status || "pending").toLowerCase() === "pending" && (
            <>
              <button
                className="bg-[#f0e9d6] hover:bg-[#e6ddc4] text-[#8b5a3c] hover:text-[#704324] border border-[#e1d6b9] rounded-xl py-2.5 px-5 text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
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
                className="bg-[#c85a28] hover:bg-[#b54a1a] text-white border-none rounded-xl py-2.5 px-5 text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[0_4px_10px_rgba(200,90,40,0.15)] hover:shadow-[0_6px_14px_rgba(200,90,40,0.25)] hover:-translate-y-[1px]"
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

          {(order.status || "pending").toLowerCase() === "confirmed" && (
            <>
              <button
                className="bg-[#f0e9d6] hover:bg-[#e6ddc4] text-[#8b5a3c] hover:text-[#704324] border border-[#e1d6b9] rounded-xl py-2.5 px-5 text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95"
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
                className="bg-[#c85a28] hover:bg-[#b54a1a] text-white border-none rounded-xl py-2.5 px-5 text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[0_4px_10px_rgba(200,90,40,0.15)] hover:shadow-[0_6px_14px_rgba(200,90,40,0.25)] hover:-translate-y-[1px]"
                onClick={() => onUpdateStatus(order.id, "shipping")}
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
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Giao hàng</span>
              </button>
            </>
          )}

          {((order.status || "pending").toLowerCase() === "shipping" ||
            (order.status || "pending").toLowerCase() === "shipped") && (
            <button
              className="bg-[#c85a28] hover:bg-[#b54a1a] text-white border-none rounded-xl py-2.5 px-5 text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all active:scale-95 shadow-[0_4px_10px_rgba(200,90,40,0.15)] hover:shadow-[0_6px_14px_rgba(200,90,40,0.25)] hover:-translate-y-[1px]"
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
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        {/* Left Column: Products and Cost */}
        <div>
          <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-6 shadow-[0_4px_16px_rgba(139,90,60,0.04)] mb-5">
            <h3 className="text-lg font-bold text-[#3e2723] m-0 mb-5 flex items-center gap-2">Sản phẩm trong đơn</h3>
            <div className="flex flex-col gap-4 mb-6">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
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
                    <div className="bg-white border border-[#f3ebd8] rounded-[14px] p-4 flex items-center gap-4 shadow-[0_2px_8px_rgba(139,90,60,0.02)]" key={index}>
                      <img
                        className="w-[72px] h-[72px] rounded-lg object-cover border border-[#f0e5cb]"
                        src={productImg}
                        alt={item.productName}
                      />
                      <div className="flex-1 flex flex-col gap-1">
                        <span className="text-[15px] font-bold text-[#3e2723]">{item.productName}</span>
                        <span className="text-xs text-[#8b7d6a]">Tình trạng: {productCondition}</span>
                        {isVerified && (
                          <span className="bg-[#e2f4df] border border-[#c8e6c9] text-[#2e7d32] text-[11px] font-bold py-1 px-2 rounded-md self-start inline-flex items-center gap-1 mt-1">
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
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-base font-bold text-[#c85a28]">{formatPrice(item.price)}</span>
                        <span className="text-xs text-[#8b7d6a]">x{item.quantity || 1}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-10 text-[#8b7d6a]">Không có thông tin sản phẩm.</div>
              )}
            </div>

            {/* Calculations Card */}
            <div className="bg-[#f3edd8] rounded-xl p-5 flex flex-col gap-3">
              <div className="flex justify-between text-sm text-[#5d4037] font-medium">
                <span>Tạm tính</span>
                <span className="font-semibold text-[#3e2723]">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#5d4037] font-medium">
                <span>Phí vận chuyển</span>
                <span className="font-semibold text-[#3e2723]">{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm text-[#5d4037] font-medium">
                <span>Giảm giá (Voucher)</span>
                <span className="font-semibold text-[#c62828]">{formatPrice(discount)}</span>
              </div>
              <div className="h-[1px] bg-[#e5dcb7] my-1"></div>
              <div className="flex justify-between text-[#3e2723] text-base">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-lg font-extrabold text-[#c85a28]">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customer and Timeline */}
        <div>
          {/* Customer Card */}
          <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-6 shadow-[0_4px_16px_rgba(139,90,60,0.04)] mb-5">
            <h3 className="text-lg font-bold text-[#3e2723] m-0 mb-5 flex items-center gap-2">
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
                className="text-[#c85a28]"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>Khách hàng</span>
            </h3>
            <div className="flex flex-col gap-2">
              <div className="text-base font-bold text-[#3e2723] mb-1">{order.customerName || "Khách vãng lai"}</div>
              <div className="text-xs text-[#8b7d6a]">{order.customerPhone || "Chưa có SĐT"}</div>
              <div className="text-xs text-[#8b7d6a]">{order.customerEmail || "Chưa có email"}</div>

              <div className="text-[11px] font-bold text-[#8b7d6a] tracking-widest mt-4 mb-1.5">ĐỊA CHỈ GIAO HÀNG</div>
              <div className="text-xs text-[#3e2723] leading-relaxed">
                {order.shippingAddress || "Chưa cung cấp địa chỉ"}, {order.shippingCity || ""}
              </div>

              <div className="text-[11px] font-bold text-[#8b7d6a] tracking-widest mt-4 mb-1.5">GHI CHÚ</div>
              <div className="bg-[#faf7ee] border-l-4 border-[#c85a28] rounded-lg p-3 text-xs italic text-[#5d4037] leading-relaxed">
                {order.note || "Giao giờ hành chính giúp mình nhé."}
              </div>
            </div>
          </div>

          {/* Timeline History Card */}
          <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-6 shadow-[0_4px_16px_rgba(139,90,60,0.04)] mb-5">
            <h3 className="text-lg font-bold text-[#3e2723] m-0 mb-5 flex items-center gap-2">
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
                className="text-[#c85a28]"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Lịch sử đơn</span>
            </h3>
            <div className="flex flex-col pl-2 mt-2.5">
              {timelineEvents.map((event, idx) => (
                <div
                  className="relative flex gap-4 pb-6 last:pb-0"
                  key={idx}
                >
                  <div className={`w-2.5 h-2.5 rounded-full z-[2] mt-1 shadow-[0_0_0_2px_#fffaf0] transition-all ${
                    event.current ? "scale-[1.2] bg-[#c85a28] shadow-[0_0_0_3px_rgba(200,90,40,0.25)]" :
                    event.danger ? "bg-[#c62828] shadow-[0_0_0_3px_rgba(198,40,40,0.25)]" : "bg-[#d7ccc8]"
                  }`}></div>
                  {idx < timelineEvents.length - 1 && <div className="absolute left-[4.5px] top-3.5 bottom-0 w-[1px] bg-[#d7ccc8] z-[1]"></div>}
                  <div className="flex flex-col gap-0.5">
                    <span className={`text-sm font-semibold ${
                      event.current ? "text-[#3e2723] font-bold" :
                      event.danger ? "text-[#c62828] font-bold" : "text-[#8b7d6a]"
                    }`}>{event.title}</span>
                    <span className="text-[11px] text-[#8b7d6a]">{event.time}</span>
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
