import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useSellerOrderEvents, useSellerShop } from '../hooks';

const SellerLayout = () => {
  const { data: shop, isLoading } = useSellerShop();

  // TODO: Replace with actual sellerId from auth context
  const sellerId = 1;
  useSellerOrderEvents(sellerId);

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
