import { useState } from 'react';
import { useSellerDashboard } from '../../hooks';
import {
  ShoppingCart,
  Image,
  ClipboardList,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';

/* ============================================================
   COMPONENT
   ============================================================ */
const DashboardPage = () => {
  const [revenuePeriod, setRevenuePeriod] = useState('30_DAYS');
  const { data, isLoading, error } = useSellerDashboard({ revenuePeriod });

  if (isLoading) return <div className="p-8 text-center text-neutral-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>;

  const { summary, revenueChart, categoryBreakdown, recentNotifications } = data || {};

  return (
    <div className="space-y-6">
      {/* ── Row 1: Stat Cards ── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Card: Doanh thu tổng */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Doanh thu tổng
            </p>
            <span className="rounded-full bg-accent-green-light px-2.5 py-0.5 text-[11px] font-bold text-accent-green">
              {summary?.revenueGrowthPercentage > 0 ? '+' : ''}{summary?.revenueGrowthPercentage}%
            </span>
          </div>
          <p className="mt-3 font-heading text-[28px] font-bold text-brand-primary">
            {summary?.totalRevenue?.toLocaleString('vi-VN')}đ
          </p>
          {/* Mini bar chart */}
          <div className="mt-5 flex items-end gap-2 h-12">
            {summary?.revenueTrend?.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  backgroundColor: i === summary.revenueTrend.length - 1 ? '#6b3420' : '#f0cdb5',
                }}
              />
            ))}
          </div>
        </div>

        {/* Card: Đơn hàng mới */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Đơn hàng mới
            </p>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100">
              <ShoppingCart size={20} className="text-neutral-500" />
            </div>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-heading text-[56px] font-bold leading-none text-brand-primary">
              {String(summary?.pendingOrdersCount).padStart(2, '0')}
            </span>
            <span className="text-sm text-brand-primary">đơn chưa xử lý</span>
          </div>
          {/* Stacked avatars */}
          <div className="mt-4 flex items-center">
            {summary?.recentCustomerAvatars?.map((url, i) => (
              <img
                key={i}
                src={url}
                alt=""
                className="rounded-full border-2 border-white object-cover"
                style={{
                  height: 30,
                  width: 30,
                  marginLeft: i === 0 ? 0 : -8,
                  zIndex: 3 - i,
                  position: 'relative',
                }}
              />
            ))}
            {summary?.extraOrdersCount > 0 && (
              <span
                className="flex items-center justify-center rounded-full bg-accent-green text-[10px] font-bold text-white"
                style={{ height: 30, width: 30, marginLeft: -8, position: 'relative', zIndex: 0 }}
              >
                +{summary?.extraOrdersCount}
              </span>
            )}
          </div>
        </div>

        {/* Card: Sản phẩm đang bán */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            Sản phẩm đang bán
          </p>
          <div className="mt-4 flex items-center gap-5">
            {/* Donut ring */}
            <div className="relative flex h-18 w-18 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-18 w-18 -rotate-90">
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#fff8e1"
                  strokeWidth="3.5"
                />
                <circle
                  cx="18" cy="18" r="15"
                  fill="none"
                  stroke="#4caf50"
                  strokeWidth="3.5"
                  strokeDasharray={`${(summary?.activeProductsCount / Math.max(1, summary?.totalProducts)) * 100} 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center top-5">
                <span className="text-xl font-bold leading-none text-neutral-800">{summary?.totalProducts}</span>
                <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">Món</p>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-green" />
                <span className="text-sm text-neutral-600">Hoạt động ({summary?.activeProductsCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-yellow" />
                <span className="text-sm text-neutral-600">Chờ duyệt ({summary?.pendingProductsCount})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 2: Revenue Chart + Notifications (2:1) ── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Revenue over time */}
        <div className="col-span-2 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-neutral-800">
              Doanh thu theo thời gian
            </h2>
            <select
              value={revenuePeriod}
              onChange={(e) => setRevenuePeriod(e.target.value)}
              className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 outline-none cursor-pointer"
            >
              <option value="30_DAYS">30 ngày qua</option>
              <option value="7_DAYS">7 ngày qua</option>
              <option value="90_DAYS">90 ngày qua</option>
            </select>
          </div>

          {/* Bar chart */}
          <div className="mt-8 flex items-end gap-10 px-6" style={{ height: 200 }}>
            {revenueChart?.map((item) => {
              // Normalize chart heights for visual scaling
              const maxVal = Math.max(...revenueChart.map(i => Math.max(i.light, i.dark)), 1);
              const lightHeight = (item.light / maxVal) * 160;
              const darkHeight = (item.dark / maxVal) * 160;

              return (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex items-end justify-center gap-1.5 w-full">
                    <div
                      className="w-7 rounded-t-md transition-all duration-300"
                      style={{
                        height: `${Math.max(lightHeight, 2)}px`,
                        backgroundColor: '#f5dcc8',
                      }}
                    />
                    <div
                      className="w-7 rounded-t-md transition-all duration-300"
                      style={{
                        height: `${Math.max(darkHeight, 2)}px`,
                        backgroundColor: item.dark > item.light ? '#c75c2e' : '#f0c4a8',
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-bold text-neutral-800">
            Thông báo mới nhất
          </h2>
          <div className="mt-5 space-y-5">
            {recentNotifications?.map((n) => (
              <div key={n.id} className="flex gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.type === 'ORDER' ? 'bg-brand-primary' : 'bg-neutral-400'}`}>
                  {n.type === 'ORDER' ? <ShoppingBag size={18} className="text-white" /> : <MessageSquare size={18} className="text-white" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-neutral-700">{n.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">{n.desc}</p>
                  <p className="mt-1.5 text-[11px] text-neutral-300">{n.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 w-full rounded-xl border border-neutral-200 py-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-neutral-50">
            Xem tất cả
          </button>
        </div>
      </div>

      {/* ── Row 3: Category Revenue + Quick Actions (1:1) ── */}
      <div className="grid grid-cols-2 gap-6">
        {/* Category Revenue */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-bold text-neutral-800">
            Doanh thu theo danh mục
          </h2>
          <div className="mt-6 flex items-center gap-8">
            {/* Donut chart */}
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center">
              <svg viewBox="0 0 36 36" className="h-28 w-28 -rotate-90">
                {categoryBreakdown?.reduce(
                  (acc, item) => {
                    const dash = item.percent;
                    if (dash > 0) {
                      acc.elements.push(
                        <circle
                          key={item.label}
                          cx="18" cy="18" r="15.5"
                          fill="none"
                          stroke={item.color}
                          strokeWidth="3.5"
                          strokeDasharray={`${dash} ${100 - dash}`}
                          strokeDashoffset={`-${acc.offset}`}
                        />
                      );
                      acc.offset += dash;
                    }
                    return acc;
                  },
                  { elements: [], offset: 0 }
                ).elements}
              </svg>
              <span className="absolute text-xl font-bold text-neutral-800">100%</span>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {categoryBreakdown?.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm text-neutral-600 line-clamp-1">
                    {c.label} ({c.percent}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-bold text-neutral-800">
            Hành động nhanh
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Quản lý cửa hàng của bạn một cách tối ưu nhất.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4">
            {/* Card 1 */}
            <button className="group flex flex-col justify-between rounded-2xl bg-linear-to-br from-brand-primary to-[#8b3a1a] p-5 text-left text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ minHeight: 150 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <Image size={20} />
              </div>
              <div className="mt-auto">
                <p className="text-sm font-bold">Đăng sản phẩm mới</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  Bắt đầu giới thiệu bộ sưu tập mới của bạn
                </p>
              </div>
            </button>
            {/* Card 2 */}
            <button className="group flex flex-col justify-between rounded-2xl bg-linear-to-br from-brand-secondary to-brand-primary p-5 text-left text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              style={{ minHeight: 150 }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <ClipboardList size={20} />
              </div>
              <div className="mt-auto">
                <p className="text-sm font-bold">Xem danh sách đơn hàng</p>
                <p className="mt-1 text-xs leading-relaxed text-white/70">
                  Theo dõi tiến độ giao nhận và thanh toán
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
