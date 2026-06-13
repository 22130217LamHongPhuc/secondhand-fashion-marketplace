import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const handleViewDetail = (id) => {
    navigate(`/product/${id}`);
  };

  const formatVnd = (value) => {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value === "string") return value;

    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return "";

    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(numeric);
  };

  const imageSrc = product?.image ?? product?.thumbnailUrl ?? "";
  const discountLabel =
    typeof product?.discount === "number"
      ? `-${product.discount}%`
      : product?.discount;

  return (
    <article
      onClick={() => handleViewDetail(product.id)}
      className="overflow-hidden rounded-3xl bg-white p-3 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#f4ecd2]">
        <img
          src={imageSrc}
          alt={product.name}
          className="h-40 w-full object-cover transition duration-500 hover:scale-105"
        />

        {discountLabel && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black text-white">
            {discountLabel}
          </span>
        )}
      </div>

      <div className="px-1 py-4">
        <p className="text-xs font-semibold text-[#8a7f6c]">{product.brand}</p>

        <h3 className="mt-1 line-clamp-1 text-base font-black text-[#3f392f]">
          {product.name}
        </h3>

        <div className="mt-3 flex items-end justify-between gap-3">
          <p className="text-lg font-black text-[#e34f26]">
            {formatVnd(product.price)}
          </p>

          {product.oldPrice && (
            <p className="text-xs font-semibold text-[#b8ae9b] line-through">
              {formatVnd(product.oldPrice)}
            </p>
          )}

          {product.tag && (
            <span className="rounded-md bg-lime-100 px-2 py-1 text-[10px] font-black text-green-700">
              {product.tag}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
