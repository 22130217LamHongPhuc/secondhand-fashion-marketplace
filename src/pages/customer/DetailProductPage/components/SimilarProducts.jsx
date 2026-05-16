import { Link } from "react-router-dom";

export function SimilarProducts({ items }) {
  return (
    <section className="mt-14">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-extrabold">Sản phẩm tương tự</h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            to={`/product/${item.id}`}
            className="group overflow-hidden rounded-3xl bg-white/80 shadow-sm transition hover:-translate-y-0.5"
          >
            <div className="aspect-[4/3] overflow-hidden bg-[#eee5cf]">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-[#f4d8bd] px-3 py-1 text-xs font-semibold text-[#b84a25]">
                  {item.tag}
                </span>
              </div>

              <p className="line-clamp-2 text-sm font-extrabold text-[#3f3b2f]">
                {item.name}
              </p>

              <div className="mt-2 flex items-end gap-2">
                <p className="text-sm font-extrabold text-[#b84a25]">
                  {item.price}
                </p>
                {item.originalPrice ? (
                  <p className="text-xs text-[#9c927b] line-through">
                    {item.originalPrice}
                  </p>
                ) : null}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
