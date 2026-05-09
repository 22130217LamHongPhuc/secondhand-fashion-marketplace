import { useEffect, useState } from "react";
import { dashboardService } from "@/services/admin";
import "./Dashboard.css";

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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">Lỗi: {error}</div>
        <button onClick={loadDashboardData} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>Tổng sản phẩm</h3>
            <p className="stat-number">{stats?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Người dùng</h3>
            <p className="stat-number">{stats?.totalUsers || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Đơn hàng</h3>
            <p className="stat-number">{stats?.totalOrders || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Doanh thu</h3>
            <p className="stat-number">
              {stats?.totalRevenue?.toLocaleString("vi-VN")} đ
            </p>
          </div>
        </div>
      </div>

      {/* Overview Section */}
      <div className="dashboard-overview">
        <div className="section-left">
          <div className="section-card">
            <h2 className="section-title">Đơn hàng gần đây</h2>
            <div className="recent-orders">
              {stats?.recentOrders?.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.customerName}</td>
                        <td>{order.total?.toLocaleString("vi-VN")} đ</td>
                        <td>
                          <span
                            className={`status-badge status-${order.status}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="empty-state">Chưa có đơn hàng</p>
              )}
            </div>
          </div>
        </div>

        <div className="section-right">
          <div className="section-card">
            <h2 className="section-title">Hoạt động gần đây</h2>
            <div className="activities-list">
              {activities.length > 0 ? (
                activities.map((activity, idx) => (
                  <div key={idx} className="activity-item">
                    <div className="activity-time">
                      {new Date(activity.timestamp).toLocaleTimeString("vi-VN")}
                    </div>
                    <div className="activity-desc">{activity.description}</div>
                  </div>
                ))
              ) : (
                <p className="empty-state">Chưa có hoạt động</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
