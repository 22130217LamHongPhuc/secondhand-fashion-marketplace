import { useState, useEffect, useRef } from "react";
import { Search, Bell, User, LogOut, Store, Shield } from "lucide-react";
import { useSellerShop } from "../../hooks";
import { useNavigate } from "react-router-dom";
import { toastService } from "@/services/toastService";

const Header = () => {
  const { data: shop } = useSellerShop();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toastService.info("Đã đăng xuất tài khoản.");
    navigate("/");
  };
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white/60 px-8 py-3 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-7 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng, email..."
          className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-primary" />
        </button>

        {/* User Avatar Dropdown */}
        <div className="relative" ref={wrapperRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-9 w-9 overflow-hidden rounded-full bg-brand-light ring-2 ring-brand-primary/20 transition-all hover:ring-brand-primary/40 flex items-center justify-center cursor-pointer shadow-sm"
          >
            {shop?.avatarUrl ? (
              <img
                src={shop.avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : user?.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <User size={18} className="text-neutral-500" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2.5 w-52 origin-top-right rounded-2xl border border-neutral-200 bg-white p-2 shadow-xl z-50">
              {/* Header info */}
              <div className="px-3 py-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-500">Tài khoản</p>
                <p className="font-extrabold text-sm text-neutral-800 truncate mt-0.5">
                  {user?.fullName || shop?.name || "Người dùng"}
                </p>
                {user?.email && (
                  <p className="text-xs text-neutral-500 truncate mt-0.5">
                    {user.email}
                  </p>
                )}
              </div>
              
              <hr className="my-1.5 border-neutral-100" />
              
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-brand-primary transition cursor-pointer"
              >
                <Store size={15} />
                Trang mua sắm
              </button>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  navigate("/profile");
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-brand-primary transition cursor-pointer"
              >
                <User size={15} />
                Xem hồ sơ
              </button>

              {user && (user.role === "ADMIN" || user.roleId === 3) && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/admin");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-neutral-600 hover:bg-neutral-50 hover:text-brand-primary transition cursor-pointer"
                >
                  <Shield size={15} />
                  Trang quản trị
                </button>
              )}
              
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition cursor-pointer"
              >
                <LogOut size={15} />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
