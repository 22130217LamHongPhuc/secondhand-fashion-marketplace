import { http } from "./http";

// Product Management
export const productService = {
  // Get all products
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    return http(`/api/admin/products?${params}`);
  },

  // Get product by ID
  getById: async (id) => {
    return http(`/api/admin/products/${id}`);
  },

  // Create product
  create: async (data) => {
    return http("/api/products", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Update product
  update: async (id, data) => {
    return http(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete product
  delete: async (id) => {
    return http(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
  },

  // Batch delete products
  batchDelete: async (ids) => {
    return http("/api/admin/products/batch/delete", {
      method: "POST",
      body: JSON.stringify({ ids }),
    });
  },

  // Toggle active status
  toggleActive: async (id, active) => {
    return http(`/api/admin/products/${id}/active?active=${active}`, {
      method: "PUT",
    });
  },
};

// User Management
export const userService = {
  // Get all users
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    return http(`/api/admin/users?${params}`);
  },

  // Get user by ID
  getById: async (id) => {
    return http(`/api/admin/users/${id}`);
  },

  // Update user
  update: async (id, data) => {
    return http(`/api/admin/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Update user role
  updateRole: async (id, role) => {
    return http(`/api/admin/users/${id}/role?role=${role}`, {
      method: "PATCH",
    });
  },

  // Delete user
  delete: async (id) => {
    return http(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
  },

  // Ban user
  ban: async (id, reason) => {
    return http(`/api/admin/users/${id}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Unban user
  unban: async (id) => {
    return http(`/api/admin/users/${id}/unban`, {
      method: "POST",
    });
  },

  // Get user statistics
  getStatistics: async () => {
    return http("/api/admin/users/statistics");
  },
};

// Order Management
export const orderService = {
  // Get all orders
  getAll: async (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({
      page,
      limit,
      ...filters,
    });
    return http(`/api/admin/orders?${params}`);
  },

  // Get order by ID
  getById: async (id) => {
    return http(`/api/admin/orders/${id}`);
  },

  // Update order status
  updateStatus: async (id, status) => {
    return http(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  // Cancel order
  cancel: async (id, reason) => {
    return http(`/api/admin/orders/${id}/cancel`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },

  // Get order statistics
  getStatistics: async () => {
    return http("/api/admin/orders/statistics");
  },

  // Export orders
  export: async (format = "csv") => {
    const response = await fetch(
      `${window.location.origin}/api/admin/orders/export?format=${format}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    return response.blob();
  },
};

// Dashboard
export const dashboardService = {
  // Get dashboard statistics
  getStatistics: async () => {
    return http("/api/admin/dashboard/statistics");
  },

  // Get recent activities
  getRecentActivities: async (limit = 10) => {
    return http(`/api/admin/dashboard/activities?limit=${limit}`);
  },

  // Get sales chart data
  getSalesData: async (period = "month") => {
    return http(`/api/admin/dashboard/sales?period=${period}`);
  },
};

// Category Management
export const categoryService = {
  getAll: async () => {
    return http("/api/admin/categories");
  },
  create: async (data) => {
    return http("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  update: async (id, data) => {
    return http(`/api/admin/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  delete: async (id) => {
    return http(`/api/admin/categories/${id}`, {
      method: "DELETE",
    });
  },
};

// Shop Management
export const shopService = {
  getAll: async () => {
    return http("/api/admin/shops");
  },
  toggleVerify: async (id, verify) => {
    return http(`/api/admin/shops/${id}/verify?verify=${verify}`, {
      method: "PUT",
    });
  },
  addStrike: async (id) => {
    return http(`/api/admin/shops/${id}/strike`, {
      method: "PUT",
    });
  },
  toggleActive: async (id, active) => {
    return http(`/api/admin/shops/${id}/active?active=${active}`, {
      method: "PUT",
    });
  },
  resetStrikes: async (id) => {
    return http(`/api/admin/shops/${id}/reset-strikes`, {
      method: "PUT",
    });
  },
};

// Complaint Management
export const complaintService = {
  getAll: async () => {
    return http("/api/admin/complaints");
  },
  updateStatus: async (id, status, resolution) => {
    return http(`/api/admin/complaints/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status, resolution }),
    });
  },
};

