import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useSellerOrderEvents, useSellerShop } from '../hooks';
import { useSseSubscription } from '@/hooks';

const SellerLayout = () => {
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

  return (
    <div className="seller-root flex h-screen overflow-hidden bg-brand-bg">
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
