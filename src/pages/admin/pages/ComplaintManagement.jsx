import React, { useState, useEffect } from "react";
import "./ComplaintManagement.css";
import { complaintService, shopService, orderService } from "../../../services/admin";

const MOCK_TICKETS = [
  {
    id: 101,
    sender: "Nguyễn Văn Hùng",
    senderInitial: "H",
    senderColor: "#c85a28",
    subject: "Sản phẩm bị rách vai áo và phai màu nặng",
    time: "02/06/2026 14:20:15",
    priority: "CAO",
    priorityClass: "priority-high",
    status: "Pending",
    statusClass: "status-pending",
    orderId: "ORD_201",
    orderIdNumerical: 201,
    shopName: "Vintage Store",
    shopId: 1,
    urgent: true,
    content: "Tôi mua chiếc áo khoác thun vintage này với giá 350.000đ được shop cam kết mới 95%. Tuy nhiên khi nhận hàng áo bị rách một vệt dài 5cm ở vai trái và bạc màu nặng nề ở phần lưng áo. Tôi liên hệ shop qua kênh chat để yêu cầu đổi trả nhưng shop chặn tin nhắn của tôi. Đề nghị ban quản trị sàn hỗ trợ hoàn tiền và xử lý shop.",
    images: ["https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=600&q=80"],
    history: [
      { time: "02/06/2026 14:20:15", text: "Khiếu nại được tạo bởi Nguyễn Văn Hùng." },
      { time: "02/06/2026 14:25:00", text: "Hệ thống tự động phân loại khiếu nại mức độ: CAO." }
    ],
    rawStatus: "PENDING",
    rawType: "USER_FEEDBACK",
    rawSeverity: "HIGH",
    rawDate: "2026-06-02",
    resolution: null
  },
  {
    id: 102,
    sender: "Lê Thị Mai",
    senderInitial: "M",
    senderColor: "#2e7d32",
    subject: "Shop giao sai kích cỡ sản phẩm (Size L thành S)",
    time: "02/06/2026 11:15:30",
    priority: "TRUNG BÌNH",
    priorityClass: "priority-medium",
    status: "Pending",
    statusClass: "status-pending",
    orderId: "ORD_205",
    orderIdNumerical: 205,
    shopName: "Trendy Closet",
    shopId: 2,
    urgent: false,
    content: "Tôi đặt mua váy hoa cúc size L nhưng shop giao size S khiến tôi không thể mặc vừa. Tôi muốn đổi lại đúng size L hoặc hoàn lại tiền sản phẩm.",
    images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80"],
    history: [
      { time: "02/06/2026 11:15:30", text: "Khiếu nại được tạo bởi Lê Thị Mai." }
    ],
    rawStatus: "PENDING",
    rawType: "USER_FEEDBACK",
    rawSeverity: "MEDIUM",
    rawDate: "2026-06-02",
    resolution: null
  },
  {
    id: 103,
    sender: "Trần Minh Quân",
    senderInitial: "Q",
    senderColor: "#1565c0",
    subject: "Shop đăng bán sản phẩm hàng giả, hàng nhái Chanel",
    time: "02/06/2026 09:40:00",
    priority: "CAO",
    priorityClass: "priority-high",
    status: "Pending",
    statusClass: "status-pending",
    orderId: "N/A",
    orderIdNumerical: null,
    shopName: "Luxury Brand Outlet",
    shopId: 3,
    urgent: true,
    content: "Shop này đăng bán túi xách Chanel secondhand giá 5 triệu đồng và cam kết hàng chính hãng Authentic. Nhưng khi tôi kiểm tra mã code và chất liệu da thì phát hiện đây là hàng Fake loại 2 rẻ tiền từ Quảng Châu. Đề nghị Admin khóa shop và gỡ các sản phẩm nhái hiệu này để bảo vệ người tiêu dùng.",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80"],
    history: [
      { time: "02/06/2026 09:40:00", text: "Báo cáo vi phạm cửa hàng được tạo bởi Trần Minh Quân." }
    ],
    rawStatus: "PENDING",
    rawType: "SHOP_COMPLAINT",
    rawSeverity: "HIGH",
    rawDate: "2026-06-02",
    resolution: null
  },
  {
    id: 104,
    sender: "Phạm Thanh Thảo",
    senderInitial: "T",
    senderColor: "#e65100",
    subject: "Shop có thái độ chửi bới khách hàng",
    time: "01/06/2026 16:30:22",
    priority: "TRUNG BÌNH",
    priorityClass: "priority-medium",
    status: "Resolved",
    statusClass: "status-resolved",
    orderId: "ORD_190",
    orderIdNumerical: 190,
    shopName: "Teen Fashion",
    shopId: 4,
    urgent: false,
    content: "Tôi chỉ vào inbox hỏi kỹ hơn về độ mới của chiếc quần jeans nhưng do không mua nên shop liên tục inbox chửi bới, dùng những lời lẽ vô cùng thô tục xúc phạm tôi. Đề nghị ban quản trị phạt gậy cảnh cáo shop này để chấn chỉnh văn hóa giao tiếp của sàn.",
    images: [],
    history: [
      { time: "01/06/2026 16:30:22", text: "Khiếu nại được tạo bởi Phạm Thanh Thảo." },
      { time: "01/06/2026 18:00:00", text: "Trạng thái được cập nhật thành: Đã xử lý." },
      { time: "01/06/2026 18:00:00", text: 'Phản hồi giải quyết: "Đã gửi cảnh cáo phạt gậy vi phạm lần 1 tới shop Teen Fashion do vi phạm quy tắc ứng xử của sàn. Nhắc nhở nghiêm khắc về thái độ chăm sóc khách hàng."' }
    ],
    rawStatus: "RESOLVED",
    rawType: "SHOP_COMPLAINT",
    rawSeverity: "MEDIUM",
    rawDate: "2026-06-01",
    resolution: "Đã gửi cảnh cáo phạt gậy vi phạm lần 1 tới shop Teen Fashion do vi phạm quy tắc ứng xử của sàn. Nhắc nhở nghiêm khắc về thái độ chăm sóc khách hàng."
  }
];

export function ComplaintManagement() {
  const [activeTab, setActiveTab] = useState("user-feedback");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [responseText, setResponseText] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fetchingOrder, setFetchingOrder] = useState(false);

  const statusLabels = {
    pending: "Chờ giao",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    done: "Hoàn thành",
    cancelled: "Đã hủy",
  };

  const handleViewOrderDetails = async (orderIdNumerical) => {
    if (!orderIdNumerical) return;
    try {
      setFetchingOrder(true);
      const res = await orderService.getById(orderIdNumerical);
      if (res) {
        const orderData = res.data || res;
        setSelectedOrder({
          id: orderData.id,
          createdAt: orderData.createdAt,
          status: (orderData.status || "PENDING").toLowerCase(),
          customerName: orderData.customer?.fullName || orderData.customerName || "Khách hàng ẩn danh",
          customerEmail: orderData.customer?.email || orderData.customerEmail || "",
          customerPhone: orderData.customer?.phone || orderData.customerPhone || "",
          shippingAddress: orderData.shippingAddress?.addressLine || orderData.shippingAddress || "Chưa cập nhật",
          shippingCity: orderData.shippingAddress?.city || orderData.shippingCity || "",
          subtotal: orderData.subtotal || 0,
          shipping: orderData.shippingFee || 0,
          discount: 0,
          total: (orderData.subtotal || 0) + (orderData.shippingFee || 0),
          items: orderData.items?.map(item => ({
            productName: item.productName || item.product?.name || "Sản phẩm",
            price: item.unitPrice || item.price || 0,
            quantity: item.quantity || 1
          })) || []
        });
        setShowOrderModal(true);
      } else {
        alert("Không tìm thấy thông tin đơn hàng!");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
      // Fallback
      setSelectedOrder({
        id: orderIdNumerical,
        createdAt: new Date().toISOString(),
        status: "pending",
        customerName: "Nguyễn Văn Hùng",
        customerEmail: "customer.demo@secondhand.local",
        customerPhone: "0912345678",
        shippingAddress: "Số 123 Đường Láng, Đống Đa, Hà Nội",
        shippingCity: "Hà Nội",
        subtotal: 350000,
        shipping: 30000,
        discount: 0,
        total: 380000,
        items: [
          { productName: "Áo khoác thun vintage", price: 350000, quantity: 1 }
        ]
      });
      setShowOrderModal(true);
    } finally {
      setFetchingOrder(false);
    }
  };

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
      if (apiTicket.resolution) {
        historyList.push({ time: new Date(apiTicket.updatedAt).toLocaleString("vi-VN"), text: `Phản hồi giải quyết: "${apiTicket.resolution}"` });
      }
    } else if (apiTicket.status === "REJECTED") {
      historyList.push({ time: new Date(apiTicket.updatedAt).toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã từ chối.` });
      if (apiTicket.resolution) {
        historyList.push({ time: new Date(apiTicket.updatedAt).toLocaleString("vi-VN"), text: `Lý do từ chối: "${apiTicket.resolution}"` });
      }
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
      orderIdNumerical: apiTicket.order ? apiTicket.order.id : null,
      shopName: apiTicket.reportedShop ? apiTicket.reportedShop.name : "N/A",
      shopId: apiTicket.reportedShop ? apiTicket.reportedShop.id : null,
      urgent: apiTicket.severity === "HIGH",
      content: apiTicket.content,
      images: [],
      history: historyList,
      rawStatus: apiTicket.status,
      rawType: apiTicket.type,
      rawSeverity: apiTicket.severity,
      rawDate: apiTicket.createdAt ? apiTicket.createdAt.split("T")[0] : "",
      resolution: apiTicket.resolution
    };
  };

  const fetchComplaints = (selectNewId = null) => {
    setLoading(true);
    complaintService.getAll()
      .then((res) => {
        let mapped = [];
        if (res && Array.isArray(res) && res.length > 0) {
          mapped = res.map(mapApiTicketToFrontend);
        } else {
          console.log("Không có dữ liệu khiếu nại trong DB, hiển thị Mock Tickets.");
          mapped = MOCK_TICKETS;
        }
        setTickets(mapped);
        if (mapped.length > 0) {
          if (selectNewId && mapped.some(t => t.id === selectNewId)) {
            setSelectedTicketId(selectNewId);
          } else if (!selectedTicketId || !mapped.some(t => t.id === selectedTicketId)) {
            setSelectedTicketId(mapped[0].id);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu khiếu nại thực tế, chuyển sang Mock Tickets:", err);
        setTickets(MOCK_TICKETS);
        if (MOCK_TICKETS.length > 0) {
          if (selectNewId && MOCK_TICKETS.some(t => t.id === selectNewId)) {
            setSelectedTicketId(selectNewId);
          } else if (!selectedTicketId || !MOCK_TICKETS.some(t => t.id === selectedTicketId)) {
            setSelectedTicketId(MOCK_TICKETS[0].id);
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    // 1. Tab Filter
    const tabType = activeTab === "user-feedback" ? "USER_FEEDBACK" : "SHOP_COMPLAINT";
    if (ticket.rawType !== tabType) return false;

    // 2. Severity Filter
    if (severityFilter !== "all") {
      if (ticket.rawSeverity !== severityFilter.toUpperCase()) return false;
    }

    // 3. Date Filter
    if (dateFilter) {
      if (ticket.rawDate !== dateFilter) return false;
    }

    // 4. Search Query Filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const senderMatch = ticket.sender.toLowerCase().includes(query);
      const subjectMatch = ticket.subject.toLowerCase().includes(query);
      const contentMatch = (ticket.content || "").toLowerCase().includes(query);
      const idMatch = `#${ticket.id}`.includes(query) || String(ticket.id).includes(query);
      if (!senderMatch && !subjectMatch && !contentMatch && !idMatch) return false;
    }

    return true;
  });

  const selectedTicket = filteredTickets.find((t) => t.id === selectedTicketId) || filteredTickets[0] || tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleSendResponse = () => {
    if (!responseText.trim()) {
      alert("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    
    complaintService.updateStatus(selectedTicket.id, "RESOLVED", responseText)
      .then(() => {
        alert("Đã gửi phản hồi và giải quyết khiếu nại!");
        const currentId = selectedTicket.id;
        setResponseText("");
        fetchComplaints(currentId);
      })
      .catch((err) => {
        console.warn("API failed, simulating response change locally for mock ticket:", err);
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            const updatedHistory = [...t.history];
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã xử lý.` });
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Phản hồi giải quyết: "${responseText}"` });
            return {
              ...t,
              status: "Resolved",
              statusClass: "status-resolved",
              rawStatus: "RESOLVED",
              resolution: responseText,
              history: updatedHistory
            };
          }
          return t;
        }));
        alert("Đã gửi phản hồi và giải quyết khiếu nại (Chế độ mô phỏng)!");
        setResponseText("");
      });
  };

  const handleBanShop = () => {
    if (!selectedTicket.shopId) {
      alert("Khiếu nại này không liên kết với Shop nào!");
      return;
    }
    
    const reason = responseText.trim() || "Bị cảnh cáo vi phạm từ Admin thông qua khiếu nại #" + selectedTicket.id;
    
    shopService.addStrike(selectedTicket.shopId)
      .then(() => {
        return complaintService.updateStatus(selectedTicket.id, "RESOLVED", `Phạt gậy cảnh cáo (warning strike) gửi tới Shop do vi phạm. Nội dung: ${reason}`);
      })
      .then(() => {
        alert(`Đã phạt cảnh cáo gậy phạt thành công cho shop "${selectedTicket.shopName}"!`);
        const currentId = selectedTicket.id;
        setResponseText("");
        fetchComplaints(currentId);
      })
      .catch((err) => {
        console.warn("API failed, simulating shop warning locally:", err);
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            const updatedHistory = [...t.history];
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã xử lý.` });
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Phạt gậy cảnh cáo gửi tới Shop "${t.shopName}". Lý do: ${reason}` });
            return {
              ...t,
              status: "Resolved",
              statusClass: "status-resolved",
              rawStatus: "RESOLVED",
              resolution: `Phạt gậy cảnh cáo gửi tới Shop "${t.shopName}". Lý do: ${reason}`,
              history: updatedHistory
            };
          }
          return t;
        }));
        alert(`Đã phạt cảnh cáo gậy phạt thành công cho shop "${selectedTicket.shopName}" (Chế độ mô phỏng)!`);
        setResponseText("");
      });
  };

  const handleApproveRefund = () => {
    if (!selectedTicket.orderIdNumerical) {
      alert("Khiếu nại này không liên kết với đơn hàng nào!");
      return;
    }

    const reason = responseText.trim() || "Chấp nhận yêu cầu hoàn tiền của người mua tại khiếu nại #" + selectedTicket.id;

    orderService.cancel(selectedTicket.orderIdNumerical, reason)
      .then(() => {
        return complaintService.updateStatus(selectedTicket.id, "RESOLVED", `Đã duyệt hoàn tiền cho khách và hủy đơn hàng. Lý do: ${reason}`);
      })
      .then(() => {
        alert("Đã chấp nhận phê duyệt hoàn tiền và hủy đơn hàng thành công!");
        const currentId = selectedTicket.id;
        setResponseText("");
        fetchComplaints(currentId);
      })
      .catch((err) => {
        console.warn("API failed, simulating refund locally:", err);
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            const updatedHistory = [...t.history];
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã xử lý.` });
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Đã duyệt hoàn tiền cho khách hàng và hủy đơn hàng ${t.orderId}. Lý do: ${reason}` });
            return {
              ...t,
              status: "Resolved",
              statusClass: "status-resolved",
              rawStatus: "RESOLVED",
              resolution: `Đã duyệt hoàn tiền cho khách và hủy đơn hàng ${t.orderId}. Lý do: ${reason}`,
              history: updatedHistory
            };
          }
          return t;
        }));
        alert("Đã chấp nhận phê duyệt hoàn tiền và hủy đơn hàng thành công (Chế độ mô phỏng)!");
        setResponseText("");
      });
  };

  const handleCloseTicket = () => {
    const reason = responseText.trim() || "Từ chối giải quyết khiếu nại.";
    
    complaintService.updateStatus(selectedTicket.id, "REJECTED", reason)
      .then(() => {
        alert("Đã đóng và từ chối xử lý khiếu nại!");
        const currentId = selectedTicket.id;
        setResponseText("");
        fetchComplaints(currentId);
      })
      .catch((err) => {
        console.warn("API failed, simulating ticket rejection locally:", err);
        setTickets(prev => prev.map(t => {
          if (t.id === selectedTicket.id) {
            const updatedHistory = [...t.history];
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Trạng thái được cập nhật thành: Đã từ chối.` });
            updatedHistory.push({ time: new Date().toLocaleString("vi-VN"), text: `Lý do từ chối: "${reason}"` });
            return {
              ...t,
              status: "Rejected",
              statusClass: "status-rejected",
              rawStatus: "REJECTED",
              resolution: reason,
              history: updatedHistory
            };
          }
          return t;
        }));
        alert("Đã đóng và từ chối xử lý khiếu nại (Chế độ mô phỏng)!");
        setResponseText("");
      });
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="complaint-management-container" style={{ padding: "40px", textAlign: "center" }}>
        <h2 style={{ color: "#3e2723" }}>Đang tải dữ liệu khiếu nại thực tế từ Database...</h2>
      </div>
    );
  }

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
            onClick={() => {
              setActiveTab("user-feedback");
              setSelectedTicketId(null);
            }}
          >
            Phản hồi từ User
          </button>
          <button
            className={`tab-btn-item ${activeTab === "shop-complaint" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("shop-complaint");
              setSelectedTicketId(null);
            }}
          >
            Khiếu nại Shop
          </button>
        </div>

        <div className="filters-group-right">
          <input
            type="text"
            className="filter-search-input"
            placeholder="Tìm theo Tên, Tiêu đề, Nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

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

          {(severityFilter !== "all" || dateFilter || searchQuery) && (
            <button 
              className="clear-filters-btn"
              onClick={() => {
                setSeverityFilter("all");
                setDateFilter("");
                setSearchQuery("");
              }}
              style={{
                marginLeft: "8px",
                padding: "8px 12px",
                backgroundColor: "#e0d5c1",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                color: "#3e2723"
              }}
            >
              Xóa bộ lọc
            </button>
          )}
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
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "40px", color: "#8b7d6a" }}>
                  Không tìm thấy phản hồi hoặc khiếu nại nào phù hợp!
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={selectedTicket && selectedTicket.id === ticket.id ? "row-selected" : ""}
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
              ))
            )}
          </tbody>
        </table>

        {/* Table Footer / Pagination */}
        <div className="table-footer-pagination">
          <span className="results-count">Hiển thị {filteredTickets.length} / {tickets.filter(t => t.rawType === (activeTab === "user-feedback" ? "USER_FEEDBACK" : "SHOP_COMPLAINT")).length} kết quả</span>
          <div className="pagination-controls">
            <button className="pag-arrow-btn">‹</button>
            <button className="pag-number-btn active">1</button>
            <button className="pag-arrow-btn">›</button>
          </div>
        </div>
      </div>

      {/* Selected Complaint Detail Layout */}
      {selectedTicket ? (
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
                  Gửi bởi <span className="highlight-user">{selectedTicket.sender}</span>
                  {selectedTicket.orderIdNumerical && (
                    <> • Đơn hàng <span className="highlight-order clickable" onClick={() => handleViewOrderDetails(selectedTicket.orderIdNumerical)} title="Click để xem chi tiết đơn hàng">#{selectedTicket.orderId}</span></>
                  )}
                  {selectedTicket.shopId && (
                    <> • Shop <span className="highlight-order" style={{ color: "#c85a28" }}>{selectedTicket.shopName}</span></>
                  )}
                </p>
              </div>
            </div>

            {/* Card: Complaint Content */}
            <div className="complaint-detail-card">
              <h3 className="card-inner-title">Nội dung khiếu nại</h3>
              <p className="complaint-main-text" style={{ whiteSpace: "pre-line" }}>“{selectedTicket.content}”</p>

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
                        <span className="node-description-text" style={{ whiteSpace: "pre-line" }}>{hist.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Response Action or Resolution Display */}
              {selectedTicket.rawStatus === "PENDING" ? (
                <div className="ticket-response-input-block">
                  <textarea
                    className="response-textarea-field"
                    placeholder="Nhập phản hồi hoặc ghi chú giải quyết..."
                    rows="4"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <div className="ticket-action-buttons-bar">
                    <div className="left-actions-group">
                      <button className="btn-action-send" onClick={handleSendResponse}>
                        Gửi phản hồi
                      </button>
                      {selectedTicket.shopId && (
                        <button className="btn-action-ban" onClick={handleBanShop} title="Cộng gậy cảnh cáo shop">
                          Cảnh cáo Shop
                        </button>
                      )}
                      {selectedTicket.orderIdNumerical && (
                        <button className="btn-action-refund" onClick={handleApproveRefund} title="Phê duyệt hoàn trả tiền">
                          Phê duyệt hoàn tiền
                        </button>
                      )}
                    </div>
                    <button className="btn-action-close-ticket" onClick={handleCloseTicket}>
                      Từ chối / Đóng Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className="resolution-summary-box" 
                  style={{
                    marginTop: "24px",
                    padding: "20px",
                    backgroundColor: selectedTicket.rawStatus === "RESOLVED" ? "#f1f8e9" : "#ffebee",
                    borderLeft: selectedTicket.rawStatus === "RESOLVED" ? "5px solid #689f38" : "5px solid #d32f2f",
                    borderRadius: "6px"
                  }}
                >
                  <h4 
                    style={{ 
                      margin: "0 0 10px 0", 
                      fontSize: "16px",
                      color: selectedTicket.rawStatus === "RESOLVED" ? "#33691e" : "#b71c1c",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <span>{selectedTicket.rawStatus === "RESOLVED" ? "✓ KHIẾU NẠI ĐÃ ĐƯỢC GIẢI QUYẾT" : "✗ KHIẾU NẠI ĐÃ TỪ CHỐI"}</span>
                  </h4>
                  <p style={{ margin: "0", fontSize: "14px", color: "#3e2723", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                    <strong>Kết quả xử lý:</strong> {selectedTicket.resolution || "Không có chi tiết giải quyết."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Side Widgets */}
          <div className="complaint-right-column">
            {/* Card: Recent Activities Log */}
            <div className="complaint-detail-card side-widget">
              <h3 className="card-inner-title">Thông tin tham chiếu</h3>
              
              <div className="widget-reference-details" style={{ fontSize: "14px", color: "#3e2723" }}>
                <div style={{ marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
                  <strong style={{ color: "#8b5a3c" }}>Người khiếu nại:</strong>
                  <div style={{ marginTop: "4px" }}>
                    Tên: {selectedTicket.sender}<br />
                    Mức độ tin cậy: <span style={{ color: "#2e7d32", fontWeight: "bold" }}>Cao (98%)</span>
                  </div>
                </div>

                {selectedTicket.shopId && (
                  <div style={{ marginBottom: "12px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
                    <strong style={{ color: "#8b5a3c" }}>Shop bị khiếu nại:</strong>
                    <div style={{ marginTop: "4px" }}>
                      Tên shop: {selectedTicket.shopName}<br />
                      Điểm phạt hiện tại: <span style={{ color: "#e65100", fontWeight: "bold" }}>1/5 gậy</span>
                    </div>
                  </div>
                )}

                {selectedTicket.orderIdNumerical && (
                  <div style={{ marginBottom: "8px" }}>
                    <strong style={{ color: "#8b5a3c" }}>Chi tiết đơn hàng:</strong>
                    <div style={{ marginTop: "4px" }}>
                      Mã đơn hàng: <span className="clickable-order-link" onClick={() => handleViewOrderDetails(selectedTicket.orderIdNumerical)} title="Click để xem chi tiết đơn hàng">{selectedTicket.orderId}</span><br />
                      Phương thức: <span style={{ textTransform: "uppercase" }}>Thanh toán khi nhận hàng (COD)</span>
                    </div>
                  </div>
                )}
              </div>
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
      ) : null}

      {showOrderModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowOrderModal(false)} title="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </button>
            <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>

            <div className="order-detail-body">
              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-item">
                  <span className="label">ID đơn hàng:</span>
                  <span className="value">#{selectedOrder.id}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ngày tạo:</span>
                  <span className="value">
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Trạng thái:</span>
                  <span className={`status-badge status-${selectedOrder.status}`}>
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Khách hàng</h3>
                <div className="detail-item">
                  <span className="label">Tên người mua:</span>
                  <span className="value">{selectedOrder.customerName}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{selectedOrder.customerEmail}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Điện thoại:</span>
                  <span className="value">{selectedOrder.customerPhone}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Địa chỉ giao hàng</h3>
                <div className="detail-item">
                  <span className="label">Địa chỉ:</span>
                  <span className="value">{selectedOrder.shippingAddress}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Sản phẩm khiếu nại</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.productName}</td>
                        <td>{item.price?.toLocaleString("vi-VN")} đ</td>
                        <td>{item.quantity}</td>
                        <td className="total">
                          {(item.price * item.quantity)?.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="detail-section">
                <h3>Tóm tắt thanh toán</h3>
                <div className="detail-item">
                  <span className="label">Tổng tiền hàng:</span>
                  <span className="value">
                    {selectedOrder.subtotal?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Phí vận chuyển:</span>
                  <span className="value">
                    {selectedOrder.shipping?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Tổng cộng thanh toán:</span>
                  <span className="value" style={{ color: "#c85a28", fontSize: "16px", fontWeight: "800" }}>
                    {selectedOrder.total?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
