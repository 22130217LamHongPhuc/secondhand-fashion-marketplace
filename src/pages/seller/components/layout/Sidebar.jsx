import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  ShoppingCart,
  BarChart3,
  Store,
  Plus,
  Tag,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { to: "/seller/dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { to: "/seller/products", label: "Sản phẩm", icon: Shirt },
  { to: "/seller/orders", label: "Đơn hàng", icon: ShoppingCart },
  { to: "/seller/messages", label: "Tin nhắn", icon: MessageCircle },
  { to: "/seller/analytics", label: "Phân tích", icon: BarChart3 },
  { to: "/seller/promotions", label: "Khuyến mãi", icon: Tag },
  { to: "/seller/store-profile", label: "Hồ sơ cửa hàng", icon: Store },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="flex w-60 flex-col border-r border-neutral-200 bg-brand-sidebar">
      {/* Logo */}
      <div className="mx-auto p-4">
        <h1 className="font-heading text-3xl font-bold italic text-brand-primary">
          Tủ cũ chill
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname.startsWith(item.to);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-brand-primary bg-brand-primary/5"
                  : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom CTA */}
      <div className="p-4">
        <NavLink
          to="/seller/products/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]"
        >
          <Plus size={18} />
          <span>Đăng sản phẩm</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
