/**
 * Model cho Shop cua seller.
 * Map tu API response cua SellerShopController.
 */
export default class Shop {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.name = raw.name ?? "";
    this.slug = raw.slug ?? "";
    this.description = raw.description ?? "";
    this.avatarUrl = raw.avatarUrl ?? "";
    this.bannerUrl = raw.bannerUrl ?? "";
  }

  static fromApi(raw) {
    return new Shop(raw);
  }
}
