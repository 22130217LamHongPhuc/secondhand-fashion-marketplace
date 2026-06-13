import { PackageCheck, PackageSearch, RotateCcw, Truck } from "lucide-react";

export const ORDER_STATUS_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "SHIPPING", label: "Đang giao" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "DONE", label: "Hoàn thành" },
];

export const ORDER_STATUS_META = {
  PENDING: {
    label: "Chờ xác nhận",
    className: "border-[#f5d6a3] bg-[#fff6df] text-[#946300]",
    icon: PackageSearch,
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    className: "border-[#d7d0ff] bg-[#f0edff] text-[#5a46ad]",
    icon: PackageCheck,
  },
  SHIPPING: {
    label: "Đang giao",
    className: "border-[#b8dcff] bg-[#e9f5ff] text-[#1767a8]",
    icon: Truck,
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-[#f5c0b6] bg-[#fff0ed] text-[#b23b24]",
    icon: RotateCcw,
  },
  DONE: {
    label: "Hoàn thành",
    className: "border-[#bfe5c4] bg-[#edf8ed] text-[#2f7d38]",
    icon: PackageCheck,
  },
};

export const PAYMENT_METHOD_LABELS = {
  WALLET: "Ví điện tử",
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

export const PAYMENT_STATUS_LABELS = {
  UNPAID: "Chưa thanh toán",
  PAID: "Đã thanh toán",
  REFUNDED: "Đã hoàn tiền",
};
