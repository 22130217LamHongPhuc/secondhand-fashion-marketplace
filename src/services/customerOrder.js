import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function normalizeOrder(order) {
  return {
    id: order?.id,
    orderCode: order?.orderCode || `#${order?.id ?? ""}`,
    shopName: order?.shopName || "Cửa hàng",
    shopAvatarUrl: order?.shopAvatarUrl || "",
    shopId: order?.shopId,
    status: order?.status || "PENDING",
    paymentMethod: order?.paymentMethod || "",
    paymentStatus: order?.paymentStatus || "",
    subtotal: toNumber(order?.subtotal),
    shippingFee: toNumber(order?.shippingFee),
    discountAmount: toNumber(order?.discountAmount),
    couponCode: order?.couponCode || null,
    total: toNumber(order?.total),
    itemCount: toNumber(order?.itemCount),
    thumbnailUrl: order?.thumbnailUrl || "",
    firstProductName: order?.firstProductName || "Sản phẩm",
    createdAt: order?.createdAt || "",
    updatedAt: order?.updatedAt || "",
  };
}

function normalizeAddress(address) {
  if (!address) return null;

  return {
    id: address.id,
    fullName: address.fullName || "",
    phone: address.phone || "",
    province: address.province || "",
    district: address.district || "",
    ward: address.ward || "",
    addressDetail: address.addressDetail || "",
  };
}

function normalizeOrderItem(item) {
  return {
    id: item?.id,
    productId: item?.productId,
    productName: item?.productName || "Sản phẩm",
    thumbnailUrl: item?.thumbnailUrl || "",
    unitPrice: toNumber(item?.unitPrice),
    quantity: toNumber(item?.quantity, 1),
    subtotal: toNumber(item?.subtotal),
    reviewed: Boolean(item?.reviewed),
  };
}

function normalizeOrderDetail(order) {
  return {
    id: order?.id,
    orderCode: order?.orderCode || `#${order?.id ?? ""}`,
    status: order?.status || "PENDING",
    paymentMethod: order?.paymentMethod || "",
    paymentStatus: order?.paymentStatus || "",
    cancelReason: order?.cancelReason || "",
    shop: order?.shop
      ? {
          id: order.shop.id,
          name: order.shop.name || "Cửa hàng",
          slug: order.shop.slug || "",
          avatarUrl: order.shop.avatarUrl || "",
        }
      : null,
    shippingAddress: normalizeAddress(order?.shippingAddress),
    items: Array.isArray(order?.items) ? order.items.map(normalizeOrderItem) : [],
    subtotal: toNumber(order?.subtotal),
    shippingFee: toNumber(order?.shippingFee),
    discountAmount: toNumber(order?.discountAmount),
    couponInfo: order?.couponInfo
      ? {
          code: order.couponInfo.code,
          name: order.couponInfo.name,
          source: order.couponInfo.source,
        }
      : null,
    total: toNumber(order?.total),
    createdAt: order?.createdAt || "",
    updatedAt: order?.updatedAt || "",
    paidAt: order?.paidAt || "",
    deliveredAt: order?.deliveredAt || "",
  };
}

export const customerOrderService = {
  getHistory: async ({ customerId = null, status = null, page = 0, size = 10 } = {}) => {
    const params = new URLSearchParams();
    if (customerId) {
      params.set("customerId", String(customerId));
    }
    params.set("page", String(page));
    params.set("size", String(size));

    if (status) {
      params.set("status", String(status));
    }

    const url = `/api/customer/orders?${params.toString()}`;
    console.log("[customerOrderService.getHistory] Calling URL:", url, "| customerId:", customerId);

    const response = await http(url);
    console.log("[customerOrderService.getHistory] Raw response:", response);
    const data = unwrapData(response) || {};
    console.log("[customerOrderService.getHistory] Unwrapped data:", data);
    const orders = Array.isArray(data.orders) ? data.orders : [];

    return {
      orders: orders.map(normalizeOrder),
      page: toNumber(data.page),
      size: toNumber(data.size, size),
      totalElements: toNumber(data.totalElements),
      totalPages: toNumber(data.totalPages, 1),
      hasNext: Boolean(data.hasNext),
      hasPrevious: Boolean(data.hasPrevious),
    };
  },

  getDetail: async ({ customerId = null, orderId }) => {
    const params = new URLSearchParams();
    if (customerId) {
      params.set("customerId", String(customerId));
    }

    const response = await http(
      `/api/customer/orders/${orderId}?${params.toString()}`,
    );
    const data = unwrapData(response);

    return normalizeOrderDetail(data);
  },

  cancel: async ({ customerId = null, orderId, reason = "" }) => {
    const params = new URLSearchParams();
    if (customerId) {
      params.set("customerId", String(customerId));
    }

    const token = localStorage.getItem("token");
    const response = await http(
      `/api/customer/orders/${orderId}/cancel?${params.toString()}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      },
    );
    const data = unwrapData(response);

    return normalizeOrderDetail(data);
  },

  checkout: async ({ customerId, shippingAddressId, paymentMethod, items, couponCode }) => {
    const response = await http(`/api/customer/orders/checkout`, {
      method: "POST",
      body: JSON.stringify({
        customerId,
        shippingAddressId,
        paymentMethod,
        items,
        couponCode,
      }),
    });
    const data = unwrapData(response);

    return Array.isArray(data) ? data.map(normalizeOrderDetail) : data;
  },

  repay: async ({ customerId = null, orderId }) => {
    const params = new URLSearchParams();
    if (customerId) {
      params.set("customerId", String(customerId));
    }

    const response = await http(
      `/api/customer/orders/${orderId}/repay?${params.toString()}`,
      {
        method: "POST",
      }
    );
    return unwrapData(response);
  },
};
