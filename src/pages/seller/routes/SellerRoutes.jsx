import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ProductsPage from '../pages/Products/ProductsPage';
import ProductDetailPage from '../pages/Products/ProductDetailPage';
import OrdersPage from '../pages/Orders/OrdersPage';
import AnalyticsPage from '../pages/Analytics/AnalyticsPage';
import StoreProfilePage from '../pages/Store/StoreProfilePage';
import PromotionsPage from '../pages/Promotions/PromotionsPage';
import ShopPromotionsPage from '../pages/Promotions/ShopPromotionsPage';
import CreatePromotionPage from '../pages/Promotions/CreatePromotionPage';
import EditPromotionPage from '../pages/Promotions/EditPromotionPage';
import SellerLayout from '../layout/SellerLayout';
import OrderDetailPage from '../pages/Orders/OrderDetailPage';
import MessagesPage from '../pages/MessagesPage';

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
        <Route path="messages" element={<MessagesPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="promotions" element={<PromotionsPage />} />
        <Route path="shop-promotions" element={<ShopPromotionsPage />} />
        <Route path="shop-promotions/new" element={<CreatePromotionPage />} />
        <Route path="shop-promotions/:id/edit" element={<EditPromotionPage />} />
        <Route path="store-profile" element={<StoreProfilePage />} />
      </Route>
    </Routes>
  );
};


export default SellerRoutes;
