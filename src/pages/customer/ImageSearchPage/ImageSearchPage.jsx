import { useEffect, useMemo, useState } from "react";
import { ImageUp, Loader2 } from "lucide-react";
import ProductGrid from "../ProductListPage/components/ProductGrid";
import { searchProductsByImage } from "@/services/imageSearch";

export default function ImageSearchPage() {
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const products = useMemo(() => {
    return (items ?? []).map(mapSearchItemToProductCard);
  }, [items]);

  const onPickFile = (event) => {
    const selected = event.target.files?.[0] ?? null;
    setItems([]);
    setError("");
    setFile(selected);
  };

  const onSearch = async () => {
    if (!file || isLoading) return;

    try {
      setIsLoading(true);
      setError("");

      const res = await searchProductsByImage({ file, limit: 10 });
      setItems(Array.isArray(res.data) ? res.data : (res?.items ?? []));
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#e7dfbd] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-lg font-extrabold text-[#3f3b2f]">
              Tìm kiếm bằng hình ảnh
            </h1>
            <p className="mt-1 text-sm text-[#706b5c]">
              Chọn ảnh sản phẩm và bấm Tìm kiếm để xem kết quả.
            </p>
          </div>

          <div className="hidden rounded-xl bg-[#f6f4dd] px-4 py-3 text-sm font-semibold text-[#b84a25] md:flex md:items-center md:gap-2">
            <ImageUp size={18} />
            <span>Image Search</span>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-semibold text-[#3f3b2f]">
                Ảnh sản phẩm
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="mt-2 block w-full cursor-pointer rounded-xl border border-[#e7dfbd] bg-white px-4 py-3 text-sm text-[#3f3b2f] file:mr-4 file:rounded-lg file:border-0 file:bg-[#b84a25] file:px-4 file:py-2 file:text-xs file:font-extrabold file:text-white hover:file:opacity-90"
              />
            </label>

            <button
              type="button"
              onClick={onSearch}
              disabled={!file || isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#b84a25] px-5 py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : null}
              <span>{isLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}</span>
            </button>

            {error ? (
              <div className="rounded-xl border border-[#e7dfbd] bg-[#f6f4dd] px-4 py-3 text-sm text-[#3f3b2f]">
                {error}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl bg-[#eee8d2] p-4">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Ảnh đã chọn"
                className="h-[320px] w-full rounded-xl object-contain"
              />
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-xl border border-dashed border-[#b84a25]/40 bg-white/40">
                <div className="text-center text-sm text-[#706b5c]">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-white">
                    <ImageUp size={18} className="text-[#b84a25]" />
                  </div>
                  Chưa có ảnh được chọn
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-base font-extrabold text-[#3f3b2f]">
            Kết quả ({products.length})
          </h2>
          {file && !isLoading ? (
            <div className="text-xs font-semibold text-[#8a8370]">
              Tip: click vào sản phẩm để xem chi tiết
            </div>
          ) : null}
        </div>

        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl border border-[#e7dfbd] bg-white px-6 py-10 text-center text-sm text-[#706b5c]">
            {file
              ? "Chưa có kết quả. Hãy bấm Tìm kiếm."
              : "Chọn ảnh để bắt đầu tìm kiếm."}
          </div>
        )}
      </section>
    </div>
  );
}

function mapSearchItemToProductCard(item) {
  const basePrice = toNumber(item?.basePrice);
  const salePrice = toNumber(item?.salePrice);
  const discountAmount = toNumber(item?.discountAmount);

  const price = formatVnd(salePrice ?? basePrice);

  return {
    id: item?.id,
    name: item?.name ?? "",
    image: item?.thumbnailUrl ?? "",
    price,
    badge: discountAmount ? `GIẢM ${formatVnd(discountAmount)}` : undefined,
    badgeType: discountAmount ? "green" : undefined,
    seller: item?.shopName ?? "",
    rating:
      typeof item?.score === "number" ? `${Math.round(item.score * 100)}%` : "",
    location: "",
    avatar: getInitials(item?.shopName),
  };
}

function formatVnd(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return "";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

function toNumber(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
  }
  return undefined;
}

function getInitials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}
