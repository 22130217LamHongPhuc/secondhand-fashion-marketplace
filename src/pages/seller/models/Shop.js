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
    this.provinceId = raw.provinceId ?? null;
    this.provinceName = raw.provinceName ?? "";
    this.districtId = raw.districtId ?? null;
    this.districtName = raw.districtName ?? "";
    this.wardCode = raw.wardCode ?? "";
    this.wardName = raw.wardName ?? "";
    this.addressDetail = raw.addressDetail ?? "";
    this.isActive = raw.isActive ?? true;
    this.isVerified = raw.isVerified ?? false;
    this.warningStrikes = raw.warningStrikes ?? 0;
  }

  static fromApi(raw) {
    return new Shop(raw);
  }
}
