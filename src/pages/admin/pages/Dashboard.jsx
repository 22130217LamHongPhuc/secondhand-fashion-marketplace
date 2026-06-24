import { useEffect, useState } from "react";
import { dashboardService } from "@/services/admin";

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getStatistics(),
        dashboardService.getRecentActivities(),
      ]);
      setStats(statsData || {});
      setActivities(Array.isArray(activitiesData) ? activitiesData : []);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status = "") => {
    const s = status.toUpperCase();
    const base = "inline-block py-1 px-3 rounded-full text-[11px] font-semibold uppercase ";
    if (s === "PENDING") return base + "bg-[#fff3cd] text-[#856404]";
    if (s === "CONFIRMED") return base + "bg-[#d1ecf1] text-[#0c5460]";
    if (s === "SHIPPING") return base + "bg-[#cfe2ff] text-[#084298]";
    if (s === "DONE" || s === "DELIVERED") return base + "bg-[#d1e7dd] text-[#0f5132]";
    if (s === "CANCELLED") return base + "bg-[#f8d7da] text-[#842029]";
    return base + "bg-[#faf6f0] text-[#5a4a3a]";
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center py-10 px-5 text-sm text-[#9b6e4e]">
        <div>Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center py-10 px-5">
        <div className="text-sm text-[#d9534f] font-medium">Lỗi: {error}</div>
        <button onClick={loadDashboardData} className="block my-5 mx-auto py-2.5 px-[30px] bg-[#c85a28] text-white border-none rounded cursor-pointer font-semibold transition-colors duration-300 text-[13px] hover:bg-[#b84c1a]">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full animate-[fadeIn_0.3s_ease]">
      <h1 className="text-[26px] font-bold text-[#a0522d] mb-[25px]">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-[30px]">
        <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center gap-[15px] transition-all duration-300 cursor-pointer border border-[#e8dfd5] hover:-translate-y-[3px] hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] flex-col sm:flex-row text-center sm:text-left">
          <div className="flex items-center justify-center w-[60px] h-[60px] bg-[#f5e6d3] rounded-md text-[#a0522d] shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="m-0 mb-1 text-[13px] text-[#9b6e4e] font-medium">Tổng sản phẩm</h3>
            <p className="m-0 text-2xl font-bold text-[#a0522d]">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center gap-[15px] transition-all duration-300 cursor-pointer border border-[#e8dfd5] hover:-translate-y-[3px] hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] flex-col sm:flex-row text-center sm:text-left">
          <div className="flex items-center justify-center w-[60px] h-[60px] bg-[#f5e6d3] rounded-md text-[#a0522d] shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="m-0 mb-1 text-[13px] text-[#9b6e4e] font-medium">Người mua</h3>
            <p className="m-0 text-2xl font-bold text-[#a0522d]">
              {Math.max(0, (stats?.totalUsers || 0) - (stats?.totalSellers || 0))}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center gap-[15px] transition-all duration-300 cursor-pointer border border-[#e8dfd5] hover:-translate-y-[3px] hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] flex-col sm:flex-row text-center sm:text-left">
          <div className="flex items-center justify-center w-[60px] h-[60px] bg-[#f5e6d3] rounded-md text-[#a0522d] shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="m-0 mb-1 text-[13px] text-[#9b6e4e] font-medium">Người bán</h3>
            <p className="m-0 text-2xl font-bold text-[#a0522d]">{stats?.totalSellers || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center gap-[15px] transition-all duration-300 cursor-pointer border border-[#e8dfd5] hover:-translate-y-[3px] hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] flex-col sm:flex-row text-center sm:text-left">
          <div className="flex items-center justify-center w-[60px] h-[60px] bg-[#f5e6d3] rounded-md text-[#a0522d] shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="m-0 mb-1 text-[13px] text-[#9b6e4e] font-medium">Đơn hàng</h3>
            <p className="m-0 text-2xl font-bold text-[#a0522d]">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex items-center gap-[15px] transition-all duration-300 cursor-pointer border border-[#e8dfd5] hover:-translate-y-[3px] hover:shadow-[0_3px_8px_rgba(0,0,0,0.12)] flex-col sm:flex-row text-center sm:text-left">
          <div className="flex items-center justify-center w-[60px] h-[60px] bg-[#f5e6d3] rounded-md text-[#a0522d] shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-content">
            <h3 className="m-0 mb-1 text-[13px] text-[#9b6e4e] font-medium">Doanh thu</h3>
            <p className="m-0 text-2xl font-bold text-[#a0522d]">
              {stats?.totalRevenue?.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-[30px]">
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[#e8dfd5]">
            <h2 className="text-base font-semibold text-[#a0522d] m-0 mb-[18px]">Đơn hàng gần đây</h2>
            <div className="overflow-x-auto">
              {stats?.recentOrders?.length > 0 ? (
                <table className="w-full border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-[#f5e6d3]">
                      <th className="p-2 sm:p-3 text-left font-semibold text-[#8b5a3c] text-[13px]">ID</th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-[#8b5a3c] text-[13px]">Khách hàng</th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-[#8b5a3c] text-[13px]">Tổng tiền</th>
                      <th className="p-2 sm:p-3 text-left font-semibold text-[#8b5a3c] text-[13px]">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#faf6f0]">
                        <td className="p-2 sm:p-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px]">#{order.id}</td>
                        <td className="p-2 sm:p-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px]">{order.customerName}</td>
                        <td className="p-2 sm:p-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px]">{order.total?.toLocaleString("vi-VN")} đ</td>
                        <td className="p-2 sm:p-3 border-b border-[#e8dfd5] text-[#5a4a3a] text-[13px]">
                          <span className={getStatusBadgeClass(order.status)}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center py-10 px-5 text-[#9b6e4e] text-sm">Chưa có đơn hàng</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-md shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-[#e8dfd5]">
            <h2 className="text-base font-semibold text-[#a0522d] m-0 mb-[18px]">Hoạt động gần đây</h2>
            <div className="flex flex-col gap-3">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={idx} className="p-3 bg-[#faf6f0] border-l-[3px] border-[#c85a28] rounded">
                    <div className="text-[11px] text-[#9b6e4e] mb-1 font-medium">
                      {new Date(activity.timestamp).toLocaleTimeString("vi-VN")}
                    </div>
                    <div className="text-[13px] text-[#5a4a3a] font-medium">{activity.description}</div>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 px-5 text-[#9b6e4e] text-sm">Chưa có hoạt động</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
