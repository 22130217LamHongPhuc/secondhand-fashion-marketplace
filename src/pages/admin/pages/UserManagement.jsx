import { useEffect, useState } from "react";
import { userService } from "@/services/admin";
import "./UserManagement.css";

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

  useEffect(() => {
    loadUsers();
  }, [page, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters = searchTerm ? { search: searchTerm } : {};
      const [response, statistics] = await Promise.all([
        userService.getAll(page, 10, filters),
        userService.getStatistics().catch(() => null),
      ]);
      // Xử lý đa dạng cấu trúc JSON trả về (Axios wraps in response.data)
      const rawData = response?.data || response;
      
      let apiUsers = [];
      if (Array.isArray(rawData)) apiUsers = rawData;
      else if (Array.isArray(rawData?.data)) apiUsers = rawData.data; // Theo định dạng chuẩn API_REQUIREMENTS.md
      else if (Array.isArray(rawData?.content)) apiUsers = rawData.content; // Theo Spring Boot Page mặc định
      else if (Array.isArray(rawData?.items)) apiUsers = rawData.items;

      setUsers(apiUsers);
      setTotalPages(rawData?.totalPages || rawData?.total_pages || 1);
      setStats(statistics || response?.statistics || {});
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map((u) => u.id)));
    }
  };

  const handleBanUser = async (userId, reason) => {
    try {
      await userService.ban(userId, reason);
      alert("Cấm người dùng thành công!");
      loadUsers();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleUnbanUser = async (userId) => {
    try {
      await userService.unban(userId);
      alert("Gỡ cấm người dùng thành công!");
      loadUsers();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Bạn chắc chắn muốn xóa người dùng này?")) {
      try {
        await userService.delete(userId);
        alert("Xóa người dùng thành công!");
        loadUsers();
      } catch (err) {
        alert("Lỗi: " + err.message);
      }
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

  const filteredUsersNormalized = normalizedUsers.filter((user) => {
    if (roleFilter === "all") return true;
    return user.role === roleFilter;
  });

  const totalUsersCount = stats.totalUsers ?? stats.total ?? users.length;
  const newSellerCount =
    stats.newSellers ??
    stats.newUsers ??
    normalizedUsers.filter((user) => user.role === "seller").length;
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
    if (normalized === "seller") return "role-badge seller";
    if (normalized === "admin") return "role-badge admin";
    return "role-badge buyer";
  };

  return (
    <div className="user-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản trị người dùng</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" type="button">
            Lọc vai trò
          </button>
          <button className="btn btn-primary" type="button">
            + Thêm mới
          </button>
        </div>
      </div>

      <div className="control-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Tìm kiếm người dùng, email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="filter-box">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="role-select"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="buyer">Người mua</option>
            <option value="seller">Người bán</option>
            <option value="admin">Quản trị</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">TỔNG NGƯỜI DÙNG</div>
          <div className="stat-row">
            <div className="stat-number">{totalUsersCount.toLocaleString("vi-VN")}</div>
            <div className="stat-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div className="stat-trend">↑12% so với tháng trước</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">NGƯỜI BÁN MỚI</div>
          <div className="stat-row">
            <div className="stat-number">{newSellerCount.toLocaleString("vi-VN")}</div>
            <div className="stat-icon">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
          </div>
          <div className="stat-trend">↑5% so với tháng trước</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">TÀI KHOẢN BỊ KHÓA</div>
          <div className="stat-row">
            <div className="stat-number">{lockedCount.toLocaleString("vi-VN")}</div>
            <div className="stat-icon danger">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          <div className="stat-trend danger">↓2% so với tháng trước</div>
        </div>
      </div>

      {/* User Details Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="user-detail-header">
              <img
                src={selectedUser.avatar || "https://via.placeholder.com/100"}
                alt={selectedUser.name}
                className="user-avatar-large"
              />
              <div className="user-info">
                <h2>{selectedUser.name}</h2>
                <p className="user-email">{selectedUser.email}</p>
                <span className={`user-status status-${selectedUser.status}`}>
                  {selectedUser.status === "active" ? "Hoạt động" : "Bị cấm"}
                </span>
              </div>
            </div>

            <div className="user-detail-body">
              <div className="detail-section">
                <h3>Thông tin cơ bản</h3>
                <div className="detail-item">
                  <span className="label">Số điện thoại:</span>
                  <span className="value">{selectedUser.phone || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Địa chỉ:</span>
                  <span className="value">{selectedUser.address || "Chưa cập nhật"}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Ngày tạo:</span>
                  <span className="value">
                    {new Date(selectedUser.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3>Hoạt động</h3>
                <div className="detail-item">
                  <span className="label">Số đơn hàng:</span>
                  <span className="value">{selectedUser.totalOrders || 0}</span>
                </div>
                <div className="detail-item">
                  <span className="label">Tổng chi tiêu:</span>
                  <span className="value">
                    {selectedUser.totalSpent?.toLocaleString("vi-VN") || 0} đ
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              {selectedUser.status === "active" ? (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    const reason = window.prompt("Nhập lý do cấm:");
                    if (reason) {
                      handleBanUser(selectedUser.id, reason);
                      setShowDetailModal(false);
                    }
                  }}
                >
                  Cấm người dùng
                </button>
              ) : (
                <button
                  className="btn btn-warning"
                  onClick={() => {
                    handleUnbanUser(selectedUser.id);
                    setShowDetailModal(false);
                  }}
                >
                  Gỡ cấm
                </button>
              )}
              <button
                className="btn btn-danger"
                onClick={() => {
                  handleDeleteUser(selectedUser.id);
                  setShowDetailModal(false);
                }}
              >
                Xóa tài khoản
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="users-section">
        {loading ? (
          <div className="loading">Đang tải dữ liệu...</div>
        ) : error ? (
          <div className="error">Lỗi: {error}</div>
        ) : filteredUsersNormalized.length > 0 ? (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Tên người dùng</th>
                  <th>Email</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsersNormalized.map((user) => (
                  <tr key={user.id} className={selectedUsers.has(user.id) ? "selected" : ""}>
                    <td className="user-name-cell">
                      <div className="user-avatar-fallback">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="user-thumb" />
                        ) : (
                          <span>{(user.name || "U").slice(0, 2).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="user-name-meta">
                        <span className="user-name">{user.name}</span>
                        <span className="user-created">
                          Tham gia: {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={getRoleClass(user.role)}>{formatRole(user.role)}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-${user.status}`}>
                        {user.status === "active" ? "Hoạt động" : "Bị cấm"}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <div className="actions-wrapper">
                        <button
                          className="btn-icon btn-view"
                          onClick={() => handleViewDetails(user)}
                          title="Xem chi tiết"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                        {user.status === "active" ? (
                          <button
                            className="btn-icon btn-ban"
                            onClick={() => {
                              const reason = window.prompt("Nhập lý do cấm:");
                              if (reason) handleBanUser(user.id, reason);
                            }}
                            title="Cấm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10" />
                              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            className="btn-icon btn-unban"
                            onClick={() => handleUnbanUser(user.id)}
                            title="Gỡ cấm"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Xóa"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            <line x1="10" y1="11" x2="10" y2="17" />
                            <line x1="14" y1="11" x2="14" y2="17" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="pagination">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Trước
              </button>
              <span className="page-info">
                Trang {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="btn btn-secondary"
              >
                Sau
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">Chưa có người dùng nào</div>
        )}
      </div>
    </div>
  );
}
