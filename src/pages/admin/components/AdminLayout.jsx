import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./AdminLayout.css";

const fallbackAvatar =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Ccircle cx='40' cy='40' r='40' fill='%23f5d5b8'/%3E%3Ccircle cx='40' cy='32' r='14' fill='%23a0522d'/%3E%3Cpath d='M16 72c4.8-13.6 16-20 24-20s19.2 6.4 24 20' fill='%23a0522d'/%3E%3C/svg%3E";

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/products", label: "Sản phẩm", icon: "📦" },
    { path: "/admin/users", label: "Người dùng", icon: "👥" },
    { path: "/admin/orders", label: "Đơn hàng", icon: "📋" },
  ];

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="admin-logo">
          <h2>Admin Panel</h2>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="admin-footer">
          <button className="logout-btn">Đăng xuất</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content">
        {/* Top Bar */}
        <div className="admin-topbar">
          <button
            className="toggle-sidebar"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <div className="topbar-right">
            <span className="user-info">Admin User</span>
            <img
              src={fallbackAvatar}
              alt="User"
              className="user-avatar"
            />
          </div>
        </div>

        {/* Page Content */}
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
