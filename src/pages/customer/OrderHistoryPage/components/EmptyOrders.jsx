import { ReceiptText } from "lucide-react";

export default function EmptyOrders({ hasFilter }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#d9cfad] bg-white/70 px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e4] text-[#b84a25]">
        <ReceiptText size={26} />
      </div>
      <h2 className="mt-5 text-lg font-extrabold text-[#3d3a2c]">
        {hasFilter ? "Không có đơn hàng phù hợp" : "Bạn chưa có đơn hàng nào"}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#766f60]">
        {hasFilter
          ? "Thử đổi trạng thái lọc để xem thêm các đơn hàng khác."
          : "Khi bạn mua sản phẩm, toàn bộ trạng thái đơn hàng sẽ được lưu tại đây."}
      </p>
    </div>
  );
}
