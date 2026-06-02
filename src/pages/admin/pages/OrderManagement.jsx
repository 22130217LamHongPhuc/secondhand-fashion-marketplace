import { useEffect, useMemo, useState } from "react";
import { orderService } from "@/services/admin";
import { OrderDetailView } from "./OrderDetailView";
import "./OrderManagement.css";

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
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const filters = statusFilter !== "all" ? { status: statusFilter } : {};
      const response = await orderService.getAll(page, 10, filters).catch(() => null);
      
      const rawData = response?.data || response || {};
      const apiOrders = rawData.data || rawData.content || rawData.items || (Array.isArray(rawData) ? rawData : []);
      const fallbackOrders = page === 1 && statusFilter === "all" && apiOrders.length === 0 ? demoOrders : [];
      const ordersToSet = apiOrders.length > 0 ? apiOrders : fallbackOrders;
      const normalizedOrders = ordersToSet.map(order => ({
        ...order,
        status: order.status ? order.status.toLowerCase() : order.status
      }));
      setOrders(normalizedOrders);
      setTotalPages(rawData.totalPages || rawData.total_pages || 1);
      setError(null);
    } catch (err) {
      if (page === 1 && statusFilter === "all") {
        setOrders(demoOrders);
        setTotalPages(1);
      } else {
        setError(err.message);
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, newStatus);
      alert("Cập nhật trạng thái đơn hàng thành công!");
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
        loadOrders();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleExport = async (format) => {
    try {
      const blob = await orderService.export(format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const statusOptions = [
    { value: "all", label: "Tất cả" },
    { value: "pending", label: "Chờ giao" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "shipping", label: "Đang giao" },
    { value: "done", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  const filteredOrders = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesSearch =
        !keyword ||
        String(order.id).includes(keyword) ||
        (order.customerName || "").toLowerCase().includes(keyword) ||
        (order.customerEmail || "").toLowerCase().includes(keyword);

      const today = new Date();
      const createdAt = new Date(order.createdAt);
      const sameDay =
        today.getFullYear() === createdAt.getFullYear() &&
        today.getMonth() === createdAt.getMonth() &&
        today.getDate() === createdAt.getDate();
      const matchesDate = dateFilter === "all" || (dateFilter === "today" ? sameDay : true);

      return matchesSearch && matchesDate;
    });
  }, [orders, searchTerm, dateFilter]);

  const summary = {
    totalProcessing: filteredOrders.filter((order) => ["pending", "confirmed"].includes(order.status)).length,
    totalOrders: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.total || 0), 0),
  };

  if (selectedOrder) {
    return (
      <OrderDetailView
        order={selectedOrder}
        onBack={() => {
          setSelectedOrder(null);
          setShowDetailModal(false);
        }}
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelOrder}
      />
    );
  }

  return (
    <div className="order-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản trị đơn hàng</h1>
        </div>
      </div>

      <div className="toolbar-row">
        <div className="search-panel">
          <div className="search-box order-search">
            <input
              type="text"
              placeholder="Tìm theo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group compact">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="toolbar-select"
            >
              <option value="today">Hôm nay</option>
              <option value="all">Tất cả ngày</option>
            </select>
          </div>
          <div className="filter-group compact">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="toolbar-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button className="filter-toggle" type="button" title="Lọc">
            ☰
          </button>
        </div>

        <div className="summary-card">
          <div className="summary-title">Đơn chờ xử lý</div>
          <div className="summary-number">{summary.totalProcessing}</div>
          <div className="summary-subtitle">Cần giao trước 15:00 hôm nay</div>
        </div>
      </div>

      {showDetailModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowDetailModal(false)} title="Đóng">
              <svg xmlns="http://www.w3.org/2000/svg" height="22" viewBox="0 -960 960 960" width="22" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </button>
            <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>

            <div className="order-detail-body">
              <div className="detail-section">
                <h3>Thông tin đơn hàng</h3>
                <div className="detail-item">
                  <span className="label">ID:</span>
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
                  <span className="label">Tên:</span>
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
                <div className="detail-item">
                  <span className="label">Thành phố:</span>
                  <span className="value">{selectedOrder.shippingCity}</span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Sản phẩm</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Tên sản phẩm</th>
                      <th>Giá</th>
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
                  <span className="label">Tổng sản phẩm:</span>
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
                  <span className="label">Giảm giá:</span>
                  <span className="value">
                    -{selectedOrder.discount?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
                <div className="detail-item total-item">
                  <span className="label">Tổng cộng:</span>
                  <span className="value">
                    {selectedOrder.total?.toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <select
                defaultValue={selectedOrder.status}
                onChange={(e) => {
                  handleUpdateStatus(selectedOrder.id, e.target.value);
                  setShowDetailModal(false);
                }}
                className="status-select"
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
                className="btn btn-danger"
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

      <div className="orders-section">
        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="error">Lỗi: {error}</div>
        ) : filteredOrders.length > 0 ? (
          <>
            <table className="orders-table">
              <thead>
                <tr>
                  <th>MÃ ĐƠN HÀNG</th>
                  <th>KHÁCH HÀNG</th>
                  <th>NGÀY ĐẶT</th>
                  <th>TỔNG TIỀN</th>
                  <th>TRẠNG THÁI</th>
                  <th>HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#TC-{order.id}</td>
                    <td className="customer-cell">
                      <div className="customer-avatar">{(order.customerName || "U").slice(0, 2).toUpperCase()}</div>
                      <div className="customer-meta">
                        <span className="customer-name">{order.customerName}</span>
                        <span className="customer-phone">{order.customerPhone}</span>
                      </div>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</td>
                    <td className="order-total">{order.total?.toLocaleString("vi-VN")} đ</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-wrapper">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewDetails(order)}
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                            <path d="M480-320q75 0 127.5-52.5T660-500q0-75-52.5-127.5T480-680q-75 0-127.5 52.5T300-500q0 75 52.5 127.5T480-320Zm0-72q-45 0-76.5-31.5T372-500q0-45 31.5-76.5T480-608q45 0 76.5 31.5T588-500q0 45-31.5 76.5T480-392Zm0 192q-146 0-266-81.5T40-500q54-137 174-218.5T480-800q146 0 266 81.5T920-500q-54 137-174 218.5T480-200Zm0-300Zm0 220q113 0 207.5-59.5T832-500q-50-101-144.5-160.5T480-720q-113 0-207.5 59.5T128-500q50 101 144.5 160.5T480-280Z"/>
                          </svg>
                        </button>
                        {order.status !== "cancelled" && order.status !== "done" && (
                          <button
                            className="btn-icon btn-cancel"
                            onClick={() => handleCancelOrder(order.id)}
                            title="Hủy đơn hàng"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor">
                              <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Sau
              </button>
            </div>
            <div className="table-footer">
              Hiển thị {filteredOrders.length > 0 ? (page - 1) * 10 + 1 : 0} - {(page - 1) * 10 + filteredOrders.length} đơn hàng
            </div>
          </>
        ) : (
          <div className="empty-state">Chưa có đơn hàng nào</div>
        )}
      </div>
    </div>
  );
}
