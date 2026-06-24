/**
 * OrderManagement - Admin View (Read-Only)
 * 
 * Admin role CAN:
 * - View all orders across all shops
 * - Filter by status, date, shop
 * - Search orders
 * - View order details
 * 
 * Admin role CANNOT:
 * - Update order status (only SELLER can)
 * - Cancel orders (only SELLER can)
 * - Process orders (only SELLER can)
 * 
 * This is a marketplace platform where sellers manage their own orders.
 * Admin only monitors for platform oversight.
 */

import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderService } from "@/services/admin";
import { OrderDetailView } from "./OrderDetailView";
import { ChevronLeft, ChevronRight } from "lucide-react";

const demoOrders = [
  {
    id: 8492,
    customerName: "Minh Anh",
    customerPhone: "091234567",
    customerEmail: "minhanh@email.com",
    shippingAddress: "Q.1, TP.HCM",
    shippingCity: "TP.HCM",
    total: 450000,
    subtotal: 430000,
    shipping: 20000,
    discount: 0,
    status: "pending",
    shopName: "Vintage Store",
    createdAt: "2026-05-09T06:30:00.000Z",
    items: [
      { productName: "Áo sơ mi vintage", price: 250000, quantity: 1 },
      { productName: "Quần kaki", price: 180000, quantity: 1 },
    ],
  },
  {
    id: 8491,
    customerName: "Trần Hải",
    customerPhone: "0919876543",
    customerEmail: "tranghai@email.com",
    shippingAddress: "Ninh Kiều, Cần Thơ",
    shippingCity: "Cần Thơ",
    total: 1250000,
    subtotal: 1220000,
    shipping: 30000,
    discount: 0,
    status: "shipped",
    shopName: "Trendy Closet",
    createdAt: "2026-05-09T01:15:00.000Z",
    items: [
      { productName: "Áo khoác denim", price: 800000, quantity: 1 },
      { productName: "Túi canvas", price: 420000, quantity: 1 },
    ],
  },
  {
    id: 8488,
    customerName: "Lê Ngọc",
    customerPhone: "0983332222",
    customerEmail: "ngocle@email.com",
    shippingAddress: "Hải Châu, Đà Nẵng",
    shippingCity: "Đà Nẵng",
    total: 850000,
    subtotal: 820000,
    shipping: 30000,
    discount: 0,
    status: "delivered",
    shopName: "Vintage Store",
    createdAt: "2026-05-08T09:45:00.000Z",
    items: [
      { productName: "Váy linen", price: 320000, quantity: 1 },
      { productName: "Áo thun basic", price: 250000, quantity: 2 },
    ],
  },
  {
    id: 8485,
    customerName: "Phạm Việt",
    customerPhone: "0975551111",
    customerEmail: "vietpham@email.com",
    shippingAddress: "Thủ Đức, TP.HCM",
    shippingCity: "TP.HCM",
    total: 320000,
    subtotal: 320000,
    shipping: 0,
    discount: 0,
    status: "cancelled",
    shopName: "Teen Fashion",
    createdAt: "2026-05-08T03:20:00.000Z",
    items: [{ productName: "Mũ bucket", price: 320000, quantity: 1 }],
  },
];

const statusLabels = {
  pending: "Chờ giao",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  done: "Hoàn thành",
  cancelled: "Đã hủy",
};

export function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [shopFilter, setShopFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const { orderId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, dateFilter, searchTerm, shopFilter, startDate, endDate]);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetail = async () => {
        try {
          setLoading(true);
          setDetailError(null);
          const numericId = parseInt(orderId, 10);

          const fullOrder = await orderService.getById(numericId);
          if (fullOrder) {
            setSelectedOrder({
              ...fullOrder,
              status: fullOrder.status ? fullOrder.status.toLowerCase() : fullOrder.status
            });
          } else {
            setDetailError("Không tìm thấy đơn hàng #" + orderId);
            setSelectedOrder(null);
          }
        } catch (err) {
          console.warn("Failed to fetch order detail via API, trying demo fallback:", err);
          const demoMatch = demoOrders.find(o => o.id === parseInt(orderId, 10));
          if (demoMatch) {
            setSelectedOrder(demoMatch);
          } else {
            setDetailError("Không tìm thấy đơn hàng #" + orderId + " trong cơ sở dữ liệu.");
            setSelectedOrder(null);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetail();
    } else {
      setSelectedOrder(null);
      setDetailError(null);
    }
  }, [orderId]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      // Fetch all orders in one request to allow full searching/filtering and correct stats
      const response = await orderService.getAll(1, 10000, filters).catch(() => null);

      const rawData = response?.data || response || {};
      const apiOrders = rawData.data || rawData.content || rawData.items || (Array.isArray(rawData) ? rawData : []);
      const fallbackOrders = statusFilter === "all" && apiOrders.length === 0 ? demoOrders : [];
      const ordersToSet = apiOrders.length > 0 ? apiOrders : fallbackOrders;
      const normalizedOrders = ordersToSet.map(order => ({
        ...order,
        status: order.status ? order.status.toLowerCase() : order.status
      }));
      setOrders(normalizedOrders);
      setError(null);
    } catch (err) {
      if (statusFilter === "all") {
        setOrders(demoOrders);
      } else {
        setError(err.message);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  // ADMIN READ-ONLY: These functions are disabled for admin role
  // Only sellers can update order status and cancel orders
  /*
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      alert("Cập nhật trạng thái đơn hàng thành công!");
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus.toLowerCase() } : null);
      }
      loadOrders();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt("Nhập lý do hủy đơn hàng:");
    if (reason) {
      try {
        await orderService.cancel(orderId, reason);
        alert("Hủy đơn hàng thành công!");
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: "cancelled" } : null);
        }
        loadOrders();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };
  */

  const handleViewDetails = (order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ giao" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "done", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const uniqueShops = useMemo(() => {
    const shopsSet = new Set();
    orders.forEach((order) => {
      if (order.shopName) {
        shopsSet.add(order.shopName);
      }
    });
    return Array.from(shopsSet);
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.id).includes(keyword) ||
        (order.customerName || "").toLowerCase().includes(keyword) ||
        (order.customerEmail || "").toLowerCase().includes(keyword) ||
        (order.shopName || "").toLowerCase().includes(keyword);

      const createdAt = new Date(order.createdAt);
      const today = new Date();
      
      let matchesDate = true;
      if (dateFilter === "today") {
        matchesDate =
          today.getFullYear() === createdAt.getFullYear() &&
          today.getMonth() === createdAt.getMonth() &&
          today.getDate() === createdAt.getDate();
      } else if (dateFilter === "this_week") {
        const startOfWeek = new Date(today);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        matchesDate = createdAt >= startOfWeek && createdAt <= today;
      } else if (dateFilter === "this_month") {
        matchesDate =
          today.getFullYear() === createdAt.getFullYear() &&
          today.getMonth() === createdAt.getMonth();
      } else if (dateFilter === "custom") {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        
        let matchesStart = true;
        let matchesEnd = true;
        
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesStart = orderDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesEnd = orderDate <= end;
        }
        matchesDate = matchesStart && matchesEnd;
      }

      const matchesShop = shopFilter === "all" || (order.shopName || "Unknown Shop") === shopFilter;

      return matchesSearch && matchesDate && matchesShop;
    });
  }, [orders, searchTerm, dateFilter, shopFilter, startDate, endDate]);

  const summary = useMemo(() => {
    const total = filteredOrders.length;
    const pending = filteredOrders.filter(o => o.status === "pending" || o.status === "pending_confirmation").length;
    const shopProcessed = filteredOrders.filter(o => ["confirmed", "shipping", "shipped", "done", "delivered"].includes(o.status)).length;
    const shipping = filteredOrders.filter(o => ["shipping", "shipped"].includes(o.status)).length;
    const completed = filteredOrders.filter(o => ["done", "delivered"].includes(o.status)).length;
    const cancelled = filteredOrders.filter(o => o.status === "cancelled").length;
    const revenue = filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      total,
      pending,
      shopProcessed,
      shipping,
      completed,
      cancelled,
      revenue
    };
  }, [filteredOrders]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * 20;
    return filteredOrders.slice(start, start + 20);
  }, [filteredOrders, page]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredOrders.length / 20) || 1;
  }, [filteredOrders]);

  const getStatusBadgeClass = (status = "") => {
    const s = status.toLowerCase();
    const base = "inline-flex items-center py-1 px-3 rounded-full text-[11px] font-bold uppercase ";
    if (s === "pending") return base + "bg-[#f7c38d] text-[#9a5400]";
    if (s === "confirmed") return base + "bg-[#f4e2b6] text-[#9a6c00]";
    if (s === "shipping" || s === "shipped") return base + "bg-[#fff1c6] text-[#b37700]";
    if (s === "done" || s === "delivered") return base + "bg-[#dff1bf] text-[#4f8b1d]";
    if (s === "cancelled") return base + "bg-[#efe6cb] text-[#a7a07b]";
    return base + "bg-[#efe6cb] text-[#a7a07b]";
  };

  if (orderId) {
    if (loading && !selectedOrder) {
      return (
        <div className="flex justify-center items-center min-h-[50vh] p-10 animate-[fadeIn_0.4s_ease-out]">
          <div className="w-[50px] h-[50px] border-4 border-[#8b5a3c]/10 border-l-[#8b5a3c] rounded-full animate-[spin_1s_linear_infinite] mb-5"></div>
          <p className="color-[#8b5a3c] text-sm font-semibold text-center ml-4">Đang tải chi tiết đơn hàng #{orderId}...</p>
        </div>
      );
    }
    if (detailError) {
      return (
        <div className="flex justify-center items-center min-h-[50vh] p-10 animate-[fadeIn_0.4s_ease-out]">
          <div className="bg-white/95 backdrop-blur-[10px] border border-[#d9534f]/15 rounded-2xl p-10 max-w-[480px] w-full text-center shadow-[0_10px_30px_rgba(139,90,60,0.08)]">
            <div className="text-[48px] mb-5">⚠️</div>
            <h2 className="text-[#8b5a3c] text-22 font-bold mb-3">Không tìm thấy đơn hàng</h2>
            <p className="text-[#a37f65] text-sm leading-relaxed mb-[30px]">{detailError}</p>
            <button
              className="bg-gradient-to-r from-[#a37f65] to-[#8b5a3c] text-white border-none p-3 px-6 rounded-lg font-semibold text-sm cursor-pointer transition-all shadow-[0_4px_15px_rgba(139,90,60,0.2)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(139,90,60,0.3)] filter hover:brightness-105"
              onClick={() => navigate("/admin/orders")}
            >
              Quay lại danh sách đơn hàng
            </button>
          </div>
        </div>
      );
    }
    if (selectedOrder) {
      return (
        <OrderDetailView
          order={selectedOrder}
          onBack={() => {
            navigate("/admin/orders");
          }}
          readOnly={true}
          // Admin cannot update status or cancel orders - sellers only
          // onUpdateStatus={handleUpdateStatus}
          // onCancelOrder={handleCancelOrder}
        />
      );
    }
  }

  return (
    <div className="flex flex-col min-h-full animate-[fadeIn_0.3s_ease]">
      <div className="mb-4">
        <h1 className="text-[28px] font-extrabold text-[#a0522d] m-0">Quản trị đơn hàng</h1>
        <p className="text-xs text-[#8b7d6a] mt-1">Quản lý tổng quan tất cả đơn hàng trên nền tảng dành cho admin tổng.</p>
      </div>

      {/* Grid of 7 Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        {/* Card 1: Tổng đơn */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-stone-400 rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Tổng đơn hàng</span>
          <span className="text-xl font-black mt-1 text-stone-900">{summary.total}</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Toàn hệ thống</span>
        </div>

        {/* Card 2: Đơn chờ xử lý */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-orange-500 rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Chờ xử lý</span>
          <span className="text-xl font-black mt-1 text-stone-900">{summary.pending}</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Chờ xác nhận</span>
        </div>

        {/* Card 3: Shop đã xử lý */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-lime-500 rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Shop đã xử lý</span>
          <span className="text-xl font-black mt-1 text-stone-900">{summary.shopProcessed}</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Đã xác nhận</span>
        </div>

        {/* Card 4: Đang giao */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-amber-500 rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Đang giao</span>
          <span className="text-xl font-black mt-1 text-stone-900">{summary.shipping}</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Đang vận chuyển</span>
        </div>

        {/* Card 5: Đã giao */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-blue-500 rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Đã giao</span>
          <span className="text-xl font-black mt-1 text-stone-900">{summary.completed}</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Giao thành công</span>
        </div>

        {/* Card 6: Đã hủy */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-rose-500 rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Đã hủy</span>
          <span className="text-xl font-black mt-1 text-stone-900">{summary.cancelled}</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Đơn đã hủy</span>
        </div>

        {/* Card 7: Tổng doanh thu */}
        <div 
          className="flex flex-col justify-between min-h-[90px] transition-all hover:scale-[1.02] bg-white border border-[#e8e5e0] border-l-[4px] border-l-[#c85a28] rounded-xl p-3.5 shadow-sm"
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">Doanh thu</span>
          <span className="text-base font-black mt-1 text-[#c85a28] truncate">{summary.revenue?.toLocaleString("vi-VN")} đ</span>
          <span className="text-[9px] text-stone-400 mt-1 font-medium">Đơn hoàn tất</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#fbf7e6] border border-[#efe3ca] rounded-[18px] p-4 flex flex-col md:flex-row gap-3.5 items-stretch md:items-center mb-[18px]">
        <div className="flex-1 min-w-0">
          <input
            type="text"
            placeholder="Tìm theo ID, Khách hàng, Tên Shop..."
            value={searchTerm}
            className="w-full py-2.5 px-4 border border-[#e8dfd5] rounded-full text-[13px] text-[#5a4a3a] bg-[#f3efcf] focus:outline-none focus:border-[#c85a28] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,90,40,0.1)]"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-[150px] min-w-0">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full py-2.5 pr-8 pl-3.5 border border-[#e8dfd5] rounded-xl bg-[#f3efcf] text-[#8b5a3c] font-semibold cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:11px] transition-all hover:bg-[#efe9c3] hover:border-[#c85a28] focus:outline-none focus:border-[#c85a28] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,90,40,0.1)] bg-[image:url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238b5a3c\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e')]"
          >
            <option value="all">Tất cả ngày</option>
            <option value="today">Hôm nay</option>
            <option value="this_week">Tuần này</option>
            <option value="this_month">Tháng này</option>
            <option value="custom">Chọn khoảng ngày...</option>
          </select>
        </div>
        {dateFilter === "custom" && (
          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 animate-[fadeIn_0.2s_ease]">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              onFocus={(e) => e.target.showPicker?.()}
              className="py-1.5 px-2.5 border border-[#e8dfd5] rounded-xl bg-[#f3efcf] text-[#8b5a3c] font-semibold text-xs outline-none focus:border-[#c85a28] focus:bg-white cursor-pointer"
              style={{ minHeight: '38px' }}
            />
            <span className="text-[#8b5a3c] text-xs font-bold shrink-0">đến</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onClick={(e) => e.target.showPicker?.()}
              onFocus={(e) => e.target.showPicker?.()}
              className="py-1.5 px-2.5 border border-[#e8dfd5] rounded-xl bg-[#f3efcf] text-[#8b5a3c] font-semibold text-xs outline-none focus:border-[#c85a28] focus:bg-white cursor-pointer"
              style={{ minHeight: '38px' }}
            />
          </div>
        )}
        <div className="w-full md:w-[150px] min-w-0">
          <select
            value={shopFilter}
            onChange={(e) => setShopFilter(e.target.value)}
            className="w-full py-2.5 pr-8 pl-3.5 border border-[#e8dfd5] rounded-xl bg-[#f3efcf] text-[#8b5a3c] font-semibold cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:11px] transition-all hover:bg-[#efe9c3] hover:border-[#c85a28] focus:outline-none focus:border-[#c85a28] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,90,40,0.1)] bg-[image:url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238b5a3c\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e')]"
          >
            <option value="all">Tất cả Shop</option>
            {uniqueShops.map((shopName) => (
              <option key={shopName} value={shopName}>
                {shopName}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-[150px] min-w-0">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full py-2.5 pr-8 pl-3.5 border border-[#e8dfd5] rounded-xl bg-[#f3efcf] text-[#8b5a3c] font-semibold cursor-pointer appearance-none bg-no-repeat bg-[right_12px_center] bg-[size:11px] transition-all hover:bg-[#efe9c3] hover:border-[#c85a28] focus:outline-none focus:border-[#c85a28] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,90,40,0.1)] bg-[image:url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg' width=\'14\' height=\'14\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%238b5a3c\' stroke-width=\'2.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e')]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[2000]" onClick={() => setShowDetailModal(false)}>
          <div className="relative bg-white p-5 md:p-[30px] rounded-2xl max-w-[700px] w-[90%] max-h-[90vh] overflow-y-auto shadow-[0_16px_30px_rgba(0,0,0,0.15)] border border-[#e8dfd5]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-none border-none text-[#8b5a3c] cursor-pointer p-1 flex items-center justify-center rounded-full transition-all hover:bg-[#faf6f0] hover:text-[#c85a28]" onClick={() => setShowDetailModal(false)} title="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
              </svg>
            </button>
            <h2 className="m-0 mb-5 text-[#a0522d] text-xl font-extrabold">Chi tiết đơn hàng #{selectedOrder.id}</h2>

            <div className="mb-5">
              <div className="mb-[22px] pb-[15px] border-b border-[#e8dfd5] last:border-b-0">
                <h3 className="text-[13px] font-bold text-[#a0522d] m-0 mb-3.5 uppercase tracking-wider">Thông tin đơn hàng</h3>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Mã đơn hàng:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">#{selectedOrder.id}</span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Ngày tạo:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">
                    {new Date(selectedOrder.createdAt).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Trạng thái:</span>
                  <span className={getStatusBadgeClass(selectedOrder.status)}>
                    {statusLabels[selectedOrder.status] || selectedOrder.status}
                  </span>
                </div>
              </div>

              <div className="mb-[22px] pb-[15px] border-b border-[#e8dfd5] last:border-b-0">
                <h3 className="text-[13px] font-bold text-[#a0522d] m-0 mb-3.5 uppercase tracking-wider">Khách hàng</h3>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Tên:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Email:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">{selectedOrder.customerEmail}</span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Điện thoại:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">{selectedOrder.customerPhone}</span>
                </div>
              </div>

              <div className="mb-[22px] pb-[15px] border-b border-[#e8dfd5] last:border-b-0">
                <h3 className="text-[13px] font-bold text-[#a0522d] m-0 mb-3.5 uppercase tracking-wider">Địa chỉ giao hàng</h3>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Địa chỉ:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">{selectedOrder.shippingAddress}</span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Thành phố:</span>
                  <span className="text-[#5a4a3a] font-medium text-right">{selectedOrder.shippingCity}</span>
                </div>
              </div>

              <div className="mb-[22px] pb-[15px] border-b border-[#e8dfd5] last:border-b-0">
                <h3 className="text-[13px] font-bold text-[#a0522d] m-0 mb-3.5 uppercase tracking-wider">Sản phẩm</h3>
                <table className="w-full border-collapse my-2.5">
                  <thead>
                    <tr className="bg-[#f5e6d3]">
                      <th className="p-2.5 text-left font-bold text-[#8b5a3c] text-xs border-b border-[#e8dfd5]">Tên sản phẩm</th>
                      <th className="p-2.5 text-left font-bold text-[#8b5a3c] text-xs border-b border-[#e8dfd5]">Giá</th>
                      <th className="p-2.5 text-left font-bold text-[#8b5a3c] text-xs border-b border-[#e8dfd5]">Số lượng</th>
                      <th className="p-2.5 text-left font-bold text-[#8b5a3c] text-xs border-b border-[#e8dfd5]">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 border-b border-[#e8dfd5] text-xs text-[#5a4a3a]">{item.productName}</td>
                        <td className="p-2.5 border-b border-[#e8dfd5] text-xs text-[#5a4a3a]">{item.price?.toLocaleString("vi-VN")} đ</td>
                        <td className="p-2.5 border-b border-[#e8dfd5] text-xs text-[#5a4a3a]">{item.quantity}</td>
                        <td className="p-2.5 border-b border-[#e8dfd5] text-xs font-bold text-[#c85a28]">
                          {(item.price * item.quantity)?.toLocaleString("vi-VN")} đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mb-[22px] pb-[15px] border-b border-[#e8dfd5] last:border-b-0">
                <h3 className="text-[13px] font-bold text-[#a0522d] m-0 mb-3.5 uppercase tracking-wider">Tóm tắt thanh toán</h3>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Tổng sản phẩm:</span>
                  <span className="text-[#5a4a3a] font-medium text-right text-[13px]">
                    {selectedOrder.subtotal?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Phí vận chuyển:</span>
                  <span className="text-[#5a4a3a] font-medium text-right text-[13px]">
                    {selectedOrder.shipping?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between gap-[18px] py-2 text-[13px]">
                  <span className="text-[#9b6e4e] font-semibold min-w-[150px]">Giảm giá:</span>
                  <span className="text-[#5a4a3a] font-medium text-right text-[13px]">
                    -{selectedOrder.discount?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="flex justify-between gap-[18px] py-2.5 border-t border-b border-[#e8dfd5] my-2 font-bold text-[13px]">
                  <span className="text-[#9b6e4e] font-bold min-w-[150px]">Tổng cộng:</span>
                  <span className="text-[#5a4a3a] font-bold text-right">
                    {selectedOrder.total?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 flex-wrap flex-col md:flex-row">
              <select
                defaultValue={selectedOrder.status}
                onChange={(e) => {
                  handleUpdateStatus(selectedOrder.id, e.target.value);
                  setShowDetailModal(false);
                }}
                className="flex-1 min-w-[200px] py-2.5 px-3 border border-[#e8dfd5] rounded-xl text-[13px] cursor-pointer bg-[#faf6f0] transition-colors focus:outline-none focus:border-[#c85a28] focus:bg-white focus:shadow-[0_0_0_3px_rgba(200,90,40,0.1)] text-[#8b5a3c] w-full md:w-auto"
              >
                <option value="">Chọn trạng thái mới</option>
                {statusOptions
                  .filter((option) => option.value !== "all")
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
              <button
                className="py-2.5 px-5 bg-[#d9534f] hover:bg-[#c9302c] text-white border-none rounded-xl font-bold text-[13px] transition-colors cursor-pointer w-full md:w-auto"
                onClick={() => {
                  handleCancelOrder(selectedOrder.id);
                  setShowDetailModal(false);
                }}
              >
                Hủy đơn hàng
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[18px] shadow-[0_8px_18px_rgba(156,117,78,0.08)] p-[18px] border border-[#e8dfd5] flex-1 min-h-0 overflow-hidden">
        {loading ? (
          <div className="text-center py-10 px-5 text-[#9b6e4e] text-sm">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="text-center py-10 px-5 text-sm text-[#d9534f]">Lỗi: {error}</div>
        ) : filteredOrders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-3 text-xs md:text-sm">
                <thead>
                  <tr className="bg-[#f8f2d4]">
                    <th className="p-3.5 px-3 text-left font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">MÃ ĐƠN HÀNG</th>
                    <th className="p-3.5 px-3 text-left font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">KHÁCH HÀNG</th>
                    <th className="p-3.5 px-3 text-left font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">CỬA HÀNG</th>
                    <th className="p-3.5 px-3 text-left font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">NGÀY ĐẶT</th>
                    <th className="p-3.5 px-3 text-left font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">TỔNG TIỀN</th>
                    <th className="p-3.5 px-3 text-left font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">TRẠNG THÁI</th>
                    <th className="p-3.5 px-3 text-center font-semibold text-[#8b5a3c] text-[12px] border-b border-[#e8dfd5] uppercase tracking-wider">HÀNH ĐỘNG</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#faf6f0]">
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-[#c85a28] font-extrabold align-middle">#TC-{order.id}</td>
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px] align-middle">
                        <div className="flex items-center gap-2.5 flex-col md:flex-row md:items-center items-start">
                          <div className="w-[30px] h-[30px] rounded-full bg-[#f1e1bf] text-[#a0522d] grid place-items-center text-[11px] font-extrabold shrink-0">
                            {(order.customerName || "U").slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[#403126] font-bold">{order.customerName}</span>
                            <span className="text-[11px] text-[#9b6e4e]">{order.customerPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px] align-middle font-bold text-[#8b5a3c]">
                        {order.shopName || "N/A"}
                      </td>
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px] align-middle">{new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-[#5a4a3a] font-bold text-[13px] align-middle">{order.total?.toLocaleString("vi-VN")} đ</td>
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px] align-middle">
                        <span className={getStatusBadgeClass(order.status)}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="p-3.5 px-3 border-b border-[#e8dfd5] text-center align-middle whitespace-nowrap">
                        <div className="flex gap-3 justify-center items-center">
                          <button
                            className="bg-none border-none w-7 h-7 rounded-full inline-grid place-items-center text-base cursor-pointer p-0 transition-transform duration-300 text-[#8b5a3c] hover:-translate-y-[1px] hover:scale-105 hover:bg-[#faf0df]"
                            onClick={() => handleViewDetails(order)}
                            title="Xem chi tiết"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                              <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z" />
                            </svg>
                          </button>
                          {order.status !== "cancelled" && order.status !== "done" && (
                            <button
                              className="bg-none border-none w-7 h-7 rounded-full inline-grid place-items-center text-base cursor-pointer p-0 transition-transform duration-300 text-[#8b5a3c] hover:-translate-y-[1px] hover:scale-105 hover:bg-[#faf0df]"
                              onClick={() => handleCancelOrder(order.id)}
                              title="Hủy đơn hàng"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
              <div className="text-stone-400 text-xs font-semibold">
                Hiển thị {filteredOrders.length > 0 ? (page - 1) * 50 + 1 : 0} - {Math.min(page * 50, filteredOrders.length)} đơn hàng trong tổng số {filteredOrders.length}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 bg-white border border-stone-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 rounded-xl font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-9 h-9 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center border ${
                      page === pNum
                        ? "bg-[#c85a28] text-white border-[#c85a28] shadow-sm"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 bg-white border border-stone-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 rounded-xl font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-10 px-5 text-[#9b6e4e] text-sm">Chưa có đơn hàng nào</div>
        )}
      </div>
    </div>
  );
}
