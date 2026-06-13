import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import { useSellerOrderEvents } from '../hooks';
import { toasterProps } from '@/services/toastService';

const SellerLayout = () => {
  // TODO: Replace with actual sellerId from auth context
  const sellerId = 1;
  useSellerOrderEvents(sellerId);

  return (
    <div className="seller-root flex h-screen overflow-hidden bg-brand-bg">
      {/* Toast Notification Container */}
      <Toaster {...toasterProps} />

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
