/**
 * Model cho pagination metadata tu Spring Boot Page response.
 */
export default class Pagination {
  constructor(raw = {}) {
    this.totalPages = raw.totalPages ?? 0;
    this.totalElements = raw.totalElements ?? 0;
    this.currentPage = raw.number ?? 0;
    this.size = raw.size ?? 5;
    this.isFirst = raw.first ?? true;
    this.isLast = raw.last ?? true;
    this.isEmpty = raw.empty ?? true;
    this.numberOfElements = raw.numberOfElements ?? 0;
  }

  /** So thu tu item dau tien (1-indexed, cho hien thi) */
  get startItem() {
    if (this.isEmpty) return 0;
    return this.currentPage * this.size + 1;
  }

  /** So thu tu item cuoi cung (1-indexed, cho hien thi) */
  get endItem() {
    if (this.isEmpty) return 0;
    return Math.min(this.startItem + this.numberOfElements - 1, this.totalElements);
  }

  /** Tao mang page numbers de render pagination UI */
  get pageNumbers() {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  /** Co trang truoc khong */
  get hasPrevious() {
    return !this.isFirst;
  }

  /** Co trang sau khong */
  get hasNext() {
    return !this.isLast;
  }

  static fromApi(raw) {
    return new Pagination(raw);
  }

  /** Gia tri mac dinh (empty state) */
  static empty() {
    return new Pagination();
  }
}
