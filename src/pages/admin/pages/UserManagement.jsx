import { useEffect, useState } from "react";
import { userService } from "@/services/admin";
import { toastService } from "@/services/toastService";
import ConfirmModal from "@/components/common/ConfirmModal";
import AdminLoader from "@/components/common/AdminLoader";
import {
  Users,
  Store,
  Lock,
  Unlock,
  Search,
  Eye,
  Trash2,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export function UserManagement() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm, roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (roleFilter && roleFilter !== "all") {
        filters.role = roleFilter === "buyer" ? "CUSTOMER" : roleFilter.toUpperCase();
      }

      const [response, statistics] = await Promise.all([
        userService.getAll(page, 20, filters),
        userService.getStatistics().catch(() => null),
      ]);

      let apiUsers = [];
      let totalPages = 1;

      if (response) {
        if (Array.isArray(response)) {
          apiUsers = response;
          totalPages = 1;
        } else if (response.data && Array.isArray(response.data)) {
          apiUsers = response.data;
          totalPages = response.totalPages || response.total_pages || 1;
        } else if (response.content && Array.isArray(response.content)) {
          apiUsers = response.content;
          totalPages = response.totalPages || response.total_pages || 1;
        } else {
          apiUsers = response.data || [];
          totalPages = response.totalPages || response.total_pages || 1;
        }
      }

      setUsers(apiUsers);
      setTotalPages(totalPages);
      setStats(statistics || response?.statistics || {});
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId, reason) => {
    // 1. Optimistic update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false, status: "banned" } : u));
    toastService.success("Khóa tài khoản người dùng thành công!");

    // 2. Background API call
    try {
      await userService.ban(userId, reason);
      const statistics = await userService.getStatistics().catch(() => null);
      if (statistics) setStats(statistics);
    } catch (err) {
      toastService.error("Lỗi: " + err.message);
      // Revert
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true, status: "active" } : u));
    }
  };

  const handleUnbanUser = async (userId) => {
    // 1. Optimistic update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true, status: "active" } : u));
    toastService.success("Mở khóa tài khoản thành công!");

    // 2. Background API call
    try {
      await userService.unban(userId);
      const statistics = await userService.getStatistics().catch(() => null);
      if (statistics) setStats(statistics);
    } catch (err) {
      toastService.error("Lỗi: " + err.message);
      // Revert
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: false, status: "banned" } : u));
    }
  };

  const handleDeleteUser = (userId) => {
    setConfirmDeleteId(userId);
  };

  const handleUpdateRole = async (userId, newRole) => {
    const formattedRole = newRole.toLowerCase().replace("customer", "buyer");
    
    // 1. Optimistic update
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (selectedUser && selectedUser.id === userId) {
      setSelectedUser(prev => ({ ...prev, role: formattedRole }));
    }
    toastService.success("Cập nhật vai trò người dùng thành công!");

    // 2. Background API call
    try {
      await userService.updateRole(userId, newRole);
      const statistics = await userService.getStatistics().catch(() => null);
      if (statistics) setStats(statistics);
    } catch (err) {
      toastService.error("Lỗi cập nhật vai trò: " + err.message);
      // Revert on error
      loadUsers();
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const normalizeUser = (user) => ({
    ...user,
    name: user.name || user.fullName || user.full_name || "Unknown",
    email: user.email || "Chưa cập nhật",
    phone: user.phone || "Chưa cập nhật",
    status: user.status || (user.isActive === false || user.isActive === 0 || user.is_active === false || user.is_active === 0 || user.active === false ? "banned" : "active"),
    role: (user.role || "CUSTOMER").toLowerCase().replace("customer", "buyer"),
    avatar: user.avatar || user.avatarUrl || user.avatar_url || null,
    createdAt: user.createdAt || user.created_at || new Date().toISOString(),
  });

  const normalizedUsers = users.map(normalizeUser);

  const filteredUsersNormalized = normalizedUsers;

  const totalUsersCount = stats.totalUsers ?? users.length;
  const buyerCount = stats.totalCustomers ?? normalizedUsers.filter((user) => user.role === "buyer").length;
  const sellerCount = stats.totalSellers ?? normalizedUsers.filter((user) => user.role === "seller").length;
  const lockedCount = stats.lockedUsers ?? normalizedUsers.filter((user) => user.status === "banned").length;

  const formatRole = (role) => {
    if (!role) return "Người mua";
    const normalized = role.toLowerCase();
    if (normalized === "seller") return "Người bán";
    if (normalized === "admin") return "Quản trị";
    return "Người mua";
  };

  const getRoleClass = (role) => {
    const normalized = (role || "buyer").toLowerCase();
    const base = "inline-flex items-center py-1 px-2.5 rounded-full text-[11px] font-bold ";
    if (normalized === "seller") return base + "bg-[#f7d1ac] text-[#b86d22]";
    if (normalized === "admin") return base + "bg-[#efe2cf] text-[#8b5a3c]";
    return base + "bg-[#e9f4d3] text-[#6a9d2e]";
  };

  const renderContent = () => {
    // We wrap the table content logic in a helper to keep it clean
  };

  return (
    <div className="flex flex-col min-h-full gap-6 animate-[fadeIn_0.3s_ease] text-stone-800">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 mb-1">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 tracking-tight m-0">Quản trị người dùng</h1>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">TỔNG TÀI KHOẢN</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{totalUsersCount.toLocaleString("vi-VN")}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-orange-50 text-[#c85a28]">
            <Users className="w-5 h-5 text-[#c85a28]" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">NGƯỜI MUA</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{buyerCount.toLocaleString("vi-VN")}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-emerald-50 text-emerald-700">
            <Users className="w-5 h-5 text-emerald-700" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">NGƯỜI BÁN</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{sellerCount.toLocaleString("vi-VN")}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-amber-50 text-amber-700">
            <Store className="w-5 h-5 text-amber-700" />
          </div>
        </div>

        <div className="bg-white border border-stone-200/60 rounded-xl p-3.5 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-[10px] font-bold text-stone-400 tracking-wider uppercase">TÀI KHOẢN BỊ KHÓA</div>
            <div className="text-2xl font-black text-stone-900 mt-1">{lockedCount.toLocaleString("vi-VN")}</div>
          </div>
          <div className="w-9 h-9 rounded-lg grid place-items-center bg-rose-50 text-rose-600">
            <Lock className="w-5 h-5 text-rose-600" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex bg-stone-100 border border-stone-200 rounded-xl p-1 gap-1 w-fit flex-wrap">
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              roleFilter === "all"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => {
              setRoleFilter("all");
              setPage(1);
            }}
          >
            Tất cả vai trò
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              roleFilter === "buyer"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => {
              setRoleFilter("buyer");
              setPage(1);
            }}
          >
            Người mua
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              roleFilter === "seller"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => {
              setRoleFilter("seller");
              setPage(1);
            }}
          >
            Người bán
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              roleFilter === "admin"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => {
              setRoleFilter("admin");
              setPage(1);
            }}
          >
            Quản trị
          </button>
          <button
            className={`border-none rounded-lg py-2 px-4 text-[13px] font-bold cursor-pointer transition-all ${
              roleFilter === "locked"
                ? "bg-white text-stone-900 shadow-sm"
                : "bg-transparent text-stone-500 hover:text-stone-800"
            }`}
            onClick={() => {
              setRoleFilter("locked");
              setPage(1);
            }}
          >
            Đã khóa
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl py-2 px-4 flex items-center gap-2.5 w-full sm:w-[320px] shadow-sm focus-within:border-[#c85a28] transition-all">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            className="bg-transparent border-none outline-none text-[13px] text-stone-700 w-full placeholder-stone-400"
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(238,229,219,0.2)] p-6 border border-stone-200/50 flex-1 min-h-0">
        {loading ? (
          <AdminLoader text="Đang tải dữ liệu..." />
        ) : error ? (
          <div className="text-center py-16 text-sm text-rose-600 font-bold bg-rose-50/50 rounded-xl border border-rose-100">Lỗi kết nối: {error}</div>
        ) : filteredUsersNormalized.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse mb-4 text-sm">
                <thead>
                  <tr className="bg-stone-50/80 border-b border-stone-150">
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Tên người dùng</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Email</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Vai trò</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider">Trạng thái</th>
                    <th className="p-3.5 text-left font-bold text-stone-500 text-[11px] uppercase tracking-wider w-[120px]">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsersNormalized.map((user) => (
                    <tr key={user.id} className={`hover:bg-stone-50/60 border-b border-stone-100/80 transition-colors duration-150 ${selectedUsers.has(user.id) ? "bg-orange-50/30" : ""}`}>
                      <td className="p-3.5 text-stone-800 text-[13px] align-middle">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-stone-100 text-[#c85a28] grid place-items-center text-xs font-bold shrink-0 overflow-hidden border border-stone-200/50">
                            {user.avatar ? (
                              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              <span>{(user.name || "U").slice(0, 2).toUpperCase()}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-stone-900 font-extrabold">{user.name}</span>
                            <span className="text-[11px] text-stone-400">
                              Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-600 text-[13px] align-middle font-medium">{user.email}</td>
                      <td className="p-3.5 text-stone-850 text-[13px] align-middle">
                        <span className={getRoleClass(user.role)}>{formatRole(user.role)}</span>
                      </td>
                      <td className="p-3.5 text-stone-850 text-[13px] align-middle">
                        <span className={`inline-flex items-center py-1 px-3 rounded-full text-[11px] font-bold uppercase ${user.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                          }`}>
                          {user.status === "active" ? "Hoạt động" : "Bị khóa"}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-850 text-[13px] align-middle">
                        <div className="flex gap-1.5 items-center">
                          <button
                            className="p-1.5 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 active:scale-95 transition-all border-none cursor-pointer flex items-center justify-center"
                            onClick={() => handleViewDetails(user)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6 flex-wrap gap-4">
              <div className="text-stone-400 text-xs font-semibold">
                Hiển thị {normalizedUsers.length > 0 ? (page - 1) * 30 + 1 : 0} - {Math.min(page * 30, totalUsersCount)} trong số {totalUsersCount} người dùng
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 bg-white border border-stone-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 rounded-xl font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => setPage(pNum)}
                    className={`w-9 h-9 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center border ${page === pNum
                        ? "bg-[#c85a28] text-white border-[#c85a28] shadow-sm"
                        : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                      }`}
                  >
                    {pNum}
                  </button>
                ))}

                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 bg-white border border-stone-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-50 text-stone-700 rounded-xl font-bold transition-all shadow-sm cursor-pointer flex items-center justify-center"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-stone-400 text-sm font-semibold">Không tìm thấy người dùng nào phù hợp.</div>
        )}
      </div>

      {/* User Details Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-[2000]" onClick={() => setShowDetailModal(false)}>
          <div className="relative bg-white p-6 md:p-8 rounded-2xl max-w-[550px] w-[90%] max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200/50 animate-[fadeIn_0.2s_ease]" onClick={(e) => e.stopPropagation()}>
            <button className="absolute top-4 right-4 bg-none border-none text-stone-400 cursor-pointer p-1.5 flex items-center justify-center rounded-xl transition-all hover:bg-stone-50 hover:text-stone-900" onClick={() => setShowDetailModal(false)} title="Đóng">
              <X className="w-4.5 h-4.5" />
            </button>
            <div className="flex flex-col sm:flex-row gap-5 mb-6 items-center sm:items-start text-center sm:text-left pb-6 border-b border-stone-100">
              <img
                src={selectedUser.avatar || "https://via.placeholder.com/100"}
                alt={selectedUser.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#c85a28] shadow-sm"
              />
              <div className="flex flex-col gap-1">
                <h2 className="m-0 text-xl font-extrabold text-stone-900">{selectedUser.name}</h2>
                <p className="m-0 text-stone-400 text-xs font-medium">{selectedUser.email}</p>
                <div className="mt-2.5">
                  <span className={`inline-flex items-center py-1 px-3.5 rounded-full text-[11px] font-bold uppercase ${selectedUser.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                    }`}>
                    {selectedUser.status === "active" ? "Hoạt động" : "Bị khóa"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 mb-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Thông tin cơ bản</h3>
                <div className="bg-stone-50/50 border border-stone-100 rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-[13px] border-b border-stone-100/50 pb-2">
                    <span className="text-stone-400">Số điện thoại:</span>
                    <span className="text-stone-850 font-bold">{selectedUser.phone || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-stone-100/50 pb-2">
                    <span className="text-stone-400">Địa chỉ:</span>
                    <span className="text-stone-850 font-bold">{selectedUser.address || "Chưa cập nhật"}</span>
                  </div>
                  <div className="flex justify-between text-[13px] border-b border-stone-100/50 pb-2">
                    <span className="text-stone-400">Ngày tạo tài khoản:</span>
                    <span className="text-stone-850 font-bold">
                      {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px] items-center pt-1">
                    <span className="text-stone-400">Vai trò:</span>
                    <div className="relative">
                      <select
                        value={(selectedUser.role || "buyer").toUpperCase().replace("BUYER", "CUSTOMER")}
                        onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                        className="appearance-none py-1 pr-8 pl-3 rounded-lg border border-stone-200 bg-white text-stone-700 font-bold text-xs cursor-pointer outline-none focus:border-[#c85a28]"
                      >
                        <option value="CUSTOMER">Người mua</option>
                        <option value="SELLER">Người bán</option>
                        <option value="ADMIN">Quản trị viên</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-stone-450 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Hoạt động mua hàng</h3>
                <div className="bg-stone-50/50 border border-stone-100 rounded-xl p-4 flex flex-col gap-2.5">
                  <div className="flex justify-between text-[13px] border-b border-stone-100/50 pb-2">
                    <span className="text-stone-400">Số đơn hàng:</span>
                    <span className="text-stone-850 font-bold">{selectedUser.totalOrders || 0} đơn</span>
                  </div>
                  <div className="flex justify-between text-[13px] pt-1">
                    <span className="text-stone-400">Tổng chi tiêu:</span>
                    <span className="text-[#c85a28] font-black">
                      {selectedUser.totalSpent?.toLocaleString("vi-VN") || 0} đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2.5 flex-wrap">
              {selectedUser.status === "active" ? (
                <button
                  className="py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white border-none rounded-xl font-bold text-sm transition-all cursor-pointer flex-1"
                  onClick={() => {
                    handleBanUser(selectedUser.id, "Locked by admin");
                    setShowDetailModal(false);
                  }}
                >
                  Khóa tài khoản
                </button>
              ) : (
                <button
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl font-bold text-sm transition-all cursor-pointer flex-1"
                  onClick={() => {
                    handleUnbanUser(selectedUser.id);
                    setShowDetailModal(false);
                  }}
                >
                  Mở khóa tài khoản
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={async () => {
          if (!confirmDeleteId) return;
          try {
            await userService.delete(confirmDeleteId);
            toastService.success("Xóa người dùng thành công!");
            loadUsers();
          } catch (err) {
            toastService.error("Lỗi: " + err.message);
          }
        }}
        title="Xóa người dùng"
        message="Bạn chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
}
