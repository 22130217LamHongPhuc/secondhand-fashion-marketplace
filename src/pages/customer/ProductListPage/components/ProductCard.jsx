import { BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const showSellerRow =
    Boolean(product?.seller) ||
    Boolean(product?.rating) ||
    Boolean(product?.avatar);

  return (
    <article
      onClick={handleClick}
      className="overflow-hidden rounded-2xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative h-[260px] overflow-hidden bg-[#eee8d2]">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : null}

        {product.badge ? (
          <span className={getBadgeClass(product.badgeType)}>
            {product.badge}
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 text-sm font-extrabold text-[#3f3b2f]">
            {product.name}
          </h3>

          <BadgeCheck size={15} className="shrink-0 text-[#5d8b38]" />
        </div>

        {product.price ? (
          <p className="text-lg font-extrabold text-[#b84a25]">
            {product.price}
          </p>
        ) : null}

        {showSellerRow ? (
          <div className="mt-5 flex items-center justify-between gap-3 text-[10px] text-[#8a8370]">
            <div className="flex min-w-0 items-center gap-2">
              {product.avatar ? (
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5f3ca] text-[10px] font-bold text-[#6a8e3e]">
                  {product.avatar}
                </span>
              ) : null}

              <span className="line-clamp-1">
                {[product.seller, product.rating].filter(Boolean).join(" · ")}
              </span>
            </div>

            {product.location ? (
              <span className="shrink-0 font-semibold uppercase">
                {product.location}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

function getBadgeClass(type) {
  const base =
    "absolute left-4 top-4 rounded-md px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white";

  if (type === "green") {
    return `${base} bg-[#4d7f35]`;
  }

  if (type === "used") {
    return `${base} bg-[#b8791c]`;
  }

  return `${base} bg-[#f26a3d]`;
}
