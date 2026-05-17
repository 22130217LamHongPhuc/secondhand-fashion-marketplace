import ShippingAddress from "./ShippingAddress";

export const ORDER_STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  SHIPPING: "Đang giao",
  CANCELLED: "Đã hủy",
  DONE: "Hoàn thành",
};

export const PAYMENT_METHOD_LABELS = {
  WALLET: "Ví điện tử",
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản",
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};

export default class Order {
  constructor(raw = {}) {
    this.id = raw.id ?? null;
    this.orderCode = raw.orderCode ?? "";
    this.shippingAddress = ShippingAddress.fromApi(raw.shippingAddress);
    this.subtotal = raw.subtotal ?? 0;
    this.shippingFee = raw.shippingFee ?? 0;
    this.status = raw.status ?? "PENDING";
    this.paymentMethod = raw.paymentMethod ?? "COD";
    this.paymentStatus = raw.paymentStatus ?? "UNPAID";
    this.cancelReason = raw.cancelReason ?? null;
    this.paidAt = raw.paidAt ?? null;
    this.deliveredAt = raw.deliveredAt ?? null;
    this.createdAt = raw.createdAt ?? null;
    this.updatedAt = raw.updatedAt ?? null;

    this.statusLabel = ORDER_STATUS_LABELS[this.status] || this.status;
    this.paymentMethodLabel = PAYMENT_METHOD_LABELS[this.paymentMethod] || this.paymentMethod;
    this.paymentStatusLabel = PAYMENT_STATUS_LABELS[this.paymentStatus] || this.paymentStatus;
  }

  get displayTotal() {
    return this.subtotal + this.shippingFee;
  }

  get formattedSubtotal() {
    return new Intl.NumberFormat("vi-VN").format(this.subtotal) + "đ";
  }

  get formattedTotal() {
    return new Intl.NumberFormat("vi-VN").format(this.displayTotal) + "đ";
  }

  get formattedDate() {
    if (!this.createdAt) return "";
    const date = new Date(this.createdAt);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  }

  static fromApi(raw) {
    return new Order(raw);
  }

  static fromApiList(rawList = []) {
    return rawList.map((item) => Order.fromApi(item));
  }
}
