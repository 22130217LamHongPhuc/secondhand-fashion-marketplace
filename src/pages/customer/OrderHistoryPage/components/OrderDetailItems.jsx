import { PackageSearch, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatVnd } from "../utils";

export default function OrderDetailItems({ items }) {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-black text-[#3d3a2c]">Sản phẩm đã mua</h2>
        <span className="rounded-full bg-[#f6f4dd] px-3 py-1 text-xs font-extrabold text-[#766f60]">
          {items.length} sản phẩm
        </span>
      </div>

      <div className="divide-y divide-[#f0e7c8]">
        {items.map((item) => (
          <div
            key={item.id ?? item.productId}
            className="grid gap-4 py-4 first:pt-0 last:pb-0 sm:grid-cols-[auto_1fr_auto] sm:items-center"
          >
            <button
              type="button"
              onClick={() => item.productId && navigate(`/product/${item.productId}`)}
              className="h-24 w-20 overflow-hidden rounded-xl bg-[#e8e2c6]"
            >
              {item.thumbnailUrl ? (
                <img
                  src={item.thumbnailUrl}
                  alt={item.productName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[#9a907a]">
                  <PackageSearch size={24} />
                </span>
              )}
            </button>

            <div className="min-w-0">
              <button
                type="button"
                onClick={() => item.productId && navigate(`/product/${item.productId}`)}
                className="line-clamp-2 text-left text-sm font-extrabold text-[#3d3a2c] hover:text-[#b84a25]"
              >
                {item.productName}
              </button>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-[#766f60]">
                <span>Đơn giá {formatVnd(item.unitPrice)}</span>
                <span>Số lượng x{item.quantity}</span>
                {item.reviewed ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#edf8ed] px-2 py-0.5 font-bold text-[#2f7d38]">
                    <Star size={12} className="fill-current" />
                    Đã đánh giá
                  </span>
                ) : null}
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#9a907a]">
                Thành tiền
              </p>
              <p className="mt-1 text-base font-black text-[#b84a25]">
                {formatVnd(item.subtotal)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
