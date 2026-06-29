import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const fallbackAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80";

export function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      navigate("/?login=true", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      const isAdmin = 
        String(user.role).toUpperCase() === "ADMIN" || 
        Number(user.roleId) === 3;

      if (!isAdmin) {
        setForbidden(true);
        return;
      }
      setAuthorized(true);
    } catch (error) {
      console.error("Error parsing user info:", error);
      navigate("/?login=true", { replace: true });
    }
  }, [navigate]);

  if (forbidden) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] px-4 text-center">
        <div className="max-w-md p-8 bg-white border border-[#e7dfbd] rounded-2xl shadow-lg">
          <span className="inline-flex p-3 rounded-full bg-red-50 text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </span>
          <h2 className="text-xl font-extrabold text-stone-900 mb-2">Không có quyền truy cập</h2>
          <p className="text-sm text-stone-600 mb-6">Bạn không có quyền truy cập vào trang quản trị này. Vui lòng quay lại trang chủ.</p>
          <button 
            onClick={() => navigate("/")}
            className="px-6 py-2.5 bg-[#c85a28] hover:bg-[#b84c1a] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer"
          >
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    {
      path: "/",
      label: "Trang chủ",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: "/admin/dashboard",
      label: "Dashboard",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="9" />
          <rect x="14" y="3" width="7" height="5" />
          <rect x="14" y="12" width="7" height="9" />
          <rect x="3" y="16" width="7" height="5" />
        </svg>
      ),
    },
    {
      path: "/admin/products",
      label: "Sản phẩm",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
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
      ),
    },
    {
      path: "/admin/categories",
      label: "Danh mục",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      path: "/admin/shops",
      label: "Cửa hàng",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: "/admin/users",
      label: "Người dùng",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
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
      ),
    },
    {
      path: "/admin/orders",
      label: "Đơn hàng",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
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
      ),
    },
    {
      path: "/admin/complaints",
      label: "Khiếu nại",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <line x1="12" y1="7" x2="12" y2="11" />
          <line x1="12" y1="15" x2="12.01" y2="15" />
        </svg>
      ),
    },
    {
      path: "/admin/coupons",
      label: "Mã giảm giá",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
          <line x1="7" y1="7" x2="7.01" y2="7" />
        </svg>
      ),
    },
    {
      path: "/admin/campaigns",
      label: "Chiến dịch Sale",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex h-full w-full bg-[#faf9f6]">
      {/* Sidebar */}
      <aside
        className={`bg-stone-950 text-stone-400 flex flex-col transition-all duration-300 ease-in-out shadow-[4px_0_24px_rgba(0,0,0,0.15)] border-r border-stone-900 overflow-hidden fixed md:relative h-screen md:h-full z-[1000] md:z-auto ${sidebarOpen
            ? "w-[220px] translate-x-0"
            : "w-0 border-r-0 -translate-x-full md:translate-x-0 md:w-0 shadow-none"
          }`}
      >
        <div className="p-5 border-b border-stone-900">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c85a28] animate-pulse"></span>
              <h2 className="m-0 text-sm font-extrabold text-white uppercase tracking-wider">Admin Panel</h2>
            </div>
            {sidebarOpen && (
              <button
                className="bg-none border-none cursor-pointer text-stone-500 p-1.5 rounded-lg inline-flex items-center justify-center transition-all duration-200 hover:bg-stone-900 hover:text-white hover:scale-105 active:scale-95"
                onClick={() => setSidebarOpen(false)}
                title="Thu gọn menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        <nav className="flex-1 py-5 flex flex-col gap-1">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3.5 py-3 px-4 text-sm font-semibold transition-all duration-200 cursor-pointer ${active
                    ? "bg-[#c85a28] text-white rounded-xl mx-3 shadow-[0_4px_12px_rgba(200,90,40,0.25)]"
                    : "text-stone-400 hover:bg-stone-900 hover:text-stone-100 rounded-xl mx-3"
                  }`}
              >
                <span className={`min-w-[18px] inline-flex items-center justify-center transition-transform duration-200 ${active ? "scale-110 text-white" : "text-stone-500 group-hover:text-stone-200"}`}>{item.icon}</span>
                {sidebarOpen && <span className="whitespace-nowrap overflow-hidden flex-1">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-900 flex flex-col gap-2">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              navigate("/", { replace: true });
            }}
            className="w-full py-3 px-4 bg-[#c85a28] hover:bg-[#b84c1a] text-white border-none rounded-xl cursor-pointer font-bold text-sm transition-all duration-200 shadow-md shadow-orange-950/20 active:scale-[0.98]"
            title="Đăng xuất"
          >
            {sidebarOpen ? (
              "Đăng xuất"
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: "block", margin: "auto" }}
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md py-3.5 px-6 flex justify-between items-center shadow-[0_1px_3px_rgba(0,0,0,0.02)] border-b border-stone-100 sticky top-0 z-40">
          <div className="flex items-center gap-[15px]">
            {!sidebarOpen && (
              <button
                className="bg-none border-none cursor-pointer text-stone-600 p-1.5 mr-2.5 rounded-lg inline-flex items-center justify-center transition-all duration-200 hover:bg-stone-50 hover:text-[#c85a28] hover:scale-105 active:scale-95"
                onClick={() => setSidebarOpen(true)}
                title="Mở rộng menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
            )}

          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-[#faf9f6] h-full min-w-0">{children}</main>
      </div>
    </div>
  );
}
