import {
  ShoppingCart,
  Image,
  ClipboardList,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */
const revenueByTime = [
  { label: 'TUẦN 1', light: 50, dark: 72 },
  { label: 'TUẦN 2', light: 68, dark: 153 },
  { label: 'TUẦN 3', light: 55, dark: 100 },
  { label: 'TUẦN 4', light: 45, dark: 85 },
];

const notifications = [
  {
    id: 1,
    icon: <ShoppingBag size={18} className="text-white" />,
    iconBg: 'bg-brand-primary',
    title: 'Đơn hàng #TC1204 mới!',
    desc: 'Lan Anh vừa đặt "Váy Vintage Hoa Nhí". Cần xác nhận ngay.',
    time: '10 phút trước',
  },
  {
    id: 2,
    icon: <MessageSquare size={18} className="text-white" />,
    iconBg: 'bg-neutral-400',
    title: 'Câu hỏi khách hàng',
    desc: '"Áo len này có bị xù lông không shop ơi?" từ Minh Tú.',
    time: '2 giờ trước',
  },
];

const categoryData = [
  { label: 'Áo', percent: 40, color: '#c75c2e' },
  { label: 'Quần', percent: 30, color: '#d4724a' },
  { label: 'Váy', percent: 20, color: '#f5c9a8' },
  { label: 'Phụ kiện', percent: 10, color: '#e8e5de' },
];

/* ============================================================
   COMPONENT
   ============================================================ */
const DashboardPage = () => {
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
              +12.5%
            </span>
          </div>
          <p className="mt-3 font-heading text-[28px] font-bold text-brand-primary">
            12.450.000đ
          </p>
          {/* Mini bar chart */}
          <div className="mt-5 flex items-end gap-2 h-12">
            {[35, 38, 42, 48, 80, 50, 55].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{
                  height: `${h}%`,
                  backgroundColor: i === 4 ? '#6b3420' : '#f0cdb5',
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
              08
            </span>
            <span className="text-sm text-brand-primary">đơn chưa xử lý</span>
          </div>
          {/* Stacked avatars */}
          <div className="mt-4 flex items-center">
            {[12, 25, 33].map((n, i) => (
              <img
                key={n}
                src={`https://i.pravatar.cc/32?img=${n}`}
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
            <span
              className="flex items-center justify-center rounded-full bg-accent-green text-[10px] font-bold text-white"
              style={{ height: 30, width: 30, marginLeft: -8, position: 'relative', zIndex: 0 }}
            >
              +5
            </span>
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
                  strokeDasharray="72 28"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center top-5">
                <span className="text-xl font-bold leading-none text-neutral-800">42</span>
                <p className="text-[8px] font-bold uppercase tracking-wider text-neutral-400">Món</p>
              </div>
            </div>
            {/* Legend */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-green" />
                <span className="text-sm text-neutral-600">Hoạt động (32)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-accent-yellow" />
                <span className="text-sm text-neutral-600">Chờ duyệt (10)</span>
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
            <select className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-600 outline-none cursor-pointer">
              <option>30 ngày qua</option>
              <option>7 ngày qua</option>
              <option>90 ngày qua</option>
            </select>
          </div>

          {/* Bar chart */}
          <div className="mt-8 flex items-end gap-10 px-6" style={{ height: 200 }}>
            {revenueByTime.map((item) => (
              <div key={item.label} className="flex flex-1 flex-col items-center gap-3">
                <div className="flex items-end justify-center gap-1.5 w-full">
                  <div
                    className="w-7 rounded-t-md"
                    style={{
                      height: `${item.light}px`,
                      backgroundColor: '#f5dcc8',
                    }}
                  />
                  <div
                    className="w-7 rounded-t-md"
                    style={{
                      height: `${item.dark}px`,
                      backgroundColor: item.dark > 120 ? '#c75c2e' : '#f0c4a8',
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="font-heading text-lg font-bold text-neutral-800">
            Thông báo mới nhất
          </h2>
          <div className="mt-5 space-y-5">
            {notifications.map((n) => (
              <div key={n.id} className="flex gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${n.iconBg}`}>
                  {n.icon}
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
                {categoryData.reduce(
                  (acc, item) => {
                    const dash = item.percent;
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
                    return acc;
                  },
                  { elements: [], offset: 0 }
                ).elements}
              </svg>
              <span className="absolute text-xl font-bold text-neutral-800">100%</span>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
              {categoryData.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: c.color }}
                  />
                  <span className="text-sm text-neutral-600">
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
            <button className="group flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#c75c2e] to-[#8b3a1a] p-5 text-left text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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
            <button className="group flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[#d4724a] to-[#c75c2e] p-5 text-left text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
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
