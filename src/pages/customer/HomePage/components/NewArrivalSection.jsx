import ProductCard from "./ProductCard";
import { newArrivalProducts } from "../data";

export default function NewArrivalSection() {
  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c65a2e]">
            New Arrival
          </p>

          <h2 className="mt-1 text-3xl font-black tracking-tight text-[#3f392f]">
            Hàng mới lên kệ
          </h2>
        </div>

        <button className="text-sm font-black text-[#c65a2e] transition hover:underline">
          Xem thêm →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {newArrivalProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
