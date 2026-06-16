import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ProductsPage from '../pages/Products/ProductsPage';
import ProductDetailPage from '../pages/Products/ProductDetailPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import AnalyticsPage from '../pages/Analytics/AnalyticsPage';
import StoreProfilePage from '../pages/Store/StoreProfilePage';
import SellerLayout from '../layout/SellerLayout';
import OrderDetailPage from '../pages/Orders/OrderDetailPage';

const SellerRoutes = () => {
  return (
    <Routes>
      <Route element={<SellerLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/new" element={<ProductDetailPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="store-profile" element={<StoreProfilePage />} />
      </Route>
    </Routes>
  );
};

export default SellerRoutes;
