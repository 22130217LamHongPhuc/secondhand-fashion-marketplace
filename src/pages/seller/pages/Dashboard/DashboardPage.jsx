import { useState } from 'react';
import { useSellerDashboard } from '../../hooks';
import {
  ShoppingCart,
} from 'lucide-react';

/* ============================================================
   COMPONENT
   ============================================================ */
const DashboardPage = () => {
  const [periodMode, setPeriodMode] = useState('preset'); // 'preset' | 'custom'
  const [revenuePeriod, setRevenuePeriod] = useState('30_DAYS');

  // Default custom range: last 30 days
  const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const queryParams = periodMode === 'custom'
    ? { startDate, endDate }
    : { revenuePeriod };

  const { data, isLoading, error } = useSellerDashboard(queryParams);

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

      {/* ── Row 2: Revenue & Visitors ── */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue & Visitors Chart */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <h2 className="font-heading text-lg font-bold text-neutral-800">
              Doanh thu theo thời gian
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Tab: Preset options */}
              <div className="flex items-center bg-neutral-100 p-1 rounded-full border border-neutral-200">
                <button
                  onClick={() => {
                    setPeriodMode('preset');
                    setRevenuePeriod('7_DAYS');
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    periodMode === 'preset' && revenuePeriod === '7_DAYS'
                      ? 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  7 ngày
                </button>
                <button
                  onClick={() => {
                    setPeriodMode('preset');
                    setRevenuePeriod('30_DAYS');
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    periodMode === 'preset' && revenuePeriod === '30_DAYS'
                      ? 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  30 ngày
                </button>
                <button
                  onClick={() => {
                    setPeriodMode('preset');
                    setRevenuePeriod('90_DAYS');
                  }}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    periodMode === 'preset' && revenuePeriod === '90_DAYS'
                      ? 'bg-white text-neutral-800 shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-800'
                  }`}
                >
                  90 ngày
                </button>
              </div>

              {/* Tab: Khoảng ngày */}
              <button
                onClick={() => {
                  setPeriodMode('custom');
                }}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-all border border-neutral-200 cursor-pointer ${
                  periodMode === 'custom'
                    ? 'bg-accent-yellow border-accent-yellow/40 text-gray-700 shadow-sm'
                    : 'bg-white text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
                }`}
              >
                Khoảng ngày
              </button>

              {/* Date pickers (only when in custom mode) */}
              {periodMode === 'custom' && (
                <div className="flex items-center gap-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Từ</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Đến</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}
            </div>
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


      {/* ── Row 3: Category Revenue ── */}
      <div className="grid grid-cols-1 gap-6">
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
      </div>
    </div>
    </div>
  );
};

export default DashboardPage;
