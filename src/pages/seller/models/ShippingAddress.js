export default class ShippingAddress {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.fullName = raw.fullName ?? "";
    this.phone = raw.phone ?? "";
    this.province = raw.province ?? "";
    this.district = raw.district ?? "";
    this.ward = raw.ward ?? "";
    this.addressDetail = raw.addressDetail ?? "";
    this.isDefault = raw.isDefault ?? false;
    this.createdAt = raw.createdAt ?? null;
  }

  get fullAddress() {
    const parts = [this.addressDetail, this.ward, this.district, this.province].filter(Boolean);
    return parts.join(", ");
  }

  static fromApi(raw) {
    if (!raw) return null;
    return new ShippingAddress(raw);
  }
}
