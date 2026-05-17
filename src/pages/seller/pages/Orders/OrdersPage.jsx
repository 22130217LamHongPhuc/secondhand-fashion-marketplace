import { useState } from 'react';
import { Eye, SquarePen, Truck, CircleCheck, CircleX, ChevronLeft, ChevronRight } from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */
const orders = [
  {
    id: '#TC12345',
    customer: 'Trần Minh Thư',
    initials: 'NH',
    initialsColor: 'bg-[#f5c9a8] text-[#8b3a1a]',
    date: '12/10/2023',
    total: '1,250,000đ',
    status: 'Chờ xác nhận',
  },
  {
    id: '#TC12346',
    customer: 'Trần Minh Thư',
    initials: 'TM',
    initialsColor: 'bg-[#c8e6c9] text-[#2e7d32]',
    date: '11/10/2023',
    total: '890,000đ',
    status: 'Chờ xác nhận',
  },
  {
    id: '#TC12347',
    customer: 'Lê Quang Đại',
    initials: 'LQ',
    initialsColor: 'bg-[#ffe0b2] text-[#e65100]',
    date: '10/10/2023',
    total: '2,100,000đ',
    status: 'Chờ xác nhận',
  },
];

const statusTabs = [
  { label: 'Chờ xác nhận', count: 12, icon: null },
  { label: 'Đang giao', count: null, icon: Truck },
  { label: 'Hoàn thành', count: null, icon: CircleCheck },
  { label: 'Đã hủy', count: null, icon: CircleX },
];

/* ============================================================
   COMPONENT
   ============================================================ */
const OrdersPage = () => {
  const [activeTab, setActiveTab] = useState(0);

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
              onClick={() => setActiveTab(i)}
              className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-primary text-white shadow-md'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700'
              }`}
            >
              {Icon && <Icon size={15} strokeWidth={1.8} />}
              <span>{tab.label}</span>
              {tab.count && isActive && (
                <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-white/25 px-1.5 text-[11px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Mã đơn<br />hàng
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
                Trạng<br />thái
              </th>
              <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o.id}
                className="border-b border-neutral-50 transition-colors hover:bg-brand-bg/40"
              >
                {/* Order ID */}
                <td className="px-6 py-6">
                  <span className="text-sm font-bold text-brand-primary">{o.id}</span>
                </td>

                {/* Customer */}
                <td className="px-6 py-6">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${o.initialsColor}`}>
                      {o.initials}
                    </div>
                    <span className="text-sm font-medium text-neutral-700">{o.customer}</span>
                  </div>
                </td>

                {/* Date */}
                <td className="px-6 py-6 text-sm text-neutral-500">{o.date}</td>

                {/* Total */}
                <td className="px-6 py-6">
                  <span className="text-sm font-bold text-brand-primary">{o.total}</span>
                </td>

                {/* Status Badge */}
                <td className="px-6 py-6 text-center">
                  <span className="inline-block rounded-full border border-[#f5c9a8] bg-[#fef0e4] px-3.5 py-1 text-xs font-medium text-[#8b3a1a]">
                    {o.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-6">
                  <div className="flex items-center justify-center gap-2">
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
                      <Eye size={18} />
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-primary/10 text-brand-primary transition-colors hover:bg-brand-primary/20">
                      <SquarePen size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4">
          <p className="text-sm text-neutral-400">
            Hiển thị 1-3 trong số 12 đơn hàng
          </p>
          <div className="flex items-center gap-2">
            {/* Prev */}
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-300">
              <ChevronLeft size={18} />
            </button>
            {/* Page numbers */}
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  n === 1
                    ? 'bg-accent-green text-white shadow-sm'
                    : 'text-neutral-500 hover:bg-neutral-100'
                }`}
              >
                {n}
              </button>
            ))}
            {/* Next */}
            <button className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
