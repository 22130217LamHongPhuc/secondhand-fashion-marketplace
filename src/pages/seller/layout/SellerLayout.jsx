import { Outlet, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useSellerOrderEvents, useSellerShop } from '../hooks';
import { useSseSubscription } from '@/hooks';

const SellerLayout = () => {
  const [isApiLoading, setIsApiLoading] = useState(false);

  useEffect(() => {
    const handleLoading = (e) => setIsApiLoading(e.detail);
    window.addEventListener("seller-api-loading", handleLoading);
    return () => window.removeEventListener("seller-api-loading", handleLoading);
  }, []);

  const { data: shop, isLoading } = useSellerShop();

  // Retrieve actual sellerId from logged in user in localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const sellerId = user?.userId;

  useSellerOrderEvents(sellerId);

  // Subscribe to real-time chat updates via SSE
  useSseSubscription("chat", sellerId, {
    "chat-message": (data) => {
      console.log("[SSE Chat Seller] Received chat-message:", data);
      window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
    },
    "chat-updated": (data) => {
      console.log("[SSE Chat Seller] Received chat-updated:", data);
      window.dispatchEvent(new CustomEvent("secondhand-chat-updated"));
    }
  });

  if (isLoading) {
    return <div className="p-8 text-center text-neutral-500">Đang tải dữ liệu cửa hàng...</div>;
  }

  if (!shop) {
    return <Navigate to="/regis-shop" replace />;
  }

  if (shop.isActive === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-50 px-4 text-center">
        <div className="max-w-md p-8 bg-white border border-rose-100 rounded-2xl shadow-lg">
          <span className="inline-flex p-3 rounded-full bg-rose-50 text-rose-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <h2 className="text-xl font-extrabold text-neutral-900 mb-2">Cửa hàng đã bị khóa</h2>
          <p className="text-sm text-neutral-600 mb-6">
            Cửa hàng của bạn đã bị khóa do vi phạm điều khoản dịch vụ hoặc đã tích lũy đủ 5 gậy phạt (5/5 gậy). Vui lòng liên hệ Admin để được hỗ trợ giải quyết.
          </p>
          <button 
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/";
            }}
            className="px-6 py-2.5 bg-[#c85a28] hover:bg-[#b84c1a] text-white font-bold text-sm rounded-xl transition-all shadow-md cursor-pointer border-none"
          >
            Đăng xuất & Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-root flex h-screen overflow-hidden bg-brand-bg relative">
      {isApiLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="flex flex-col items-center bg-white p-4 rounded-xl shadow-lg">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary mb-2" />
            <span className="text-sm font-semibold text-neutral-700">Đang xử lý...</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
