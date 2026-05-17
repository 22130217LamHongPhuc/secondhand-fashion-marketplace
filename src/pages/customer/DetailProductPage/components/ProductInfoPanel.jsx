import { ShoppingCart, Star, Truck, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProductInfoPanel({ product }) {
  const navigateToShop = useNavigate();

  const handleViewShop = (id) => {
    navigateToShop(`/shop/${id}`);
  };

  return (
    <aside className="space-y-6">
      <div>
        <div className="mb-3 flex items-center gap-2">
          <span className="rounded-full bg-[#d9efc4] px-3 py-1 text-xs font-semibold text-[#4c7d38]">
            {product.category}
          </span>
          <span className="rounded-full bg-[#f4d8bd] px-3 py-1 text-xs font-semibold text-[#b84a25]">
            {product.condition}
          </span>
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-[#3d3a2c]">
          {product.title}
        </h2>

        <div className="mt-3 flex items-end gap-3">
          <p className="text-2xl font-extrabold text-[#b84a25]">
            {product.price}
          </p>
          {product.originalPrice ? (
            <p className="text-sm text-[#9c927b] line-through">
              {product.originalPrice}
            </p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-[#ebe2c8] bg-[#faf7e7] p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#d8d0ba]">
            <img
              src={product.shop.avatar}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-[#3f3b2f]">{product.shop.name}</h3>
            <p className="text-xs text-[#7c7565]">{product.shop.meta}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#587d36]">
              <Star size={13} className="fill-current" />
              <span>{product.shop.verified}</span>
            </div>
          </div>

          <button
            onClick={() => handleViewShop(product.shop.id)}
            className="text-sm font-bold text-[#b84a25] hover:underline"
          >
            Xem tiệm
          </button>
        </div>
      </div>

      <div className="space-y-3 pt-8">
        <button className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c04f25] font-bold text-white shadow-sm transition hover:bg-[#a9411d]">
          <ShoppingCart size={18} />
          Thêm vào giỏ
        </button>

        <button className="h-14 w-full rounded-xl bg-[#ffc28f] font-bold text-[#6c331b] transition hover:bg-[#ffb678]">
          Mua ngay
        </button>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-[#7b705f]">
        <div className="flex items-center gap-2">
          <Truck size={17} className="text-[#b84a25]" />
          Giao hàng toàn quốc
        </div>

        <div className="flex items-center gap-2">
          <RotateCcw size={17} className="text-[#b84a25]" />7 ngày đổi trả
        </div>
      </div>
    </aside>
  );
}
