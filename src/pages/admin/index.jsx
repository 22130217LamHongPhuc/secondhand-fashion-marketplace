import { AdminLayout } from "./components";
import {
  Dashboard,
  ProductManagement,
  UserManagement,
  OrderManagement,
} from "./pages";

export { AdminLayout };

export const adminRoutes = [
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
];
