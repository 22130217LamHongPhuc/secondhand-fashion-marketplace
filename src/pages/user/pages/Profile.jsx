import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShoppingBag, Phone, Mail, Camera, Loader2, Wallet, Calendar, ArrowRight, CheckCircle2, ShieldCheck, Clock, CreditCard, MapPin, Plus, X } from "lucide-react";
import { userService } from "@/services/user";
import { customerOrderService } from "@/services/customerOrder";
import { toastService } from "@/services/toastService";
import { env } from "@/config/env";

export function Profile() {
  const navigate = useNavigate();
  // Auth details
  const [sessionUser, setSessionUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // Profile Edit fields
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Recent Orders states
  const [recentOrders, setRecentOrders] = useState([]);
  const [isRecentOrdersLoading, setIsRecentOrdersLoading] = useState(false);

  // Address states
  const [addresses, setAddresses] = useState([]);
  const [isAddressesLoading, setIsAddressesLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // New address form states
  const [addrFullName, setAddrFullName] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrProvince, setAddrProvince] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrWard, setAddrWard] = useState("");
  const [addrDetail, setAddrDetail] = useState("");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Check auth and fetch profile details
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setSessionUser(u);
        fetchProfile(u.userId);
        fetchRecentOrders(u.userId);
        fetchAddresses(u.userId);
      } catch (e) {
        localStorage.removeItem("user");
        setIsProfileLoading(false);
      }
    } else {
      setIsProfileLoading(false);
    }
  }, []);

  const fetchProfile = async (userId) => {
    try {
      setIsProfileLoading(true);
      const res = await userService.getProfile(userId);
      if (res?.data) {
        setProfile(res.data);
        setFullName(res.data.fullName || "");
        setPhone(res.data.phone || "");
        setAvatarPreview(res.data.avatarUrl || "");
      }
    } catch (err) {
      console.error(err);
      toastService.error("Không thể tải thông tin hồ sơ.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchRecentOrders = async (userId) => {
    try {
      setIsRecentOrdersLoading(true);
      const res = await customerOrderService.getHistory({
        customerId: userId,
        page: 0,
        size: 3,
      });
      setRecentOrders(res.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecentOrdersLoading(false);
    }
  };

  const fetchAddresses = async (userId) => {
    try {
      setIsAddressesLoading(true);
      const res = await userService.getAddresses(userId);
      const data = res?.data || res || [];
      setAddresses(data);
    } catch (err) {
      console.error("Failed to load addresses", err);
    } finally {
      setIsAddressesLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (
      !addrFullName.trim() ||
      !addrPhone.trim() ||
      !addrProvince.trim() ||
      !addrDistrict.trim() ||
      !addrWard.trim() ||
      !addrDetail.trim()
    ) {
      toastService.warning("Vui lòng điền đầy đủ tất cả các thông tin địa chỉ.");
      return;
    }

    try {
      setIsSavingAddress(true);
      await userService.createAddress(sessionUser.userId, {
        fullName: addrFullName.trim(),
        phone: addrPhone.trim(),
        province: addrProvince.trim(),
        district: addrDistrict.trim(),
        ward: addrWard.trim(),
        addressDetail: addrDetail.trim(),
        isDefault: addrIsDefault,
      });
      toastService.success("Thêm địa chỉ giao hàng thành công!");
      setIsAddressModalOpen(false);
      // Reset form
      setAddrFullName("");
      setAddrPhone("");
      setAddrProvince("");
      setAddrDistrict("");
      setAddrWard("");
      setAddrDetail("");
      setAddrIsDefault(false);
      // Reload address list
      await fetchAddresses(sessionUser.userId);
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Lỗi khi lưu địa chỉ mới.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toastService.warning("Kích thước hình ảnh phải nhỏ hơn 5MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(profile?.avatarUrl || "");
  };

  const handleProfileUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastService.warning("Họ tên không được để trống.");
      return;
    }

    try {
      setIsUpdating(true);
      let uploadedUrl = avatarPreview;

      // If user selected a new file, upload it first to R2
      if (avatarFile) {
        const formData = new FormData();
        formData.append("file", avatarFile);
        
        const baseUrl = env.apiBaseUrl || window.location.origin;
        const uploadRes = await fetch(`${baseUrl}/api/images`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Tải lên hình ảnh đại diện thất bại.");
        }

        const uploadData = await uploadRes.json();
        uploadedUrl = uploadData?.data;
      }

      const res = await userService.updateProfile(sessionUser.userId, {
        fullName,
        phone: phone.trim() || null,
        avatarUrl: uploadedUrl,
      });

      if (res?.data) {
        toastService.success(res.message || "Cập nhật hồ sơ thành công!");
        setProfile(res.data);
        
        // Update user session in localStorage to keep layout sync'd
        const updatedSessionUser = {
          ...sessionUser,
          fullName: res.data.fullName,
          avatarUrl: res.data.avatarUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedSessionUser));
        
        // Dispatch simple event to reload CustomerLayout user details
        window.dispatchEvent(new Event("storage"));
      }
    } catch (err) {
      console.error(err);
      toastService.error(err.message || "Lỗi khi cập nhật thông tin hồ sơ.");
    } finally {
      setIsUpdating(false);
    }
  };

  const formatVnd = (value) => {
    if (value === null || value === undefined) return "0 ₫";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getStatusBadgeClass = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "SHIPPING":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "DONE":
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-rose-100 text-rose-800 border-rose-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status) => {
    switch (String(status).toUpperCase()) {
      case "PENDING":
        return "Chờ xử lý";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "SHIPPING":
        return "Đang giao hàng";
      case "DONE":
      case "DELIVERED":
        return "Giao thành công";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "U";
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
    return (first + last).toUpperCase();
  };

  if (isProfileLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-[#b84a25]" size={36} />
      </div>
    );
  }

  // Not logged in UI
  if (!sessionUser) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-[#e7dfbd] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f4dd] text-[#b84a25] mb-4">
          <User size={28} />
        </div>
        <h2 className="text-lg font-extrabold text-[#3f3b2f] mb-2">Tru cập bị từ chối</h2>
        <p className="text-sm text-[#706b5c] mb-6">
          Vui lòng bấm nút "Đăng nhập" ở góc trên màn hình để xem thông tin cá nhân và lịch sử đơn hàng của bạn.
        </p>
        <button
          onClick={() => navigate("/")}
          className="rounded-xl bg-[#b84a25] px-6 py-2.5 text-sm font-extrabold text-white transition-opacity hover:opacity-90"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section (matching OrderHistoryPage) */}
      <section className="rounded-2xl border border-[#e7dfbd] bg-[#fffaf0] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Tài khoản của tôi
            </p>
            <h1 className="mt-1 text-2xl font-black text-[#3d3a2c]">
              Hồ sơ cá nhân
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#766f60]">
              Cập nhật thông tin cá nhân, hình ảnh đại diện và theo dõi hoạt động mua hàng của bạn.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm flex items-center gap-3 border border-[#e7dfbd]/60">
            <div className="h-10 w-10 rounded-full border-2 border-[#b84a25] bg-[#f6f4dd] overflow-hidden flex items-center justify-center font-bold text-[#b84a25] text-base shrink-0">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-bold">{getInitials(profile?.fullName)}</span>
              )}
            </div>
            <div>
              <p className="text-xs font-black text-[#3d3a2c] leading-tight">{profile?.fullName}</p>
              <p className="text-[10px] text-[#9a907a] mt-0.5">{profile?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main layout: Grid with Left: Form, Right: Wallet & Stats */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Form & Address Management wrapper */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Form */}
          <div className="rounded-3xl border border-[#e7dfbd] bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-[#e7dfbd] pb-3">
              <h2 className="text-xl font-black text-[#3d3a2c]">Thông tin chi tiết</h2>
            </div>

            <form onSubmit={handleProfileUpdateSubmit} className="space-y-6">
              {/* Avatar Selector */}
              <div className="flex items-center gap-6 bg-[#fffaf0] p-5 rounded-2xl border border-[#e7dfbd]">
                <div className="relative h-20 w-20 rounded-full border-2 border-[#b84a25] overflow-hidden bg-white flex items-center justify-center shadow-inner group">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-[#b84a25]">{getInitials(fullName)}</span>
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <Camera size={18} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                  </label>
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#3d3a2c]">Ảnh đại diện</h4>
                  <p className="text-xs text-[#766f60] mt-0.5">Chấp nhận định dạng ảnh dung lượng dưới 5MB.</p>
                  <div className="flex gap-3 mt-2">
                    <label className="text-xs text-[#b84a25] font-bold border border-[#b84a25] hover:bg-[#b84a25]/5 px-3 py-1.5 rounded-lg cursor-pointer transition">
                      <span>Chọn ảnh</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                    </label>
                    {avatarFile && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="text-xs text-[#766f60] font-bold border border-slate-300 hover:bg-slate-50 px-3 py-1.5 rounded-lg cursor-pointer transition"
                      >
                        Hủy ảnh mới chọn
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Inputs */}
              <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2 sm:col-span-1">
                  <label className="text-xs font-bold text-[#8c826d] uppercase tracking-wider">Địa chỉ Email</label>
                  <input
                    type="email"
                    value={profile?.email || ""}
                    readOnly
                    className="w-full rounded-xl border border-[#e7dfbd] bg-[#fdfcfa] py-2.5 px-4 text-sm text-[#8c826d] outline-none cursor-not-allowed shadow-inner"
                  />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <label className="text-xs font-bold text-[#3d3a2c] uppercase tracking-wider">Họ tên của bạn *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isUpdating}
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 px-4 text-sm text-[#3d3a2c] outline-none shadow-xs focus:border-[#b84a25] focus:ring-4 focus:ring-[#b84a25]/10 transition-all duration-200"
                  />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <label className="text-xs font-bold text-[#3d3a2c] uppercase tracking-wider">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isUpdating}
                    placeholder="Nhập số điện thoại"
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white py-2.5 px-4 text-sm text-[#3d3a2c] outline-none shadow-xs focus:border-[#b84a25] focus:ring-4 focus:ring-[#b84a25]/10 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b84a25] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#9a3b1d] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer shadow-sm"
                >
                  {isUpdating && <Loader2 className="animate-spin" size={16} />}
                  <span>Lưu thông tin</span>
                </button>
              </div>
            </form>
          </div>

          {/* Address Management block */}
          <div className="rounded-3xl border border-[#e7dfbd] bg-white p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#e7dfbd] pb-3">
              <h2 className="text-xl font-black text-[#3d3a2c]">Địa chỉ đặt hàng</h2>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-[#b84a25] bg-white px-4 py-2 text-xs font-extrabold text-[#b84a25] hover:bg-[#b84a25]/5 transition cursor-pointer shadow-xs"
              >
                <Plus size={14} />
                <span>Thêm địa chỉ mới</span>
              </button>
            </div>

            {isAddressesLoading ? (
              <div className="flex h-20 items-center justify-center">
                <Loader2 className="animate-spin text-[#b84a25]" size={24} />
              </div>
            ) : addresses.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className={`rounded-2xl border p-5 shadow-xs relative transition hover:shadow-md hover:-translate-y-0.5 duration-300 ${
                      address.isDefault
                        ? "border-[#b84a25] bg-[#fffaf5]"
                        : "border-[#e7dfbd]/60 bg-white"
                    }`}
                  >
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 rounded-full bg-[#f4fbf0] text-[#4c7d38] px-2.5 py-0.5 text-[10px] font-extrabold border border-[#d2ecbe] shadow-xs">
                        Mặc định
                      </span>
                    )}

                    <div className="flex items-center gap-2 text-sm font-extrabold text-[#3d3a2c]">
                      <MapPin size={15} className="text-[#b84a25] shrink-0" />
                      <span>{address.fullName}</span>
                    </div>

                    <p className="mt-2 text-xs text-[#766f60] font-medium">
                      Điện thoại: <span className="font-semibold text-[#3d3a2c]">{address.phone}</span>
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#766f60] font-medium">
                      {address.addressDetail}, {address.ward}, {address.district}, {address.province}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 px-4 text-sm text-[#766f60] font-medium rounded-2xl bg-[#fffaf0]/50 border border-dashed border-[#e7dfbd] flex flex-col items-center justify-center gap-2">
                <MapPin size={24} className="text-[#b84a25]/40 animate-pulse" />
                <span>Bạn chưa có địa chỉ đặt hàng nào. Hãy bấm "Thêm địa chỉ mới" để thiết lập.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Wallet & Member Info */}
        <div className="space-y-6">
          {/* Wallet card (elegant container matching the theme) */}
          <div className="rounded-3xl border border-[#e7dfbd] bg-[#fffaf0] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-[#b84a25] flex items-center gap-2">
              <Wallet size={16} />
              <span>Ví tích lũy</span>
            </h3>
            
            <div className="border-t border-[#e7dfbd] pt-4">
              <p className="text-xs font-bold text-[#766f60]">Tổng tiền đã tích lũy (5% chi tiêu):</p>
              <p className="text-3xl font-black text-[#b84a25] mt-1">
                {formatVnd(profile?.totalSpent !== undefined ? profile?.totalSpent * 0.05 : 0)}
              </p>
            </div>

            <div className="bg-white border border-[#e7dfbd] p-4 rounded-2xl flex justify-between text-xs text-[#766f60] shadow-sm">
              <span>Tổng chi tiêu:</span>
              <span className="font-extrabold text-[#3d3a2c]">{formatVnd(profile?.totalSpent)}</span>
            </div>
          </div>

          {/* Member stats */}
          <div className="rounded-3xl border border-[#e7dfbd] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#3d3a2c] border-b border-slate-100 pb-2">
              Thông tin thành viên
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#766f60] flex items-center gap-2">
                  <Calendar size={15} className="text-[#b84a25]" />
                  <span>Ngày gia nhập:</span>
                </span>
                <span className="font-extrabold text-[#3d3a2c]">
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#766f60] flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#b84a25]" />
                  <span>Đơn hàng đã đặt:</span>
                </span>
                <span className="font-extrabold text-[#3d3a2c]">
                  {profile?.totalOrders || 0} đơn
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#766f60] flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Trạng thái email:</span>
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${profile?.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-50 text-amber-700 border border-amber-100"}`}>
                  {profile?.isActive ? "Đã xác thực" : "Chưa xác thực"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom section: Recent Orders list */}
      <section className="rounded-3xl border border-[#e7dfbd] bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#e7dfbd] pb-3">
          <h2 className="text-xl font-black text-[#3d3a2c]">Đơn hàng gần đây</h2>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="text-sm font-extrabold text-[#b84a25] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {isRecentOrdersLoading ? (
          <div className="flex h-[20vh] items-center justify-center">
            <Loader2 className="animate-spin text-[#b84a25]" size={28} />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-[#b84a25]">
                      {getInitials(order.shopName)}
                    </div>
                    <span className="text-sm font-extrabold text-[#3f3b2f]">{order.shopName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                    <span className="text-[10px] text-[#8a8370] flex items-center gap-1">
                      <Calendar size={12} />
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString("vi-VN") : ""}
                    </span>
                  </div>
                </div>

                {/* Body info */}
                <div className="flex gap-4">
                  {order.thumbnailUrl ? (
                    <img
                      src={order.thumbnailUrl}
                      alt="Product thumbnail"
                      className="h-16 w-16 rounded-xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                      <ShoppingBag size={24} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-[#3f3b2f] line-clamp-1">{order.firstProductName}</h4>
                    <p className="text-xs text-[#706b5c] mt-0.5">Số lượng món: {order.itemCount}</p>
                    <p className="text-sm font-black text-[#b84a25] mt-1">{formatVnd(order.total)}</p>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#e7dfbd] bg-white px-4 py-2 text-xs font-bold text-[#706b5c] hover:border-[#b84a25] hover:text-[#b84a25] transition cursor-pointer"
                    >
                      <span>Chi tiết</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-sm text-[#706b5c]">
            Không tìm thấy đơn hàng nào gần đây.
          </div>
        )}
      </section>

      {/* Address Modal Dialog */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-3 backdrop-blur-xs">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#fffaf0] shadow-2xl animate-fade-in border border-[#e7dfbd]">
            <div className="flex items-start justify-between border-b border-[#e7dfbd] p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff5f0] text-[#b84a25]">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
                    Địa chỉ nhận hàng
                  </p>
                  <h2 className="mt-1 text-xl font-black text-[#3d3a2c]">
                    Thêm địa chỉ mới
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="rounded-full bg-white p-2 text-[#766f60] border border-slate-200 transition hover:bg-[#f6f4dd]"
                aria-label="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddAddress} className="space-y-4 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#3d3a2c]">Họ và tên *</label>
                  <input
                    type="text"
                    required
                    value={addrFullName}
                    onChange={(e) => setAddrFullName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white px-4 py-2.5 text-sm text-[#3d3a2c] outline-none focus:border-[#b84a25]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#3d3a2c]">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="09xxxxxxxx"
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white px-4 py-2.5 text-sm text-[#3d3a2c] outline-none focus:border-[#b84a25]"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#3d3a2c]">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={addrProvince}
                    onChange={(e) => setAddrProvince(e.target.value)}
                    placeholder="Hồ Chí Minh"
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white px-3 py-2.5 text-sm text-[#3d3a2c] outline-none focus:border-[#b84a25]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#3d3a2c]">Quận / Huyện *</label>
                  <input
                    type="text"
                    required
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    placeholder="Quận 1"
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white px-3 py-2.5 text-sm text-[#3d3a2c] outline-none focus:border-[#b84a25]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-[#3d3a2c]">Phường / Xã *</label>
                  <input
                    type="text"
                    required
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    placeholder="Phường Bến Nghé"
                    className="w-full rounded-xl border border-[#e7dfbd] bg-white px-3 py-2.5 text-sm text-[#3d3a2c] outline-none focus:border-[#b84a25]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#3d3a2c]">Địa chỉ chi tiết *</label>
                <input
                  type="text"
                  required
                  value={addrDetail}
                  onChange={(e) => setAddrDetail(e.target.value)}
                  placeholder="Số 123, đường Nguyễn Huệ"
                  className="w-full rounded-xl border border-[#e7dfbd] bg-white px-4 py-2.5 text-sm text-[#3d3a2c] outline-none focus:border-[#b84a25]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="addrIsDefault"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="rounded border-[#e7dfbd] text-[#b84a25] focus:ring-[#b84a25]"
                />
                <label htmlFor="addrIsDefault" className="text-xs font-bold text-[#3d3a2c] cursor-pointer">
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#e7dfbd] pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  disabled={isSavingAddress}
                  className="rounded-xl border border-[#e7dfbd] bg-white px-5 py-2.5 text-xs font-extrabold text-[#6f6758] transition hover:bg-[#f6f4dd]"
                >
                  Hủy
                </button>

                <button
                  type="submit"
                  disabled={isSavingAddress}
                  className="rounded-xl bg-[#b84a25] px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#9a3b1d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
