import { useState, useEffect } from 'react';
import { Eye, Truck, CircleCheck, CircleX, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useSellerOrders } from '../../hooks';
import TableSkeleton from '../../components/common/TableSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const statusTabs = [
  { label: 'Chờ xác nhận', id: 'PENDING', icon: null },
  { label: 'Đang giao', id: 'SHIPPING', icon: Truck },
  { label: 'Hoàn thành', id: 'DONE', icon: CircleCheck },
  { label: 'Đã hủy', id: 'CANCELLED', icon: CircleX },
];

const getStatusColor = (status) => {
  switch(status) {
    case 'PENDING':
      return 'border-[#f5c9a8] bg-[#fef0e4] text-[#8b3a1a]';
    case 'CONFIRMED':
      return 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary';
    case 'SHIPPING':
      return 'border-blue-200 bg-blue-50 text-blue-700';
    case 'DONE':
      return 'border-accent-green/30 bg-accent-green-light text-accent-green';
    case 'CANCELLED':
      return 'border-accent-red/30 bg-accent-red-light text-accent-red';
    default:
      return 'border-neutral-200 bg-neutral-50 text-neutral-600';
  }
}

const getInitialsColor = (id) => {
  const colors = [
    'bg-[#f5c9a8] text-[#8b3a1a]',
    'bg-[#c8e6c9] text-[#2e7d32]',
    'bg-[#ffe0b2] text-[#e65100]',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
  ];
  return colors[(id || 0) % colors.length];
}

const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const { 
    orders, pagination, loading, error, 
    fetchOrdersByStatus, confirmOrder, startDelivery, completeOrder, cancelOrder 
  } = useSellerOrders();

  const loadData = (page) => {
    const status = statusTabs[activeTab].id;
    fetchOrdersByStatus({ status, page });
  };

  useEffect(() => {
    loadData(currentPage);
  }, [activeTab, currentPage]);

  const handleTabChange = (index) => {
    setActiveTab(index);
    setCurrentPage(0);
  };

  const handleAction = async (orderId, actionStr) => {
    try {
      if (actionStr === 'confirm') await confirmOrder(orderId);
      if (actionStr === 'delivery') await startDelivery(orderId);
      if (actionStr === 'complete') await completeOrder(orderId);
      if (actionStr === 'cancel') {
        const reason = window.prompt("Nhập lý do hủy đơn hàng:");
        if (reason === null) return; // User cancelled prompt
        await cancelOrder(orderId, reason || "Người bán hủy đơn");
      }
      
      alert('Thao tác thành công');
      loadData(currentPage); // reload
    } catch (e) {
      alert('Thao tác thất bại: ' + e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="font-heading text-3xl font-bold text-neutral-800">
        Quản lý đơn hàng
      </h1>

      {/* Status Tabs */}
      <div className="flex items-center gap-3">
        {statusTabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = activeTab === i;

          return (
            <button
              key={tab.label}
              onClick={() => handleTabChange(i)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary text-gray-600 shadow-md'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              }`}
            >
              {Icon && <Icon size={15} strokeWidth={1.8} />}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Data Area */}
      {loading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadData(currentPage)} />
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
                const customerName = o.shippingAddress?.fullName || 'Khách hàng';
                const initials = customerName.substring(0, 2).toUpperCase();
                
                return (
                  <tr
                    key={o.id}
                    className="border-b border-neutral-50 transition-colors hover:bg-brand-bg/40"
                  >
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-brand-primary">{o.orderCode}</span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${getInitialsColor(o.id)}`}>
                          {initials}
                        </div>
                        <span className="text-sm font-medium text-neutral-700">{customerName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-neutral-500">{o.formattedDate}</td>
                    <td className="px-6 py-6">
                      <span className="text-sm font-bold text-brand-primary">{o.formattedTotal}</span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <span className={`inline-block rounded-full border px-3.5 py-1 text-xs font-medium ${getStatusColor(o.status)}`}>
                        {o.statusLabel}
                      </span>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
                          <Eye size={18} />
                        </button>
                        
                        {/* Dynamic Actions based on status */}
                        {o.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleAction(o.id, 'confirm')} title="Xác nhận đơn" className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors hover:bg-brand-primary/20">
                              <Check size={16} />
                            </button>
                            <button onClick={() => handleAction(o.id, 'cancel')} title="Hủy đơn" className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-red-light text-accent-red transition-colors hover:bg-accent-red/20">
                              <CircleX size={16} />
                            </button>
                          </>
                        )}
                        {o.status === 'CONFIRMED' && (
                          <button onClick={() => handleAction(o.id, 'delivery')} title="Bắt đầu giao" className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 transition-colors hover:bg-blue-200">
                            <Truck size={16} />
                          </button>
                        )}
                        {o.status === 'SHIPPING' && (
                          <>
                            <button onClick={() => handleAction(o.id, 'complete')} title="Hoàn tất đơn" className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-green-light text-accent-green transition-colors hover:bg-accent-green/20">
                              <CircleCheck size={16} />
                            </button>
                            <button onClick={() => handleAction(o.id, 'cancel')} title="Hủy đơn" className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-red-light text-accent-red transition-colors hover:bg-accent-red/20">
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
                Hiển thị {pagination.startItem}-{pagination.endItem} trong số {pagination.totalElements} đơn hàng
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={!pagination.hasPrevious}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={18} />
                </button>
                {pagination.pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      currentPage === n
                        ? 'bg-accent-green text-white shadow-sm'
                        : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}
                <button 
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
