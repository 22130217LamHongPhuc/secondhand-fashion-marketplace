import { MessageCircle, ShoppingCart, Star, Truck, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cartService } from "@/services/cartService";
import { toastService } from "@/services/toastService";

export function ProductInfoPanel({ product, isOwnProduct }) {
  const navigateToShop = useNavigate();

  const handleViewShop = (id) => {
    navigateToShop(`/shop/${id}`);
  };

  const handleAddToCart = () => {
    if (isOwnProduct) return;
    const res = cartService.addToCart(product);
    if (res.success) {
      toastService.success("Đã thêm sản phẩm vào giỏ hàng!");
    } else {
      toastService.warning(res.message);
    }
  };

  const handleBuyNow = () => {
    if (isOwnProduct) return;
    const res = cartService.addToCart(product);
    if (res.success || res.message === "Sản phẩm đã có trong giỏ hàng!") {
      navigateToShop("/cart", { state: { buyNowProductId: product.id } });
    } else {
      toastService.error(res.message);
    }
  };

  const handleMessageShop = () => {
    if (isOwnProduct) return;
    if (!localStorage.getItem("token")) {
      toastService.info("Đăng nhập để nhắn tin với shop.");
      return;
    }

    window.dispatchEvent(
      new CustomEvent("open-customer-chat", {
        detail: {
          shop: product.shop,
          initialMessage: "Xin chào shop, mình muốn trao đổi thêm.",
        },
      }),
    );
  };

  const isActionDisabled = product.stockQuantity === 0 || isOwnProduct;

  return (
    <aside className="space-y-6">
      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#d9efc4] px-3 py-1 text-xs font-semibold text-[#4c7d38]">
            {product.category}
          </span>
          {product.condition && (
            <span className="rounded-full bg-[#f4d8bd] px-3 py-1 text-xs font-semibold text-[#b84a25]">
              {product.condition}
            </span>
          )}
          {product.stockQuantity === 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 animate-pulse">
              Hết hàng
            </span>
          ) : product.stockQuantity === 1 ? (
            <span className="rounded-full bg-[#ffeedb] px-3 py-1 text-xs font-bold text-[#b87825]">
              Hàng độc bản
            </span>
          ) : (
            <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-bold text-[#137333]">
              Còn {product.stockQuantity} sản phẩm
            </span>
          )}
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
        <button
          type="button"
          disabled={isOwnProduct}
          onClick={handleMessageShop}
          className={`flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#c04f25] bg-white font-bold text-[#b84a25] transition hover:bg-[#fff3ea] ${isOwnProduct ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <MessageCircle size={18} />
          Nhắn tin với shop
        </button>

        <button
          onClick={handleAddToCart}
          disabled={isActionDisabled}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#c04f25] font-bold text-white shadow-sm transition hover:bg-[#a9411d] disabled:opacity-40 disabled:cursor-not-allowed ${isActionDisabled ? "" : "cursor-pointer"}`}
        >
          <ShoppingCart size={18} />
          {product.stockQuantity === 0 ? "Hết hàng" : "Thêm vào giỏ"}
        </button>

        <button
          onClick={handleBuyNow}
          disabled={isActionDisabled}
          className={`h-14 w-full rounded-xl bg-[#ffc28f] font-bold text-[#6c331b] transition hover:bg-[#ffb678] disabled:opacity-40 disabled:cursor-not-allowed ${isActionDisabled ? "" : "cursor-pointer"}`}
        >
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
