import { Star, BadgeCheck } from "lucide-react";
import { featuredShops as fallbackFeaturedShops } from "../data";
import { useNavigate } from "react-router-dom";

export default function FeaturedShopSection({ shops, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <section className="mt-12">
        <div className="mb-6">
          <div className="h-3 w-20 rounded bg-[#eee8c9] animate-pulse" />
          <div className="mt-2 h-8 w-56 rounded bg-[#eee8c9] animate-pulse" />
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <article
              key={index}
              className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5"
            >
              <div className="h-40 bg-[#eee8c9] animate-pulse" />
              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/2 rounded bg-[#eee8c9] animate-pulse" />
                    <div className="h-3 w-full rounded bg-[#eee8c9] animate-pulse animate-pulse" />
                    <div className="h-3 w-3/4 rounded bg-[#eee8c9] animate-pulse" />
                  </div>
                  <div className="h-7 w-12 rounded-full bg-[#eee8c9] animate-pulse shrink-0" />
                </div>
                <div className="mt-5 flex items-center justify-between pt-2">
                  <div className="h-4 w-20 rounded bg-[#eee8c9] animate-pulse" />
                  <div className="h-9 w-24 rounded-full bg-[#eee8c9] animate-pulse" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  const resolvedShops = Array.isArray(shops) ? shops : fallbackFeaturedShops;

  const handleViewShop = (id) => {
    navigate(`/shop/${id}`);
  };

  return (
    <section className="mt-12">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c65a2e]">
          Trusted Shops
        </p>

        <h2 className="mt-1 text-3xl font-black tracking-tight text-[#3f392f]">
          Shop nổi bật trong tuần
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {resolvedShops.map((shop) => (
          <article
            onClick={() => handleViewShop(shop.id)}
            key={shop.id}
            className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md"
          >
            <div className="h-40 overflow-hidden bg-[#f4ecd2]">
              <img
                src={shop.image ?? shop.imageUrl ?? shop.thumbnailUrl}
                alt={shop.name}
                className="h-full w-full object-cover transition duration-500 hover:scale-105"
              />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-[#3f392f] flex items-center gap-1">
                    {shop.name}
                    {shop.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />
                    )}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-[#8a7f6c]">
                    {shop.description}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff0df] px-3 py-1 text-sm font-black text-[#c65a2e]">
                  <Star size={14} className="fill-[#c65a2e]" />
                  {shop.rating}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <p className="text-sm font-bold text-[#8a7f6c]">
                  {shop.products} sản phẩm
                </p>

                <button className="rounded-full bg-[#3f392f] px-5 py-2 text-sm font-black text-white transition hover:bg-[#c65a2e]">
                  Xem shop
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
