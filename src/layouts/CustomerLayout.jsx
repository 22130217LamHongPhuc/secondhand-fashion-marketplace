import { Bell, ImageUp, ReceiptText, Search, ShoppingCart, Shield } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { toasterProps } from "@/services/toastService";

export default function CustomerLayout() {
  const navigate = useNavigate();

  const handleSearch = () => {
    console.log(
      "Tính năng tìm kiếm đang được phát triển. Vui lòng quay lại sau!",
    );
    navigate("/products");
  };

  return (
    <div
      className="min-h-screen bg-[#f6f4dd] text-[#3f3b2f]"
      style={{ height: "100vh", overflowY: "auto" }}
    >
      <Toaster {...toasterProps} />
      <header className="sticky top-0 z-40 border-b border-[#e7dfbd] bg-[#f6f4dd]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-xl font-bold italic text-[#b84a25]"
          >
            Tủ cũ chill
          </button>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#706b5c] md:flex">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="hover:text-[#b84a25]"
            >
              Khám Phá
            </button>

            <button
              type="button"
              onClick={() => navigate("/shops")}
              className="hover:text-[#b84a25]"
            >
              Cửa Hàng
            </button>

            <button type="button" className="hover:text-[#b84a25]">
              Xu Hướng
            </button>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="hover:text-[#b84a25]"
            >
              Đơn hàng
            </button>
          </nav>

          <div className="flex items-center gap-4 text-[#b84a25]">
            <button type="button" onClick={handleSearch}>
              <Search size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/image-search")}
              aria-label="Tìm kiếm bằng hình ảnh"
              title="Tìm kiếm bằng hình ảnh"
            >
              <ImageUp size={18} />
            </button>

            <button type="button">
              <Bell size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/orders")}
              aria-label="Lịch sử đơn hàng"
              title="Lịch sử đơn hàng"
            >
              <ReceiptText size={18} />
            </button>

            <button type="button">
              <ShoppingCart size={18} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              aria-label="Quản trị Admin"
              title="Quản trị Admin"
            >
              <Shield size={18} />
            </button>

            <div className="h-7 w-7 rounded-full border border-[#b84a25] bg-white/50" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
