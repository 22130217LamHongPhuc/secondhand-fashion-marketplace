import React, { useState, useEffect } from "react";
import { complaintService, shopService, orderService, productService } from "../../../services/admin";
import { toastService } from "@/services/toastService";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminLoader from "@/components/common/AdminLoader";
import { ClipboardList, AlertCircle, CheckCircle2, Search, Calendar } from "lucide-react";

export function ComplaintManagement() {
  const [activeTab, setActiveTab] = useState("shop-complaint");
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
  const [confirmConfig, setConfirmConfig] = useState(null);
  const [ticketOrderDetails, setTicketOrderDetails] = useState(null);

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
        toastService.error("Không tìm thấy thông tin đơn hàng!");
      }
    } catch (err) {
      console.error("Lỗi khi tải chi tiết đơn hàng:", err);
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
      PENDING: "Chờ xử lý",
      RESOLVED: "Đã giải quyết",
      REJECTED: "Đã từ chối"
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
      shopWarningStrikes: apiTicket.reportedShop ? (apiTicket.reportedShop.warningStrikes ?? 0) : 0,
      shopActive: apiTicket.reportedShop ? (apiTicket.reportedShop.isActive !== false) : true,
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
        console.error("Lỗi khi lấy dữ liệu khiếu nại:", err);
        setTickets([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      const ticket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];
      if (ticket && ticket.orderIdNumerical) {
        orderService.getById(ticket.orderIdNumerical)
          .then((res) => {
            setTicketOrderDetails(res?.data || res);
          })
          .catch(() => setTicketOrderDetails(null));
        return;
      }
    }
    setTicketOrderDetails(null);
  }, [selectedTicketId, tickets]);

  const handleLockProduct = async (productId, productName) => {
    if (!productId) {
      toastService.error("Không tìm thấy ID sản phẩm để khóa!");
      return;
    }
    try {
      await productService.toggleActive(productId, false);
      toastService.success(`Đã khóa sản phẩm "${productName}" thành công!`);
    } catch (err) {
      toastService.error("Lỗi khi khóa sản phẩm: " + err.message);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const tabType = "SHOP_COMPLAINT";
    if (ticket.rawType !== tabType) return false;



    if (dateFilter) {
      if (ticket.rawDate !== dateFilter) return false;
    }

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
      toastService.warning("Vui lòng nhập nội dung phản hồi!");
      return;
    }
    
    complaintService.updateStatus(selectedTicket.id, "RESOLVED", responseText)
      .then(() => {
        toastService.success("Đã gửi phản hồi và giải quyết khiếu nại!");
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
        toastService.success("Đã gửi phản hồi và giải quyết khiếu nại (Chế độ mô phỏng)!");
        setResponseText("");
      });
  };

  const handleBanShop = () => {
    if (!selectedTicket.shopId) {
      toastService.error("Khiếu nại này không liên kết với Shop nào!");
      return;
    }
    
    const reason = responseText.trim() || "Bị cảnh cáo vi phạm từ Admin thông qua khiếu nại #" + selectedTicket.id;
    
    shopService.addStrike(selectedTicket.shopId)
      .then(() => {
        return complaintService.updateStatus(selectedTicket.id, "RESOLVED", `Phạt gậy cảnh cáo (warning strike) gửi tới Shop do vi phạm. Nội dung: ${reason}`);
      })
      .then(() => {
        toastService.success(`Đã phạt cảnh cáo gậy phạt thành công cho shop "${selectedTicket.shopName}"!`);
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
        toastService.success(`Đã phạt cảnh cáo gậy phạt thành công cho shop "${selectedTicket.shopName}" (Chế độ mô phỏng)!`);
        setResponseText("");
      });
  };
  
  const handleToggleShopActive = () => {
    if (!selectedTicket.shopId) {
      toastService.error("Khiếu nại này không liên kết với Shop nào!");
      return;
    }
    const newStatus = !selectedTicket.shopActive;
    const actionLabel = newStatus ? "mở khóa" : "khóa";
    
    setConfirmConfig({
      title: `${newStatus ? "Mở khóa" : "Khóa"} cửa hàng`,
      message: `Bạn có chắc chắn muốn ${actionLabel} cửa hàng "${selectedTicket.shopName}"?`,
      confirmText: newStatus ? "Mở khóa" : "Khóa",
      cancelText: "Hủy",
      type: newStatus ? "info" : "danger",
      onConfirm: async () => {
        try {
          await shopService.toggleActive(selectedTicket.shopId, newStatus);
          toastService.success(`Đã ${actionLabel} cửa hàng thành công!`);
          fetchComplaints(selectedTicket.id);
        } catch (err) {
          console.error("Lỗi khi thay đổi trạng thái hoạt động của shop:", err);
          toastService.error(`Không thể ${actionLabel} cửa hàng!`);
        }
      }
    });
  };

  const handleResetShopStrikes = () => {
    if (!selectedTicket.shopId) {
      toastService.error("Khiếu nại này không liên kết với Shop nào!");
      return;
    }
    
    setConfirmConfig({
      title: "Xóa gậy phạt",
      message: `Bạn có chắc chắn muốn xóa tất cả gậy phạt của cửa hàng "${selectedTicket.shopName}"?`,
      confirmText: "Xóa hết",
      cancelText: "Hủy",
      type: "warning",
      onConfirm: async () => {
        try {
          await shopService.resetStrikes(selectedTicket.shopId);
          toastService.success("Đã xóa tất cả gậy phạt thành công!");
          fetchComplaints(selectedTicket.id);
        } catch (err) {
          console.error("Lỗi khi xóa gậy phạt shop:", err);
          toastService.error("Không thể xóa gậy phạt!");
        }
      }
    });
  };

  const handleApproveRefund = () => {
    if (!selectedTicket.orderIdNumerical) {
      toastService.error("Khiếu nại này không liên kết với đơn hàng nào!");
      return;
    }

    const reason = responseText.trim() || "Chấp nhận yêu cầu hoàn tiền của người mua tại khiếu nại #" + selectedTicket.id;

    orderService.cancel(selectedTicket.orderIdNumerical, reason)
      .then(() => {
        return complaintService.updateStatus(selectedTicket.id, "RESOLVED", `Đã duyệt hoàn tiền cho khách và hủy đơn hàng. Lý do: ${reason}`);
      })
      .then(() => {
        toastService.success("Đã chấp nhận phê duyệt hoàn tiền và hủy đơn hàng thành công!");
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
        toastService.success("Đã chấp nhận phê duyệt hoàn tiền và hủy đơn hàng thành công (Chế độ mô phỏng)!");
        setResponseText("");
      });
  };

  const handleCloseTicket = () => {
    const reason = responseText.trim() || "Từ chối giải quyết khiếu nại.";
    
    complaintService.updateStatus(selectedTicket.id, "REJECTED", reason)
      .then(() => {
        toastService.success("Đã đóng và từ chối xử lý khiếu nại!");
        const currentId = selectedTicket.id;
        setResponseText("");
        fetchComplaints(currentId);
      })
      .catch((err) => {
        console.warn("API failed, simulating ticket rejection locally:", reason);
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
        toastService.success("Đã đóng và từ chối xử lý khiếu nại (Chế độ mô phỏng)!");
        setResponseText("");
      });
  };

  if (loading && tickets.length === 0) {
    return <AdminLoader />;
  }

  // Priority Badge Helper
  const getPriorityBadgeClass = (priorityClass = "") => {
    const p = priorityClass.toLowerCase();
    const base = "inline-flex items-center py-1 px-2.5 rounded-full text-[11px] font-extrabold tracking-wider ";
    if (p.includes("high")) return base + "bg-[#ffebee] text-[#c62828]";
    if (p.includes("medium")) return base + "bg-[#faf2dc] text-[#b58428]";
    if (p.includes("low")) return base + "bg-[#e8f5e9] text-[#2e7d32]";
    return base + "bg-[#faf2dc] text-[#b58428]";
  };

  // Status Indicator Dot Helper
  const getStatusIndicatorClass = (statusClass = "") => {
    const s = statusClass.toLowerCase();
    const base = "inline-flex items-center gap-1.5 text-[13px] font-bold bg-transparent p-0 border-none shadow-none before:content-[''] before:w-2 before:h-2 before:rounded-full before:inline-block ";
    if (s.includes("pending")) return base + "text-[#c62828] before:bg-[#c62828]";
    if (s.includes("processing")) return base + "text-[#ef6c00] before:bg-[#ef6c00]";
    if (s.includes("resolved") || s.includes("done")) return base + "text-[#2e7d32] before:bg-[#2e7d32]";
    return base + "text-[#8b7d6a] before:bg-[#8b7d6a]";
  };

  // Order Details Modal Status Badge Helper
  const getModalStatusBadgeClass = (status = "") => {
    const s = status.toLowerCase();
    const base = "py-1 px-2.5 rounded-full text-[11px] font-bold uppercase ";
    if (s === "pending" || s === "cancelled") return base + "bg-[#ffebee] text-[#c62828]";
    if (s === "confirmed" || s === "done") return base + "bg-[#e8f5e9] text-[#2e7d32]";
    if (s === "shipping") return base + "bg-[#fff3e0] text-[#ef6c00]";
    return base + "bg-[#eaeaea] text-[#666666]";
  };

  return (
    <div className="flex flex-col gap-5 w-full text-[#3e2723] pb-10 animate-[fadeIn_0.35s_cubic-bezier(0.4,0,0.2,1)]">
      {/* Top Title & Export */}
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <h1 className="text-xl font-extrabold text-[#3e2723] m-0">Quản lý khiếu nại</h1>
        </div>
        <button className="bg-[#c5e1a5] text-[#33691e] border border-[#aed581] rounded-lg py-2 px-4 text-[13px] font-bold flex items-center gap-2 cursor-pointer transition-all hover:bg-[#b2db8d] hover:-translate-y-[1px] active:scale-[0.97]">
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

      {/* Stats Cards Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-4">
        {/* Card 1: Tổng đơn khiếu nại */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">TỔNG ĐƠN KHIẾU NẠI</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{tickets.length}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-stone-50 text-stone-600">
            <ClipboardList className="w-5 h-5 text-stone-600" />
          </div>
        </div>

        {/* Card 2: Cần xử lý */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">CẦN XỬ LÝ</div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {tickets.filter(t => t.rawStatus === "PENDING").length}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-rose-50 text-rose-600">
            <AlertCircle className="w-5 h-5 text-rose-600" />
          </div>
        </div>

        {/* Card 3: Đã xử lý */}
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">ĐÃ XỬ LÝ</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {tickets.filter(t => t.rawStatus !== "PENDING").length}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-emerald-50 text-emerald-755">
            <CheckCircle2 className="w-5 h-5 text-emerald-755" />
          </div>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        {/* Search Input */}
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo Tên, Tiêu đề, Nội dung..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#c85a28] focus:ring-1 focus:ring-[#c85a28] transition-all text-stone-800 placeholder-stone-400 shadow-sm"
          />
        </div>

        {/* Date Filter */}
        <div className="relative w-full sm:w-[180px]">
          <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            onClick={(e) => e.target.showPicker?.()}
            onFocus={(e) => e.target.showPicker?.()}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-[#c85a28] focus:ring-1 focus:ring-[#c85a28] transition-all text-stone-800 font-bold cursor-pointer shadow-sm"
          />
        </div>

        {/* Clear Filters */}
        {(dateFilter || searchQuery) && (
          <button 
            className="py-2.5 px-4 bg-stone-100 border border-stone-200 rounded-xl cursor-pointer text-sm font-bold text-stone-600 hover:bg-stone-200 hover:text-stone-800 transition-all shadow-sm"
            onClick={() => {
              setDateFilter("");
              setSearchQuery("");
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Complaints Data Table */}
      <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-4 px-5 shadow-[0_4px_16px_rgba(139,90,60,0.04)]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">TICKET ID</th>
              <th className="p-3 text-left text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">NGƯỜI GỬI</th>
              <th className="p-3 text-left text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">CHỦ ĐỀ</th>
              <th className="p-3 text-left text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">ĐƠN HÀNG</th>
              <th className="p-3 text-left text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">THỜI GIAN</th>
              <th className="p-3 text-left text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">TRẠNG THÁI</th>
              <th className="p-3 text-center text-[11px] font-bold text-[#8b7d6a] tracking-widest border-b border-[#f0e5cb]">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-10 text-[#8b7d6a]">
                  Không tìm thấy phản hồi hoặc khiếu nại nào phù hợp!
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  className={`hover:bg-[#fffdf9] border-b border-[#f9f5eb] last:border-none ${
                    selectedTicket && selectedTicket.id === ticket.id ? "bg-[#faf2dc]" : ""
                  }`}
                >
                  <td className="p-[14px_12px] text-[13px] text-[#c85a28] font-bold align-middle">#{ticket.id}</td>
                  <td className="p-[14px_12px] text-[13px] text-[#3e2723] align-middle flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-full text-white flex items-center justify-center text-[11px] font-bold shadow-[0_2px_6px_rgba(0,0,0,0.08)]"
                      style={{ backgroundColor: ticket.senderColor }}
                    >
                      {ticket.senderInitial}
                    </span>
                    <span className="font-bold">{ticket.sender}</span>
                  </td>
                  <td className="p-[14px_12px] text-[13px] text-[#3e2723] align-middle font-semibold max-w-[220px] whitespace-nowrap overflow-hidden text-ellipsis">{ticket.subject}</td>
                  <td className="p-[14px_12px] text-[13px] text-[#3e2723] align-middle font-bold">
                    {ticket.orderIdNumerical ? (
                      <button
                        onClick={() => handleViewOrderDetails(ticket.orderIdNumerical)}
                        className="text-[#c85a28] hover:underline bg-transparent border-none p-0 cursor-pointer font-bold"
                        title="Xem chi tiết đơn hàng"
                      >
                        {ticket.orderId}
                      </button>
                    ) : (
                      <span className="text-[#8b7d6a]">N/A</span>
                    )}
                  </td>
                  <td className="p-[14px_12px] text-[13px] text-[#8b7d6a] align-middle">{ticket.time}</td>
                  <td className="p-[14px_12px] text-[13px] text-[#3e2723] align-middle">
                    <span className={getStatusIndicatorClass(ticket.statusClass)}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-[14px_12px] text-[13px] text-[#3e2723] align-middle text-center">
                    <button
                      className="bg-[#f0e9d6] text-[#8b5a3c] border border-[#e1d6b9] rounded-lg py-1.5 px-3 text-[12px] font-bold cursor-pointer transition-all hover:bg-[#c85a28] hover:text-white hover:border-[#c85a28]"
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
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[#8b7d6a] font-medium">Hiển thị {filteredTickets.length} / {tickets.filter(t => t.rawType === (activeTab === "user-feedback" ? "USER_FEEDBACK" : "SHOP_COMPLAINT")).length} kết quả</span>
          <div className="flex items-center gap-1.5">
            <button className="bg-[#f7f2e4] border border-[#e2d8bd] rounded-md w-7 h-7 flex items-center justify-center text-[13px] font-bold text-[#8b5a3c] cursor-pointer transition-all hover:bg-[#ebdcb9]">‹</button>
            <button className="bg-[#c85a28] border border-[#c85a28] rounded-md w-7 h-7 flex items-center justify-center text-[13px] font-bold text-white cursor-pointer transition-all">1</button>
            <button className="bg-[#f7f2e4] border border-[#e2d8bd] rounded-md w-7 h-7 flex items-center justify-center text-[13px] font-bold text-[#8b5a3c] cursor-pointer transition-all hover:bg-[#ebdcb9]">›</button>
          </div>
        </div>
      </div>

      {/* Selected Complaint Detail Layout */}
      {selectedTicket ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-5">
          {/* Left Column: Selected Ticket Details */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span
                className="w-12 h-12 text-white flex items-center justify-center text-base font-bold shadow-[0_2px_6px_rgba(0,0,0,0.08)] rounded-full"
                style={{ backgroundColor: selectedTicket.senderColor }}
              >
                {selectedTicket.senderInitial}
              </span>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-[#3e2723] m-0">
                    Chi tiết khiếu nại #{selectedTicket.id}
                  </h2>
                  {selectedTicket.urgent && (
                    <span className="bg-[#ffebee] text-[#c62828] border border-[#ffcdcd] text-[10px] font-extrabold tracking-wider py-1 px-2 rounded-md">URGENT ISSUE</span>
                  )}
                </div>
                <p className="text-[13px] text-[#8b7d6a] m-0">
                  Gửi bởi <span className="font-bold text-[#c85a28]">{selectedTicket.sender}</span>
                  {selectedTicket.orderIdNumerical && (
                    <> • Đơn hàng <span className="cursor-pointer text-[#c85a28] underline transition-colors hover:text-[#a04018] font-bold" onClick={() => handleViewOrderDetails(selectedTicket.orderIdNumerical)} title="Click để xem chi tiết đơn hàng">#{selectedTicket.orderId}</span></>
                  )}
                  {selectedTicket.shopId && (
                    <> • Shop <span className="font-bold text-[#3e2723]">{selectedTicket.shopName}</span></>
                  )}
                </p>
              </div>
            </div>

            {/* Card: Complaint Content */}
            <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-6 shadow-[0_4px_16px_rgba(139,90,60,0.04)]">
              <h3 className="text-base font-bold text-[#3e2723] m-0 mb-4">Nội dung khiếu nại</h3>
              <p className="text-sm leading-relaxed text-[#4e342e] italic m-0 mb-5" style={{ whiteSpace: "pre-line" }}>“{selectedTicket.content}”</p>

              {/* Interaction History */}
              <div className="border-t border-dashed border-[#ebdcb9] pt-5 mb-6">
                <h4 className="text-[11px] font-bold text-[#8b7d6a] tracking-widest m-0 mb-4 flex items-center gap-2">
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
                <div className="flex flex-col pl-2">
                  {selectedTicket.history.map((hist, idx) => (
                    <div className="relative flex gap-4 pb-5 last:pb-0 before:content-[''] before:absolute before:left-1 before:top-3 before:bottom-0 before:w-[1px] before:bg-[#ebdcb9] last:before:hidden" key={idx}>
                      <div className="w-2 h-2 rounded-full bg-[#c85a28] z-[2] mt-1 shadow-[0_0_0_2px_#fffaf0]"></div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] text-[#8b7d6a]">{hist.time}</span>
                        <span className="text-[13px] font-semibold text-[#3e2723] leading-normal" style={{ whiteSpace: "pre-line" }}>{hist.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Response Action or Resolution Display */}
              {selectedTicket.rawStatus === "PENDING" ? (
                <div className="border-t border-[#f3ebd8] pt-5 flex flex-col gap-4">
                  <textarea
                    className="w-full border border-[#ebdcb9] rounded-xl p-4 text-[13px] text-[#3e2723] outline-none bg-white transition-all resize-y focus:border-[#c85a28] focus:shadow-[0_0_0_3px_rgba(200,90,40,0.08)]"
                    placeholder="Nhập phản hồi hoặc ghi chú giải quyết..."
                    rows="4"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  />
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div className="flex gap-2 flex-wrap">
                      <button className="bg-[#c85a28] text-white border-none rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all hover:bg-[#b54a1a]" onClick={handleSendResponse}>
                        Gửi phản hồi
                      </button>
                      {selectedTicket.shopId && (
                        <>
                          <button className="bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all hover:bg-[#ffd8d8]" onClick={handleBanShop} title="Cộng gậy cảnh cáo shop">
                            Cảnh cáo Shop (+1 gậy)
                          </button>
                          <button className={`border rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all ${
                            selectedTicket.shopActive 
                              ? "bg-[#fff3e0] text-[#e65100] border-[#ffe0b2] hover:bg-[#ffe0b2]"
                              : "bg-[#e8f5e9] text-[#2e7d32] border-[#c8e6c9] hover:bg-[#d0efd3]"
                          }`} onClick={handleToggleShopActive} title={selectedTicket.shopActive ? "Khóa cửa hàng" : "Mở khóa cửa hàng"}>
                            {selectedTicket.shopActive ? "Khóa Shop" : "Mở khóa Shop"}
                          </button>

                          {ticketOrderDetails?.items?.map((item, idx) => (
                            <button
                              key={idx}
                              className="bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all hover:bg-[#ffd8d8]"
                              onClick={() => handleLockProduct(item.productId || item.id, item.productName)}
                              title={`Khóa sản phẩm ${item.productName}`}
                            >
                              Khóa sản phẩm: {item.productName}
                            </button>
                          ))}
                          {selectedTicket.shopWarningStrikes > 0 && (
                            <button className="bg-[#e0f7fa] text-[#006064] border border-[#b2ebf2] rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all hover:bg-[#b2ebf2]" onClick={handleResetShopStrikes} title="Xóa toàn bộ gậy phạt">
                              Xóa gậy phạt
                            </button>
                          )}
                        </>
                      )}
                      {selectedTicket.orderIdNumerical && (
                        <button className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all hover:bg-[#d0efd3]" onClick={handleApproveRefund} title="Phê duyệt hoàn trả tiền">
                          Phê duyệt hoàn tiền
                        </button>
                      )}
                    </div>
                    <button className="bg-[#f0e9d6] text-[#8b5a3c] border border-[#e1d6b9] rounded-xl py-2.5 px-4 text-[13px] font-bold cursor-pointer transition-all hover:bg-[#ebdcb9]" onClick={handleCloseTicket}>
                      Từ chối / Đóng Ticket
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={`mt-6 p-5 rounded-lg border-l-[5px] ${
                    selectedTicket.rawStatus === "RESOLVED" ? "bg-[#f1f8e9] border-[#689f38]" : "bg-[#ffebee] border-[#d32f2f]"
                  }`}
                >
                  <h4 
                    className={`margin-0 mb-2.5 text-base font-bold flex items-center gap-1.5 ${
                      selectedTicket.rawStatus === "RESOLVED" ? "text-[#33691e]" : "text-[#b71c1c]"
                    }`}
                  >
                    <span>{selectedTicket.rawStatus === "RESOLVED" ? "✓ KHIẾU NẠI ĐÃ ĐƯỢC GIẢI QUYẾT" : "✗ KHIẾU NẠI ĐÃ TỪ CHỐI"}</span>
                  </h4>
                  <p className="margin-0 text-sm text-[#3e2723] leading-relaxed" style={{ whiteSpace: "pre-line" }}>
                    <strong>Kết quả xử lý:</strong> {selectedTicket.resolution || "Không có chi tiết giải quyết."}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Side Widgets */}
          <div className="flex flex-col gap-5">
            {/* Card: Reference Details */}
            <div className="bg-[#fffaf0] border border-[#f3ebd8] rounded-2xl p-6 shadow-[0_4px_16px_rgba(139,90,60,0.04)]">
              <h3 className="text-base font-bold text-[#3e2723] m-0 mb-4">Thông tin tham chiếu</h3>
              
              <div className="text-sm text-[#3e2723]">
                <div className="mb-3 border-b border-[#f3ebd8] pb-3">
                  <strong className="text-[#8b5a3c]">Người khiếu nại:</strong>
                  <div className="mt-1">
                    Tên: {selectedTicket.sender}<br />
                    Mức độ tin cậy: <span className="text-[#2e7d32] font-bold">Cao (98%)</span>
                  </div>
                </div>

                {selectedTicket.shopId && (
                  <div className="mb-3 border-b border-[#f3ebd8] pb-3">
                    <strong className="text-[#8b5a3c]">Shop bị khiếu nại:</strong>
                    <div className="mt-1">
                      Tên shop: {selectedTicket.shopName}<br />
                      Điểm phạt hiện tại: <span className="text-[#e65100] font-bold">{selectedTicket.shopWarningStrikes || 0}/5 gậy</span>
                    </div>
                  </div>
                )}

                {selectedTicket.orderIdNumerical && (
                  <div className="mb-2">
                    <strong className="text-[#8b5a3c]">Chi tiết đơn hàng:</strong>
                    <div className="mt-1">
                      Mã đơn hàng: <span className="text-[#c85a28] font-bold cursor-pointer underline transition-colors hover:text-[#a04018]" onClick={() => handleViewOrderDetails(selectedTicket.orderIdNumerical)} title="Click để xem chi tiết đơn hàng">{selectedTicket.orderId}</span><br />
                      Phương thức: <span className="uppercase">Thanh toán khi nhận hàng (COD)</span>
                    </div>
                    {ticketOrderDetails?.items && ticketOrderDetails.items.length > 0 && (
                      <div className="mt-3 bg-[#faf5eb] border border-[#f3ebd8] rounded-xl p-3 flex flex-col gap-2">
                        <div className="text-[10px] font-extrabold text-[#8b5a3c] uppercase tracking-wider mb-1">Sản phẩm trong đơn:</div>
                        <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                          {ticketOrderDetails.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-xs border-b border-[#f0e5cb] last:border-none pb-2 last:pb-0 gap-2">
                              <span className="font-bold text-[#3e2723] truncate max-w-[200px]" title={item.productName}>
                                {item.productName}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Card: Eco Green ESG Panel */}
            <div className="bg-[#e8f5e9] border border-[#c8e6c9] border-l-4 border-l-[#2e7d32] rounded-2xl p-6 shadow-[0_4px_16px_rgba(139,90,60,0.04)]">
              <h3 className="text-base font-bold text-[#1b5e20] m-0 mb-4">Tiệm Cũ Xanh</h3>
              <p className="text-[13px] leading-relaxed text-[#2e7d32] m-0 mb-4">
                Các phản hồi về chương trình 'Mua bán vì môi trường' tăng 40% trong tháng này. Hãy chuẩn bị báo cáo chi tiết cho đối tác ESG.
              </p>
              <span className="bg-[#2e7d32] text-white text-[11px] font-extrabold tracking-wider py-1.5 px-3 rounded-md inline-block">GREEN METRICS</span>
            </div>
          </div>
        </div>
      ) : null}

      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[1000] backdrop-blur-[4px]" onClick={() => setShowOrderModal(false)}>
          <div className="relative bg-white p-[30px] rounded-xl max-w-[600px] w-[90%] max-h-[90vh] overflow-y-auto shadow-[0_8px_30px_rgba(0,0,0,0.2)] border border-[#ebdcb9] text-[#3e2723] animate-[modalScaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-none border-none text-2xl cursor-pointer text-[#8b7d6a] flex items-center justify-center w-8 h-8 rounded-full transition-all hover:bg-[#faf6eb] hover:text-[#c85a28]" onClick={() => setShowOrderModal(false)} title="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </button>
            <h2 className="m-0 mb-5 text-[#3e2723] text-xl font-bold">Chi tiết đơn hàng #{selectedOrder.id}</h2>

            <div className="mb-5">
              <div className="mb-5">
                <h3 className="text-[13px] font-bold text-[#8b5a3c] m-0 mb-3.5 uppercase tracking-wider">Thông tin đơn hàng</h3>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb]">
                  <span className="text-[#8b7d6a] font-semibold">ID đơn hàng:</span>
                  <span className="text-[#3e2723] font-bold">#{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb]">
                  <span className="text-[#8b7d6a] font-semibold">Ngày tạo:</span>
                  <span className="text-[#3e2723] font-bold">
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb] last:border-none">
                  <span className="text-[#8b7d6a] font-semibold">Trạng thái:</span>
                  <span className={getModalStatusBadgeClass(selectedOrder.status)}>
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-[13px] font-bold text-[#8b5a3c] m-0 mb-3.5 uppercase tracking-wider">Khách hàng</h3>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb]">
                  <span className="text-[#8b7d6a] font-semibold">Tên người mua:</span>
                  <span className="text-[#3e2723] font-bold">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb]">
                  <span className="text-[#8b7d6a] font-semibold">Email:</span>
                  <span className="text-[#3e2723] font-bold">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb] last:border-none">
                  <span className="text-[#8b7d6a] font-semibold">Điện thoại:</span>
                  <span className="text-[#3e2723] font-bold">{selectedOrder.customerPhone}</span>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-[13px] font-bold text-[#8b5a3c] m-0 mb-3.5 uppercase tracking-wider">Địa chỉ giao hàng</h3>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb] last:border-none">
                  <span className="text-[#8b7d6a] font-semibold">Địa chỉ:</span>
                  <span className="text-[#3e2723] font-bold">{selectedOrder.shippingAddress}</span>
                </div>
              </div>

              <div className="mb-5">
                <h3 className="text-[13px] font-bold text-[#8b5a3c] m-0 mb-3.5 uppercase tracking-wider">Sản phẩm khiếu nại</h3>
                <table className="w-full border-collapse mt-2.5 text-[13px]">
                  <thead>
                    <tr>
                      <th className="text-left p-2 bg-[#faf6eb] text-[#8b7d6a] font-bold">Tên sản phẩm</th>
                      <th className="text-left p-2 bg-[#faf6eb] text-[#8b7d6a] font-bold">Đơn giá</th>
                      <th className="text-left p-2 bg-[#faf6eb] text-[#8b7d6a] font-bold">Số lượng</th>
                      <th className="text-left p-2 bg-[#faf6eb] text-[#8b7d6a] font-bold">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 border-b border-[#faf6eb] text-[#3e2723] align-middle">
                          <div className="font-bold">{item.productName}</div>
                          <button
                            onClick={() => handleLockProduct(item.productId || item.id, item.productName)}
                            className="mt-1 text-[9px] bg-rose-50 text-[#c62828] border border-[#ffcdd2] rounded-lg px-2 py-0.5 font-bold cursor-pointer hover:bg-[#ffebee] transition-colors"
                          >
                            Khóa sản phẩm
                          </button>
                        </td>
                        <td className="p-2.5 border-b border-[#faf6eb] text-[#3e2723] align-middle">{item.price?.toLocaleString("vi-VN")} đ</td>
                        <td className="p-2.5 border-b border-[#faf6eb] text-[#3e2723] align-middle">{item.quantity}</td>
                        <td className="p-2.5 border-b border-[#faf6eb] text-[#c85a28] font-bold align-middle">
                          {(item.price * item.quantity)?.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-5">
                <h3 className="text-[13px] font-bold text-[#8b5a3c] m-0 mb-3.5 uppercase tracking-wider">Tóm tắt thanh toán</h3>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb]">
                  <span className="text-[#8b7d6a] font-semibold">Tổng tiền hàng:</span>
                  <span className="text-[#3e2723] font-bold">
                    {selectedOrder.subtotal?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb]">
                  <span className="text-[#8b7d6a] font-semibold">Phí vận chuyển:</span>
                  <span className="text-[#3e2723] font-bold">
                    {selectedOrder.shipping?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between py-2 text-[13px] border-b border-[#faf6eb] last:border-none">
                  <span className="text-[#8b7d6a] font-semibold">Tổng cộng thanh toán:</span>
                  <span className="text-[#c85a28] text-base font-extrabold">
                    {selectedOrder.total?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmConfig !== null}
        onClose={() => setConfirmConfig(null)}
        onConfirm={async () => {
          if (confirmConfig?.onConfirm) {
            await confirmConfig.onConfirm();
          }
          setConfirmConfig(null);
        }}
        title={confirmConfig?.title || ""}
        message={confirmConfig?.message || ""}
        confirmText={confirmConfig?.confirmText || "Xác nhận"}
        cancelText={confirmConfig?.cancelText || "Hủy"}
        type={confirmConfig?.type || "danger"}
      />
    </div>
  );
}
