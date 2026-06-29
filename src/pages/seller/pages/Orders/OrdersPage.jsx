import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  Truck,
  CircleCheck,
  CircleX,
  ChevronLeft,
  ChevronRight,
  Check,
  Search,
  ChevronDown,
} from "lucide-react";
import {
  useSellerOrdersByStatus,
  useConfirmOrder,
  useStartDelivery,
  useCompleteOrder,
  useCancelOrder,
} from "../../hooks";
import { toastService } from "@/services/toastService";
import { Pagination } from "../../models";
import TableSkeleton from "../../components/common/TableSkeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import AdvancedFilter from "../../components/common/AdvancedFilter";

const statusTabs = [
  { label: "Tất cả", id: "ALL", icon: null },
  { label: "Chờ xác nhận", id: "PENDING", icon: null },
  { label: "Đã xác nhận", id: "CONFIRMED", icon: Check },
  { label: "Đang giao", id: "SHIPPING", icon: Truck },
  { label: "Hoàn thành", id: "DONE", icon: CircleCheck },
  { label: "Đã hủy", id: "CANCELLED", icon: CircleX },
];

const getStatusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "border-[#f5c9a8] bg-[#fef0e4] text-[#8b3a1a]";
    case "CONFIRMED":
      return "border-brand-primary/30 bg-brand-primary/10 text-brand-primary";
    case "SHIPPING":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "DONE":
      return "border-accent-green/30 bg-accent-green-light text-accent-green";
    case "CANCELLED":
      return "border-accent-red/30 bg-accent-red-light text-accent-red";
    default:
      return "border-neutral-200 bg-neutral-50 text-neutral-600";
  }
};

const getInitialsColor = (id) => {
  const colors = [
    "bg-[#f5c9a8] text-[#8b3a1a]",
    "bg-[#c8e6c9] text-[#2e7d32]",
    "bg-[#ffe0b2] text-[#e65100]",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
  ];
  return colors[(id || 0) % colors.length];
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedOrderCode, setDebouncedOrderCode] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [sortBy, setSortBy] = useState("newest");

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedOrderCode(searchInput.trim());
      setCurrentPage(0); // Reset page khi tìm kiếm thay đổi
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams = {
    page: currentPage,
    sortBy,
  };
  const activeStatus = statusTabs[activeTab].id;
  if (activeStatus !== "ALL") {
    queryParams.status = activeStatus;
  }
  if (debouncedOrderCode) {
    queryParams.orderCode = debouncedOrderCode;
  }
  
  if (advancedFilters.fromDate) queryParams.fromDate = advancedFilters.fromDate;
  if (advancedFilters.toDate) queryParams.toDate = advancedFilters.toDate;
  if (advancedFilters.minPrice !== undefined) queryParams.minPrice = advancedFilters.minPrice;
  if (advancedFilters.maxPrice !== undefined) queryParams.maxPrice = advancedFilters.maxPrice;

  const {
    data,
    isLoading: loading,
    error,
  } = useSellerOrdersByStatus(queryParams);
  const orders = data?.orders ?? [];
  const pagination = data?.pagination ?? Pagination.empty();

  const getPages = () => {
    const total = pagination.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i);
    }
    
    let start = 0;
    if (currentPage <= 1) {
      start = 0;
    } else if (currentPage >= total - 3) {
      start = total - 3;
    } else {
      start = currentPage;
    }
    
    const pages = [start, start + 1, start + 2];
    if (start + 2 < total - 1) {
      pages.push("...");
      pages.push(total - 1);
    }
    return pages;
  };

  const { mutateAsync: confirmOrder } = useConfirmOrder();
  const { mutateAsync: startDelivery } = useStartDelivery();
  const { mutateAsync: completeOrder } = useCompleteOrder();
  const { mutateAsync: cancelOrder } = useCancelOrder();

  const handleTabChange = (index) => {
    setActiveTab(index);
    setCurrentPage(0);
  };

  const handleAction = async (orderId, actionStr) => {
    try {
      if (actionStr === "confirm") await confirmOrder(orderId);
      if (actionStr === "delivery") await startDelivery(orderId);
      if (actionStr === "complete") await completeOrder(orderId);
      if (actionStr === "cancel") {
        const reason = window.prompt("Nhập lý do hủy đơn hàng:");
        if (reason === null) return; // User cancelled prompt
        await cancelOrder({
          id: orderId,
          reason: reason || "Người bán hủy đơn",
        });
      }

      toastService.success("Thao tác thành công");
    } catch (e) {
      toastService.error("Thao tác thất bại: " + (e?.message || e));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="font-heading text-3xl font-bold text-neutral-800">
        Quản lý đơn hàng
      </h1>

      {/* Search + Filter Tabs */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-70">
          <Search
            size={16}
            className="absolute left-3.5 top-6.5 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm mã đơn hàng..."
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-1">
          {statusTabs.map((tab, i) => {
            const Icon = tab.icon;
            const isActive = activeTab === i;

            return (
              <div
                key={tab.label}
                onClick={() => handleTabChange(i)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium cursor-pointer transition-all ${isActive
                  ? "bg-accent-yellow text-gray-600 shadow-md"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                  }`}
              >
                {Icon && <Icon size={15} strokeWidth={1.8} />}
                <span>{tab.label}</span>
              </div>
            );
          })}
        </div>

        {/* Sort By Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(0);
            }}
            className="appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-neutral-600 outline-none transition-all hover:bg-neutral-50 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <AdvancedFilter onApply={(filters) => { setAdvancedFilters(filters); setCurrentPage(0); }} />

      {/* Data Area */}
      {loading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : error ? (
        <ErrorState message={error.message || error} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="Không có đơn hàng"
          description="Chưa có đơn hàng nào trong trạng thái này."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Mã đơn hàng
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Khách hàng
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Ngày đặt
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Tổng tiền
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => {
                const customerName = o.customerName || "Khách hàng";
                const initials = customerName.substring(0, 2).toUpperCase();

                return (
                  <tr
                    key={o.id}
                    className="border-b border-neutral-50 transition-colors hover:bg-brand-bg/40"
                  >
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-brand-primary">
                        {o.orderCode}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getInitialsColor(o.id)}`}
                        >
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-neutral-700">
                          {customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-neutral-500">
                      {o.formattedDate}
                    </td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-brand-primary">
                        {o.formattedTotal}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span
                        className={`inline-block rounded-full border px-3.5 py-1 text-xs font-medium ${getStatusColor(o.status)}`}
                      >
                        {o.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/seller/orders/${o.id}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                        >
                          <Eye size={18} />
                        </button>

                        {/* Dynamic Actions based on status */}
                        {o.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleAction(o.id, "confirm")}
                              title="Xác nhận đơn"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors hover:bg-brand-primary/20"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => handleAction(o.id, "cancel")}
                              title="Hủy đơn"
                              className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-red-light text-accent-red transition-colors hover:bg-accent-red/20"
                            >
                              <CircleX size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {!pagination.isEmpty && (
            <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4">
              <p className="text-sm text-neutral-400">
                Hiển thị {pagination.startItem}-{pagination.endItem} trong số{" "}
                {pagination.totalElements} đơn hàng
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    disabled={!pagination.hasPrevious}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  {getPages().map((n, idx) => {
                    if (n === '...') {
                      return (
                        <div
                          key={`ellipsis-${idx}`}
                          className="flex h-9 w-9 items-center justify-center text-sm font-semibold text-neutral-400 select-none cursor-default"
                        >
                          ...
                        </div>
                      );
                    }
                    return (
                      <div
                        key={n}
                        onClick={() => setCurrentPage(n)}
                        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors hover:bg-neutral-150 cursor-pointer ${
                          currentPage === n
                            ? "bg-accent-yellow shadow-lg text-gray-700 font-bold"
                            : "text-neutral-500 hover:bg-neutral-100"
                        }`}
                      >
                        {n + 1}
                      </div>
                    );
                  })}
                  <button
                    disabled={!pagination.hasNext}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>

                {/* Page Jump Input */}
                <div className="flex items-center gap-2 border-l border-neutral-200 pl-4">
                  <span className="text-sm text-neutral-400">Đi đến trang:</span>
                  <input
                    type="number"
                    min={1}
                    max={pagination.totalPages}
                    placeholder={`1-${pagination.totalPages}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = parseInt(e.target.value, 10);
                        if (val >= 1 && val <= pagination.totalPages) {
                          setCurrentPage(val - 1);
                          e.target.value = "";
                        }
                      }
                    }}
                    className="w-16 rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-center text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
