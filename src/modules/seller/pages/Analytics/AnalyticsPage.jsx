import { CheckCircle, Star, MessageSquare, PackageX, XCircle, Award } from 'lucide-react';

/* ============================================================
   MOCK DATA
   ============================================================ */
const statsCards = [
  {
    icon: <CheckCircle size={20} className="text-accent-green" />,
    iconBg: 'bg-accent-green-light',
    label: 'Tỉ lệ thành công',
    value: '98.5%',
    suffix: '',
    badge: '+2.1%',
    badgeColor: 'text-accent-green bg-accent-green-light',
    barColor: 'bg-accent-green',
    barPercent: 98,
  },
  {
    icon: <Star size={20} className="fill-accent-yellow text-accent-yellow" />,
    iconBg: 'bg-accent-yellow-light',
    label: 'Đánh giá trung bình',
    value: '4.8',
    suffix: '/ 5.0',
    badge: null,
    barColor: 'bg-accent-yellow',
    barPercent: 96,
  },
  {
    icon: <MessageSquare size={20} className="text-brand-primary" />,
    iconBg: 'bg-brand-primary/10',
    label: 'Thời gian phản hồi',
    value: '< 15',
    suffix: 'phút',
    badge: 'Cải thiện',
    badgeColor: 'text-accent-orange bg-accent-yellow-light',
    barColor: 'bg-brand-primary',
    barPercent: 60,
  },
  {
    icon: <PackageX size={20} className="text-neutral-500" />,
    iconBg: 'bg-neutral-100',
    label: 'Tỉ lệ hoàn hàng',
    value: '1.2%',
    suffix: '',
    badge: null,
    barColor: 'bg-neutral-400',
    barPercent: 12,
  },
];

const historyData = [
  {
    date: '24/10/2023',
    event: 'Hoàn thành đơn #12345',
    icon: <CheckCircle size={18} className="text-accent-green" />,
    points: '+10',
    pointsColor: 'text-accent-green',
    total: 1250,
  },
  {
    date: '23/10/2023',
    event: 'Nhận đánh giá 5 sao',
    icon: <Star size={18} className="fill-accent-yellow text-accent-yellow" />,
    points: '+5',
    pointsColor: 'text-accent-green',
    total: 1240,
  },
  {
    date: '20/10/2023',
    event: 'Hủy đơn do hết hàng',
    icon: <XCircle size={18} className="text-accent-red" />,
    points: '-15',
    pointsColor: 'text-accent-red',
    total: 1235,
  },
  {
    date: '18/10/2023',
    event: 'Hoàn thành đơn #12340',
    icon: <CheckCircle size={18} className="text-accent-green" />,
    points: '+10',
    pointsColor: 'text-accent-green',
    total: 1250,
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */
const AnalyticsPage = () => {
  const currentScore = 1250;
  const maxScore = 2000;
  const percentage = (currentScore / maxScore) * 100;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* ── Score Hero Section ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white px-10 py-8">
        {/* Rank Badge - Centered */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm">
            <Award size={16} className="text-neutral-500" />
            HẠNG BẠC
          </span>
        </div>

        <div className="flex items-center gap-16">
          {/* Circular Progress */}
          <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
            <svg viewBox="0 0 160 160" className="h-52 w-52 -rotate-90">
              {/* Background track */}
              <circle
                cx="80" cy="80" r={radius}
                fill="none"
                stroke="#f0ebe4"
                strokeWidth="12"
              />
              {/* Progress arc */}
              <circle
                cx="80" cy="80" r={radius}
                fill="none"
                stroke="var(--color-brand-primary)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-5xl font-bold text-neutral-800">{currentScore}</span>
              <p className="mt-1 text-sm text-neutral-400">/ {maxScore} điểm</p>
            </div>
          </div>

          {/* Info Text */}
          <div className="flex-1">
            <h1 className="font-heading text-3xl font-bold leading-tight text-neutral-800">
              Tuyệt vời! Cửa hàng đang hoạt động rất tốt.
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-neutral-500">
              Còn <strong className="font-bold text-neutral-800">750 điểm</strong> nữa để lên hạng Vàng! Hãy tiếp tục duy trì dịch vụ tuyệt vời này nhé.
            </p>

            {/* CTA Buttons */}
            <div className="mt-6 flex gap-3">
              <button className="rounded-xl bg-brand-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
                Xem đặc quyền Hạng Vàng
              </button>
              <button className="rounded-xl border border-neutral-300 bg-white px-7 py-3 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-50 active:scale-[0.98]">
                Cách kiếm điểm
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-4 gap-5">
        {statsCards.map((card) => (
          <div
            key={card.label}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5"
          >
            {/* Top row: icon + badge */}
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
              {card.badge && (
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${card.badgeColor}`}>
                  {card.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <p className="mt-4 text-xs text-neutral-400">{card.label}</p>

            {/* Value */}
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-800">{card.value}</span>
              {card.suffix && (
                <span className="text-sm font-normal text-neutral-400">{card.suffix}</span>
              )}
            </div>

            {/* Mini bar decoration - bottom right */}
            <div className="absolute bottom-0 right-4 flex items-end gap-1 pb-4">
              {[40, 65, 50, 80, 55].map((h, i) => (
                <div
                  key={i}
                  className={`w-2 rounded-t-sm ${card.barColor} opacity-25`}
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ── History Table ── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8">
        <h2 className="font-heading text-xl font-bold text-neutral-800">
          Lịch sử điểm Uy tín
        </h2>
        <p className="mt-1 text-sm text-neutral-400">
          Ghi nhận các hoạt động ảnh hưởng đến điểm số của cửa hàng.
        </p>

        <table className="mt-6 w-full">
          <thead>
            <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-400">
              <th className="w-45 px-4 py-3 text-left">Ngày</th>
              <th className="px-4 py-3 text-left">Sự kiện</th>
              <th className="w-30 px-4 py-3 text-center">Số điểm</th>
              <th className="w-40 px-4 py-3 text-right">Tổng tích lũy</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((row, i) => (
              <tr
                key={i}
                className="border-b border-neutral-50 transition-colors hover:bg-brand-bg/40"
              >
                <td className="px-4 py-5 text-sm text-neutral-500">{row.date}</td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    {row.icon}
                    <span className="text-sm font-semibold text-neutral-700">{row.event}</span>
                  </div>
                </td>
                <td className={`px-4 py-5 text-center text-sm font-bold ${row.pointsColor}`}>
                  {row.points}
                </td>
                <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-700">
                  {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* View all link */}
        <div className="mt-5 text-center">
          <button className="text-sm font-semibold text-brand-primary transition-colors hover:text-brand-dark hover:underline">
            Xem toàn bộ lịch sử
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
