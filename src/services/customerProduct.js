import { http } from "./http";

function unwrapData(response) {
  if (response && typeof response === "object" && "data" in response) {
    return response.data;
  }
  return response;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function formatVnd(value) {
  const amount = toNumber(value);
  if (amount === null) return "";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function avatarFromName(name) {
  if (!name || typeof name !== "string") return "";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? "") : "";
  return (first + last).toUpperCase();
}

function mapApiProductToListCard(product) {
  const basePrice = toNumber(product?.basePrice);
  const salePrice = toNumber(product?.salePrice);
  const displayPrice = salePrice ?? basePrice;

  const shopName = product?.shopName ?? "";

  return {
    id: product?.id,
    name: product?.name ?? "",
    price: displayPrice !== null ? formatVnd(displayPrice) : "",
    image: product?.thumbnailUrl ?? "",
    seller: shopName,
    avatar: avatarFromName(shopName),
  };
}

export const customerProductService = {
  getById: async (id) => {
    const response = await http(`/api/customer/products/${id}`);
    return unwrapData(response);
  },

  createComment: async ({ productId, content, parentId = null }) => {
    const response = await http("/api/customer/comments", {
      method: "POST",
      body: JSON.stringify({
        productId,
        content,
        parentId,
      }),
    });

    return unwrapData(response);
  },

  filterAndSortProducts: async ({
    keyword = null,
    categoryIds = null,
    condition = null,
    brands = null,
    origins = null,
    minPrice = null,
    maxPrice = null,
    sort = "newest",
    page = 0,
    size = 10,
  } = {}) => {
    const params = new URLSearchParams();

    if (keyword) params.set("keyword", String(keyword));

    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      params.set("categoryIds", categoryIds.join(","));
    }

    if (condition) params.set("condition", String(condition));

    if (Array.isArray(brands) && brands.length > 0) {
      params.set("brands", brands.join(","));
    }

    if (Array.isArray(origins) && origins.length > 0) {
      params.set("origins", origins.join(","));
    }

    if (minPrice !== null && minPrice !== undefined && minPrice !== "") {
      params.set("minPrice", String(minPrice));
    }
    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== "") {
      params.set("maxPrice", String(maxPrice));
    }

    params.set("sort", sort || "newest");
    params.set("page", String(page ?? 0));
    params.set("size", String(size ?? 10));

    const query = params.toString();
    const response = await http(
      query ? `/api/customer/products?${query}` : "/api/customer/products",
    );

    const data = unwrapData(response);
    const items = Array.isArray(data?.items) ? data.items : [];

    return {
      items: items.map(mapApiProductToListCard),
      page: data?.page ?? 0,
      size: data?.size ?? size,
      totalElements: data?.totalElements ?? items.length,
      totalPages: data?.totalPages ?? 1,
      hasNext: Boolean(data?.hasNext),
      hasPrevious: Boolean(data?.hasPrevious),
    };
  },

  getByCategory: async (
    categoryId,
    {
      page = 0,
      size = 10,
      sort = null,
      condition = null,
      brand = null,
      originCountry = null,
      minPrice = null,
      maxPrice = null,
    } = {},
  ) => {
    const params = new URLSearchParams();
    if (page !== null && page !== undefined) params.set("page", String(page));
    if (size !== null && size !== undefined) params.set("size", String(size));

    if (sort) params.set("sort", String(sort));
    if (condition) params.set("condition", String(condition));
    if (brand) params.set("brand", String(brand));
    if (originCountry) params.set("originCountry", String(originCountry));
    if (minPrice !== null && minPrice !== undefined && minPrice !== "") {
      params.set("minPrice", String(minPrice));
    }
    if (maxPrice !== null && maxPrice !== undefined && maxPrice !== "") {
      params.set("maxPrice", String(maxPrice));
    }

    const suffix = params.toString() ? `?${params.toString()}` : "";
    const response = await http(
      `/api/customer/categories/${categoryId}/products${suffix}`,
    );

    const data = unwrapData(response);
    const items = Array.isArray(data?.items) ? data.items : [];

    return {
      items: items.map(mapApiProductToListCard),
      page: data?.page ?? 0,
      size: data?.size ?? size,
      totalElements: data?.totalElements ?? items.length,
      totalPages: data?.totalPages ?? 1,
      hasNext: Boolean(data?.hasNext),
      hasPrevious: Boolean(data?.hasPrevious),
    };
  },
};
