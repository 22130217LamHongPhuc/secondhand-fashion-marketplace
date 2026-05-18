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
