import { Routes, Route, Navigate } from "react-router-dom";
import { routes } from "@/routes";
import "./App.css";
import SellerRoutes from "@/modules/seller/routes/SellerRoutes";

function App() {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}
      {/* Redirect to admin dashboard by default */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/seller/*" element={<SellerRoutes />} />
    </Routes>
  );
}

export default App;
