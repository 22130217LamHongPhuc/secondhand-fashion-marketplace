import CustomerLayout from "@/layouts/CustomerLayout";
import { Navigate } from "react-router-dom";
import { adminRoutes } from "@/pages/admin";
import { customerRoutes } from "@/pages/customer";
import { userRoutes } from "@/pages/user";

export const routes = [
  ...adminRoutes,
  ...userRoutes,
  {
    path: "/",
    element: <CustomerLayout />,
    children: customerRoutes,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
