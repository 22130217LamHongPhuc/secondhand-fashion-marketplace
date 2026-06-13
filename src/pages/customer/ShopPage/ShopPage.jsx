import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ProductGrid from "../ProductListPage/components/ProductGrid";
import ShopHero from "./components/ShopHero";
import { customerShopService } from "@/services/customerShop";
import { ChevronLeft, ChevronRight } from "lucide-react";

function formatVnd(value) {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function initials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function toDiscountPercent(basePrice, salePrice, discountAmount) {
  const base = Number(basePrice);
  const sale = Number(salePrice);
  const discount = Number(discountAmount);
  if (
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(discount) &&
    discount > 0
  ) {
    return Math.round((discount / base) * 100);
  }
  if (
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(sale) &&
    sale > 0 &&
    sale < base
  ) {
    return Math.round(((base - sale) / base) * 100);
  }
  return null;
}
export default function ShopPage() {
  const { id } = useParams();

  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size] = useState(10);

  useEffect(() => {
    setPage(0);
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    customerShopService
      .getById(id, { page, size })
      .then((data) => {
        if (!isMounted) return;
        setShopData(data);
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e?.message ?? "Không tải được shop");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, page, size]);

  const shop = shopData?.shop ?? null;

  const pagination = shopData?.products
    ? {
        page: shopData.products.page ?? page,
        size: shopData.products.size ?? size,
        totalElements: shopData.products.totalElements ?? 0,
        totalPages: shopData.products.totalPages ?? 0,
        hasNext: Boolean(shopData.products.hasNext),
        hasPrevious: Boolean(shopData.products.hasPrevious),
      }
    : null;

  const products = useMemo(() => {
    const items = shopData?.products?.items;
    if (!Array.isArray(items)) return [];

    return items.map((p) => {
      const percent = toDiscountPercent(
        p.basePrice,
        p.salePrice,
        p.discountAmount,
      );
      const displayPrice = p.salePrice ?? p.basePrice;
      const badge = percent ? `-${percent}%` : null;

      return {
        id: p.id,
        name: p.name,
        price: formatVnd(displayPrice),
        image: p.thumbnailUrl,
        badge,
        badgeType: percent ? "orange" : "green",
        seller: shop?.name ?? p.shopName ?? "",
        rating: shop?.ratingAvg ? `${shop.ratingAvg}★` : "",
        location: "",
        avatar: initials(shop?.name ?? p.shopName ?? ""),
      };
    });
  }, [shopData, shop]);

  return (
    <main className="min-h-screen bg-[#fbfae6] font-sans text-[#3f392f]">
      <ShopHero shop={shop} />

      <div className="mx-8 mt-10">
        {loading ? (
          <div className="rounded-2xl bg-white/60 p-6 text-sm font-semibold text-[#7c7565]">
            Đang tải shop...
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white/60 p-6 text-sm font-semibold text-[#b84a25]">
            {error}
          </div>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">Sản phẩm của shop</h3>
              <p className="text-sm font-semibold text-[#7c7565]">
                {shopData?.products?.totalElements ?? products.length} sản phẩm
              </p>
            </div>

            <ProductGrid products={products} />

            {pagination ? (
              <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={!pagination.hasPrevious || page <= 0}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                    !pagination.hasPrevious || page <= 0
                      ? "cursor-not-allowed bg-[#e8e2c6] text-[#a9a08a]"
                      : "bg-[#e8e2c6] text-[#776f5d] hover:bg-[#ddd5b7]"
                  }`}
                  aria-label="Trang trước"
                >
                  <ChevronLeft size={15} />
                </button>

                <span className="px-2 text-sm font-semibold text-[#7c7565]">
                  Trang {page + 1}
                  {pagination.totalPages ? ` / ${pagination.totalPages}` : ""}
                </span>

                <button
                  type="button"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNext}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-bold transition ${
                    !pagination.hasNext
                      ? "cursor-not-allowed bg-[#e8e2c6] text-[#a9a08a]"
                      : "bg-[#e8e2c6] text-[#776f5d] hover:bg-[#ddd5b7]"
                  }`}
                  aria-label="Trang sau"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            ) : null}
          </section>
        )}
      </div>
    </main>
  );
}
