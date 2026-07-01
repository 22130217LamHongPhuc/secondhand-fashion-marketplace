import { Navigate } from "react-router-dom";
import { AdminLayout } from "./components";
import {
  Dashboard,
  ProductManagement,
  UserManagement,
  OrderManagement,
  ComplaintManagement,
  CategoryManagement,
  ShopManagement,
  CouponManagement,
  BannerManagement,
} from "./pages";

export { AdminLayout };

export const adminRoutes = [
  {
    path: "/admin",
    element: <Navigate to="/admin/dashboard" replace />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <AdminLayout>
        <Dashboard />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <AdminLayout>
        <ProductManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <AdminLayout>
        <UserManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <AdminLayout>
        <OrderManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/orders/:orderId",
    element: (
      <AdminLayout>
        <OrderManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/complaints",
    element: (
      <AdminLayout>
        <ComplaintManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/categories",
    element: (
      <AdminLayout>
        <CategoryManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/shops",
    element: (
      <AdminLayout>
        <ShopManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/coupons",
    element: (
      <AdminLayout>
        <CouponManagement />
      </AdminLayout>
    ),
  },
  {
    path: "/admin/banners",
    element: (
      <AdminLayout>
        <BannerManagement />
      </AdminLayout>
    ),
  },
];


