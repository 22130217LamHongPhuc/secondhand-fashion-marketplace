import ProductImage from "./ProductImage";

/* ── Enum maps ── */

/** Map condition enum tu backend sang label tieng Viet */
const CONDITION_LABELS = {
  NEW: "Mới",
  LIKE_NEW: "Như mới",
  GOOD: "Tốt",
  FAIR: "Khá",
};

/**
 * Tinh trang thai hien thi tu isActive va stockQuantity.
 *  - isActive && stock > 0  → "Đang bán"
 *  - isActive && stock === 0 → "Hết hàng"
 *  - !isActive               → "Đã ẩn"
 */
const resolveDisplayStatus = (isActive, stockQuantity) => {
  if (!isActive) return "Đã ẩn";
  if (stockQuantity <= 0) return "Hết hàng";
  return "Đang bán";
};

/**
 * Model cho san pham cua seller.
 * Map tu API response cua SellerProductController.
 */
export default class Product {
  constructor(raw = {}) {
    /* ── Raw fields ── */
    this.id = raw.id ?? null;
    this.name = raw.name ?? "";
    this.description = raw.description ?? "";
    this.brand = raw.brand ?? "";
    this.originCountry = raw.originCountry ?? "";
    this.condition = raw.condition ?? "GOOD";
    this.basePrice = raw.basePrice ?? 0;
    this.salePrice = raw.salePrice ?? null;
    this.stockQuantity = raw.stockQuantity ?? 0;
    this.ratingAvg = raw.ratingAvg ?? 0;
    this.totalReviews = raw.totalReviews ?? 0;
    this.isActive = raw.isActive ?? true;
    this.createdAt = raw.createdAt ?? null;
    this.updatedAt = raw.updatedAt ?? null;

    /* ── Nested models ── */
    this.images = ProductImage.fromApiList(raw.images);

    /* ── Computed (derived) ── */
    this.conditionLabel = CONDITION_LABELS[this.condition] || this.condition;
    this.displayStatus = resolveDisplayStatus(this.isActive, this.stockQuantity);
    this.primaryImage = this.images.find((img) => img.isPrimary) || this.images[0] || null;
    this.thumbnailUrl = this.primaryImage?.url || "";
  }

  /* ── Helpers cho UI ── */

  /** Gia hien thi (uu tien salePrice, fallback basePrice) */
  get displayPrice() {
    return this.salePrice ?? this.basePrice;
  }

  /** Gia da format dang "250.000" (VND) */
  get formattedPrice() {
    return new Intl.NumberFormat("vi-VN").format(this.displayPrice);
  }

  /** Base price da format */
  get formattedBasePrice() {
    return new Intl.NumberFormat("vi-VN").format(this.basePrice);
  }

  /** Co dang giam gia khong */
  get hasDiscount() {
    return this.salePrice !== null && this.salePrice < this.basePrice;
  }

  /* ── Factory methods ── */

  static fromApi(raw) {
    return new Product(raw);
  }

  static fromApiList(rawList = []) {
    return rawList.map((item) => Product.fromApi(item));
  }
}

export { CONDITION_LABELS, resolveDisplayStatus };
