import ProductCard from "./ProductCard";
import ProductCardSkeleton from "./ProductCardSkeleton";
import { dealProducts as fallbackDealProducts } from "../data";

export default function DealSection({ products, loading }) {
  if (loading) {
    return (
      <section className="mt-10">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-[2px] w-8 rounded-full bg-[#c65a2e]" />
              <div className="h-3 w-16 rounded bg-[#eee8c9] animate-pulse" />
            </div>
            <div className="mt-1 h-8 w-44 rounded bg-[#eee8c9] animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </section>
    );
  }
  const resolvedProducts = Array.isArray(products)
    ? products
    : fallbackDealProducts;

  return (
    <section className="mt-10">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="h-[2px] w-8 rounded-full bg-[#c65a2e]" />

            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c65a2e]">
              Limited Time
            </p>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-[#3f392f]">
            Săn deal hời
          </h2>
        </div>

        <button className="text-sm font-black text-[#c65a2e] transition hover:underline">
          Xem tất cả →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {resolvedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
