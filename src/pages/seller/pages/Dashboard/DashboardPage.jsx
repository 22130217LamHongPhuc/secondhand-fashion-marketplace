import { useState } from 'react';
import { keepPreviousData } from '@tanstack/react-query';
import { useSellerDashboard, useCategoryBreakdown } from '../../hooks';
import {
  ShoppingCart,
} from 'lucide-react';
import { toastService } from '@/services/toastService';

/* ============================================================
   COMPONENT
   ============================================================ */
const formatMoneyShort = (amount) => {
  if (!amount) return '0';
  if (amount >= 1000000) return (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (amount >= 1000) return (amount / 1000).toFixed(1).replace('.0', '') + 'K';
  return amount.toLocaleString('vi-VN');
};

const DashboardPage = () => {
  const [periodMode, setPeriodMode] = useState('preset'); // 'preset' | 'custom'
  const [revenuePeriod, setRevenuePeriod] = useState('30_DAYS');

  const getNDaysAgo = (n) => {
    return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  };

  const today = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  const thirtyDaysAgo = getNDaysAgo(30);

  // States that actually trigger the react-query refetch:
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  // Temporary states for the date inputs to prevent immediate API calls on change:
  const [tempStartDate, setTempStartDate] = useState(thirtyDaysAgo);
  const [tempEndDate, setTempEndDate] = useState(today);

  const queryParams = periodMode === 'custom'
    ? { startDate, endDate }
    : { revenuePeriod };

  const { data, isLoading, isFetching, error } = useSellerDashboard(queryParams, {
    placeholderData: keepPreviousData,
  });

  const handleApplyCustomPeriod = () => {
    if (!tempStartDate || !tempEndDate) {
      toastService.warning('Vui lòng chọn đầy đủ ngày bắt đầu và ngày kết thúc.');
      return;
    }

    if (tempStartDate > tempEndDate) {
      toastService.warning('Ngày bắt đầu không được lớn hơn ngày kết thúc.');
      return;
    }

    if (tempStartDate > today || tempEndDate > today) {
      toastService.warning('Thời gian lọc không được vượt quá ngày hôm nay.');
      return;
    }

    setStartDate(tempStartDate);
    setEndDate(tempEndDate);
    setPeriodMode('custom');
  };

  // Category filter state — use "YYYY-MM" string for the month picker
  const nowDate = new Date();
  const defaultMonthValue = `${nowDate.getFullYear()}-${String(nowDate.getMonth() + 1).padStart(2, '0')}`;
  const [catMonthValue, setCatMonthValue] = useState(defaultMonthValue);

  const catMonth = parseInt(catMonthValue.split('-')[1], 10);
  const catYear = parseInt(catMonthValue.split('-')[0], 10);

  const maxMonthValue = defaultMonthValue; // Can't go beyond current month

  const { data: catData, isFetching: catFetching } = useCategoryBreakdown(
    { month: catMonth, year: catYear },
    { placeholderData: keepPreviousData }
  );
  const filteredCategoryBreakdown = catData ?? [];
  const catTotal = filteredCategoryBreakdown.reduce((sum, c) => sum + Number(c.revenue || 0), 0);

  const formatMoney = (amount) => {
    if (!amount) return '0đ';
    return Number(amount).toLocaleString('vi-VN') + 'đ';
  };

  // Expanded color palette for better chart contrast
  const PIE_COLORS = ['#c75c2e', '#2563eb', '#16a34a', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#65a30d', '#dc2626', '#6366f1'];

  if (isLoading) return <div className="p-8 text-center text-neutral-500">Đang tải dữ liệu...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>;

  const { summary, revenueChart, categoryBreakdown, recentNotifications } = data || {};

  return (
    <div className={`space-y-6 transition-opacity duration-300 ${isFetching ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
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
                    const start = getNDaysAgo(7);
                    setTempStartDate(start);
                    setTempEndDate(today);
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
                    const start = getNDaysAgo(30);
                    setTempStartDate(start);
                    setTempEndDate(today);
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
                    const start = getNDaysAgo(90);
                    setTempStartDate(start);
                    setTempEndDate(today);
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

              {/* Date pickers (always visible next to preset tabs) */}
              <div className="flex items-center gap-2 ml-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Từ</span>
                  <input
                    type="date"
                    value={tempStartDate}
                    max={today}
                    onChange={(e) => setTempStartDate(e.target.value)}
                    className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 outline-none focus:border-brand-primary"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Đến</span>
                  <input
                    type="date"
                    value={tempEndDate}
                    max={today}
                    onChange={(e) => setTempEndDate(e.target.value)}
                    className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs font-medium text-neutral-600 outline-none focus:border-brand-primary"
                  />
                </div>
                <button
                  onClick={handleApplyCustomPeriod}
                  className="rounded-lg bg-[#c75c2e] hover:bg-[#a64820] text-white px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs ml-2 active:scale-95"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>

          {/* Bar chart */}
          <div className="mt-8 flex items-end gap-3 sm:gap-6 md:gap-8 px-6" style={{ height: 200 }}>
            {revenueChart?.map((item) => {
              // Normalize chart heights for visual scaling
              const maxVal = Math.max(...revenueChart.map(i => Math.max(i.light, i.dark)), 1);
              const lightHeight = (item.light / maxVal) * 160;
              const darkHeight = (item.dark / maxVal) * 160;

              return (
                <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                  <div className="flex items-end justify-center gap-1.5 w-full">
                    <div className="flex flex-col items-center">
                      {item.light > 0 && (
                        <span className="text-[9px] font-semibold text-neutral-400 mb-1">{formatMoneyShort(item.light)}</span>
                      )}
                      <div
                        className="w-7 rounded-t-md transition-all duration-300"
                        style={{
                          height: `${Math.max(lightHeight, 2)}px`,
                          backgroundColor: '#f5dcc8',
                        }}
                      />
                    </div>
                    <div className="flex flex-col items-center">
                      {item.dark > 0 && (
                        <span className="text-[9px] font-semibold text-[#c75c2e] mb-1">{formatMoneyShort(item.dark)}</span>
                      )}
                      <div
                        className="w-7 rounded-t-md transition-all duration-300"
                        style={{
                          height: `${Math.max(darkHeight, 2)}px`,
                          backgroundColor: item.dark > item.light ? '#c75c2e' : '#f0c4a8',
                        }}
                      />
                    </div>
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
          {/* Header with month picker */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-heading text-lg font-bold text-neutral-800">
                Doanh thu theo danh mục
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">Phân bổ doanh thu theo loại hàng hóa trong tháng</p>
            </div>
            <input
              type="month"
              value={catMonthValue}
              max={maxMonthValue}
              onChange={(e) => setCatMonthValue(e.target.value)}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 cursor-pointer hover:bg-neutral-50"
            />
          </div>

          {/* Content */}
          <div className={`transition-opacity duration-300 ${catFetching ? 'opacity-50' : 'opacity-100'}`}>
            {filteredCategoryBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mb-4 text-neutral-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
                <p className="text-sm font-bold text-neutral-500">Chưa có doanh thu trong tháng này</p>
                <p className="text-xs text-neutral-400 mt-1">Hãy chọn tháng khác để xem thống kê</p>
              </div>
            ) : (
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Big donut chart */}
                <div className="relative flex items-center justify-center shrink-0" style={{ width: 280, height: 280 }}>
                  <svg viewBox="0 0 42 42" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
                    {/* Background ring */}
                    <circle cx="21" cy="21" r="15.5" fill="none" stroke="#f5f5f4" strokeWidth="5.5" />
                    {/* Segments */}
                    {filteredCategoryBreakdown.reduce(
                      (acc, item, idx) => {
                        const segmentPercent = item.percent;
                        if (segmentPercent > 0) {
                          // Small gap between segments (0.5%)
                          const gap = filteredCategoryBreakdown.length > 1 ? 0.8 : 0;
                          const drawPercent = Math.max(segmentPercent - gap, 0.5);
                          const circumference = 2 * Math.PI * 15.5;
                          const dashLen = (drawPercent / 100) * circumference;
                          const gapLen = circumference - dashLen;
                          const offsetLen = -(acc.offset / 100) * circumference;

                          acc.elements.push(
                            <circle
                              key={item.label}
                              cx="21" cy="21" r="15.5"
                              fill="none"
                              stroke={PIE_COLORS[idx % PIE_COLORS.length]}
                              strokeWidth="5.5"
                              strokeDasharray={`${dashLen} ${gapLen}`}
                              strokeDashoffset={offsetLen}
                              strokeLinecap="round"
                              className="transition-all duration-700 hover:opacity-80"
                              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                            />
                          );
                          acc.offset += segmentPercent;
                        }
                        return acc;
                      },
                      { elements: [], offset: 0 }
                    ).elements}
                  </svg>
                  {/* Center label */}
                  <div className="absolute flex flex-col items-center pointer-events-none">
                    <span className="text-[28px] font-bold text-neutral-800 leading-none">
                      {formatMoneyShort(catTotal)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1">Tổng tháng {catMonth}</span>
                  </div>
                </div>

                {/* Category list */}
                <div className="flex-1 w-full space-y-3">
                  {filteredCategoryBreakdown.map((c, idx) => (
                    <div
                      key={c.label}
                      className="group flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-3.5 transition-all hover:border-neutral-200 hover:shadow-sm"
                    >
                      {/* Color dot */}
                      <span
                        className="h-3.5 w-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-bold text-neutral-700 truncate">{c.label}</span>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-sm font-bold text-neutral-800">{formatMoney(c.revenue)}</span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                            >
                              {c.percent}%
                            </span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${c.percent}%`,
                              backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DashboardPage;
