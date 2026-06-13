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

function computeDiscountPercent(basePrice, salePrice, discountAmount) {
  const base = toNumber(basePrice);
  const sale = toNumber(salePrice);
  const discount = toNumber(discountAmount);

  if (base && discount) {
    const percent = Math.round((discount / base) * 100);
    return percent > 0 ? percent : null;
  }

  if (base && sale && sale < base) {
    const percent = Math.round(((base - sale) / base) * 100);
    return percent > 0 ? percent : null;
  }

  return null;
}

function mapApiProductToCard(product) {
  const basePrice = toNumber(product?.basePrice);
  const salePrice = toNumber(product?.salePrice);

  const displayPrice = salePrice ?? basePrice;
  const displayOldPrice =
    basePrice && salePrice && salePrice < basePrice ? basePrice : null;

  const percent = computeDiscountPercent(
    basePrice,
    salePrice,
    product?.discountAmount,
  );

  return {
    id: product?.id,
    brand: product?.shopName ?? product?.brand ?? "",
    name: product?.name ?? "",
    price: formatVnd(displayPrice),
    oldPrice: displayOldPrice ? formatVnd(displayOldPrice) : null,
    discount: percent ? `-${percent}%` : null,
    image: product?.thumbnailUrl ?? product?.image ?? "",
  };
}

function mapApiShopToCard(shop) {
  return {
    id: shop?.id ?? shop?.shopId,
    name: shop?.name ?? shop?.shopName ?? "",
    description: shop?.description ?? "",
    rating: shop?.rating ?? shop?.avgRating ?? shop?.score ?? "",
    products: shop?.products ?? shop?.productCount ?? shop?.totalProducts ?? 0,
    image:
      shop?.image ??
      shop?.imageUrl ??
      shop?.thumbnailUrl ??
      shop?.bannerUrl ??
      "",
  };
}

function groupFeaturedProductsToShops(products) {
  const byShopId = new Map();

  for (const product of products) {
    const shopId = product?.shopId;
    if (!shopId) continue;

    if (!byShopId.has(shopId)) {
      byShopId.set(shopId, {
        id: shopId,
        name: product?.shopName ?? "",
        description: "",
        rating: "",
        products: 0,
        image: product?.thumbnailUrl ?? "",
      });
    }

    const shop = byShopId.get(shopId);
    shop.products += 1;
    if (!shop.image && product?.thumbnailUrl) {
      shop.image = product.thumbnailUrl;
    }
    if (!shop.name && product?.shopName) {
      shop.name = product.shopName;
    }
  }

  return Array.from(byShopId.values());
}

export const customerHomeService = {
  getCategories: async () => {
    const response = await http("/api/customer/categories");
    return unwrapData(response) ?? [];
  },

  getHotDeals: async () => {
    const response = await http("/api/customer/products/hot-deals");
    const data = unwrapData(response) ?? [];
    return Array.isArray(data) ? data.map(mapApiProductToCard) : [];
  },

  getNewArrivals: async () => {
    const response = await http("/api/customer/products/new-arrivals");
    const data = unwrapData(response) ?? [];
    return Array.isArray(data) ? data.map(mapApiProductToCard) : [];
  },

  getFeaturedShopsWeekly: async () => {
    const response = await http("/api/customer/products/featured-shops-weekly");
    const data = unwrapData(response) ?? [];
    if (!Array.isArray(data)) return [];

    const first = data[0];
    const looksLikeProductList =
      first &&
      typeof first === "object" &&
      ("shopId" in first || "shopName" in first) &&
      ("basePrice" in first || "salePrice" in first || "thumbnailUrl" in first);

    if (looksLikeProductList) {
      return groupFeaturedProductsToShops(data);
    }

    return data.map(mapApiShopToCard);
  },
};
