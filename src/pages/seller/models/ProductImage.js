/**
 * Model cho anh san pham.
 * Map tu API response: images[].
 */
export default class ProductImage {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.url = raw.url ?? "";
    this.sortOrder = raw.sortOrder ?? 0;
    this.isPrimary = raw.isPrimary ?? false;
  }

  /**
   * Factory: tao tu API response.
   */
  static fromApi(raw) {
    return new ProductImage(raw);
  }

  /**
   * Factory: tao mang tu API response.
   */
  static fromApiList(rawList = []) {
    return rawList.map((item) => ProductImage.fromApi(item));
  }
}
