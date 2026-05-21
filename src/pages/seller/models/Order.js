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
    this.customerName = raw.customerName ?? "Khách hàng";
    this.status = raw.status ?? "PENDING";
    this.statusLabel = raw.statusLabel ?? "";
    this.subtotal = raw.subtotal ?? 0;
    this.shippingFee = raw.shippingFee ?? 0;
    this.formattedSubtotal = raw.formattedSubtotal ?? "";
    this.formattedTotal = raw.formattedTotal ?? "";
    this.formattedDate = raw.formattedDate ?? "";
    this.paymentMethod = raw.paymentMethod ?? "COD";
    this.paymentMethodLabel = raw.paymentMethodLabel ?? "";
    this.paymentStatus = raw.paymentStatus ?? "UNPAID";
    this.paymentStatusLabel = raw.paymentStatusLabel ?? "";
    this.cancelReason = raw.cancelReason ?? null;
    this.paidAt = raw.paidAt ?? "";
    this.deliveredAt = raw.deliveredAt ?? "";
    this.createdAt = raw.createdAt ?? "";
    this.updatedAt = raw.updatedAt ?? "";

    this.shippingAddress = raw.shippingAddress ?? null;
    this.items = raw.items ?? [];
  }

  static fromApi(raw) {
    return new Order(raw);
  }

  static fromApiList(rawList = []) {
    return rawList.map((item) => Order.fromApi(item));
  }
}
