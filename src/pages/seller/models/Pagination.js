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

  /** Trả mảng page numbers kèm '...' cho ellipsis pagination */
  getVisiblePages(siblings = 1) {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i);
    }

    const pages = [];
    
    // Always include page 0
    pages.push(0);

    const leftBoundary = current - siblings;
    const rightBoundary = current + siblings;

    if (leftBoundary > 1) {
      pages.push('...');
    }

    // Determine range
    const start = Math.max(1, leftBoundary);
    const end = Math.min(total - 2, rightBoundary);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (rightBoundary < total - 2) {
      pages.push('...');
    }

    // Always include last page
    pages.push(total - 1);

    return pages;
  }

  /** Lấy toàn bộ danh sách số trang (dành cho các trang phân trang đơn giản) */
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
    if (!raw) return new Pagination();
    const page = raw.page || {};
    const content = raw.content || [];
    return new Pagination({
      totalPages: page.totalPages ?? 0,
      totalElements: page.totalElements ?? 0,
      number: page.number ?? 0,
      size: page.size ?? 5,
      first: (page.number ?? 0) === 0,
      last: (page.number ?? 0) >= (page.totalPages ?? 1) - 1,
      empty: content.length === 0,
      numberOfElements: content.length,
    });
  }

  /** Gia tri mac dinh (empty state) */
  static empty() {
    return new Pagination();
  }
}
