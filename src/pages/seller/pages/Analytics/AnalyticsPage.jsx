import { useState } from "react";
import {
  CheckCircle,
  Star,
  MessageSquare,
  PackageX,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSellerAnalytics } from "../../hooks";

/* ============================================================
   COMPONENT
   ============================================================ */
const AnalyticsPage = () => {
  const [page, setPage] = useState(0);
  const size = 10;

  const { data, isLoading, error } = useSellerAnalytics({ page, size });

  if (isLoading)
    return (
      <div className="p-8 text-center text-neutral-500">
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="p-8 text-center text-red-500">
        Lỗi tải dữ liệu. Vui lòng thử lại.
      </div>
    );

  const { reputation, metrics, reputationHistory } = data || {};

  const currentScore = reputation?.currentScore || 0;
  const maxScore = reputation?.maxScore || 2000;
  const percentage = Math.min((currentScore / maxScore) * 100, 100);
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percentage / 100) * circumference;

  const statsCards = [
    {
      icon: <CheckCircle size={20} className="text-accent-green" />,
      iconBg: "bg-accent-green-light",
      label: "Tỉ lệ thành công",
      value: metrics?.successRate?.value,
      suffix: metrics?.successRate?.suffix,
      badge: metrics?.successRate?.growth,
      badgeColor: "text-accent-green bg-accent-green-light",
      barColor: "bg-accent-green",
    },
    {
      icon: (
        <Star size={20} className="fill-accent-yellow text-accent-yellow" />
      ),
      iconBg: "bg-accent-yellow-light",
      label: "Đánh giá trung bình",
      value: metrics?.averageRating?.value,
      suffix: metrics?.averageRating?.suffix,
      badge: null,
      barColor: "bg-accent-yellow",
    },
    {
      icon: <MessageSquare size={20} className="text-brand-primary" />,
      iconBg: "bg-brand-primary/10",
      label: "Thời gian phản hồi",
      value: metrics?.responseTime?.value,
      suffix: metrics?.responseTime?.suffix,
      badge: metrics?.responseTime?.status === "IMPROVED" ? "Cải thiện" : "",
      badgeColor: "text-accent-orange bg-accent-yellow-light",
      barColor: "bg-brand-primary",
    },
    {
      icon: <PackageX size={20} className="text-neutral-500" />,
      iconBg: "bg-neutral-100",
      label: "Tỉ lệ hoàn hàng",
      value: metrics?.returnRate?.value,
      suffix: metrics?.returnRate?.suffix,
      badge: null,
      barColor: "bg-neutral-400",
    },
  ];

  return (
    <div className="space-y-8">


      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-4 gap-5">
        {statsCards.map((card, idx) => (
          <div
            key={idx}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5"
          >
            {/* Top row: icon + badge */}
            <div className="flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
              >
                {card.icon}
              </div>
              {card.badge && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${card.badgeColor}`}
                >
                  {card.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <p className="mt-4 text-xs text-neutral-400">{card.label}</p>

            {/* Value */}
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-800">
                {card.value || "N/A"}
              </span>
              {card.suffix && (
                <span className="text-sm font-normal text-neutral-400">
                  {card.suffix}
                </span>
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

        <div className="mt-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100 text-xs font-semibold uppercase tracking-wider text-neutral-400">
                <th className="w-45 px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-left">Sự kiện</th>
                <th className="w-30 px-4 py-3 text-center">Số điểm</th>
                <th className="w-40 px-4 py-3 text-right">Tổng tích lũy</th>
              </tr>
            </thead>
            <tbody>
              {reputationHistory?.content?.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-neutral-50 transition-colors hover:bg-brand-bg/40"
                >
                  <td className="px-4 py-5 text-sm text-neutral-500">
                    {row.date}
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      {row.pointsType === "positive" ? (
                        <CheckCircle size={18} className="text-accent-green" />
                      ) : (
                        <XCircle size={18} className="text-accent-red" />
                      )}
                      <span className="text-sm font-semibold text-neutral-700">
                        {row.event}
                      </span>
                    </div>
                  </td>
                  <td
                    className={`px-4 py-5 text-center text-sm font-bold ${row.pointsType === "positive" ? "text-accent-green" : "text-accent-red"}`}
                  >
                    {row.pointsChange}
                  </td>
                  <td className="px-4 py-5 text-right text-sm font-semibold text-neutral-700">
                    {row.totalAccumulated}
                  </td>
                </tr>
              ))}
              {reputationHistory?.content?.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 text-center text-sm text-neutral-500"
                  >
                    Chưa có lịch sử biến động điểm uy tín.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {reputationHistory?.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5">
            <p className="text-sm text-neutral-500">
              Trang{" "}
              <span className="font-semibold text-neutral-800">{page + 1}</span>{" "}
              / {reputationHistory.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className="flex items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() =>
                  setPage(Math.min(reputationHistory.totalPages - 1, page + 1))
                }
                disabled={reputationHistory.last}
                className="flex items-center justify-center rounded-lg border border-neutral-200 p-2 text-neutral-500 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
