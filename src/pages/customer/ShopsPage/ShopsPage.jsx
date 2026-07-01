import { customerShopService } from "@/services/customerShop";
import Pagination from "../ProductListPage/components/Pagination";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function initials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function formatRating(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return numeric.toFixed(numeric % 1 === 0 ? 0 : 2);
}

export default function ShopsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";
  const pageRaw = searchParams.get("page");
  const sizeRaw = searchParams.get("size");

  const page = pageRaw ? Number(pageRaw) : 0;
  const size = sizeRaw ? Number(sizeRaw) : 10;

  const [draft, setDraft] = useState(keyword ?? "");
  const [items, setItems] = useState([]);
  const [totalElements, setTotalElements] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateQueryParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined || value === "") {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }

      return next;
    });
  };

  useEffect(() => {
    setDraft(keyword ?? "");
  }, [keyword]);

  useEffect(() => {
    const trimmed = String(draft ?? "").trim();
    const current = String(keyword ?? "").trim();
    if (trimmed === current) return;

    const timer = setTimeout(() => {
      updateQueryParams({ keyword: trimmed || null, page: 0 });
    }, 500);

    return () => clearTimeout(timer);
  }, [draft, keyword]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await customerShopService.list({
          keyword: keyword.trim() || null,
          page: Number.isFinite(page) && page >= 0 ? page : 0,
          size: Number.isFinite(size) && size > 0 ? size : 10,
        });

        if (!isMounted) return;

        let fetchedItems = Array.isArray(result?.items) ? result.items : [];
        let adjustTotal = 0;
        try {
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const currentUser = JSON.parse(storedUser);
            if (currentUser && currentUser.userId) {
              const originalLength = fetchedItems.length;
              fetchedItems = fetchedItems.filter((shop) => shop.sellerId !== currentUser.userId);
              adjustTotal = fetchedItems.length - originalLength;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }

        setItems(fetchedItems);
        setTotalElements(
          typeof result?.totalElements === "number" ? Math.max(0, result.totalElements + adjustTotal) : 0,
        );
        setTotalPages(
          typeof result?.totalPages === "number" ? result.totalPages : 1,
        );
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load shops", err);
        setItems([]);
        setTotalElements(0);
        setTotalPages(1);
        setError("Không thể tải danh sách shop.");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [keyword, page, size]);

  const title = useMemo(() => {
    const trimmed = String(keyword ?? "").trim();
    if (trimmed) return `Kết quả: ${trimmed}`;
    return "Cửa hàng";
  }, [keyword]);

  const handlePageChange = (nextPage) => {
    const safeNext = Math.max(0, Number(nextPage) || 0);
    updateQueryParams({ page: safeNext });
  };

  return (
    <div className="min-h-screen bg-[#f6f4dd] text-[#3f3b2f]">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#b84a25]">{title}</h1>
          {typeof totalElements === "number" ? (
            <p className="mt-1 text-xs text-[#8a8370]">
              Tìm thấy {totalElements} shop
            </p>
          ) : null}
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="flex h-9 w-full items-center gap-2 rounded-lg bg-[#e9e4c9] px-3 text-xs text-[#6f6858] sm:w-72">
            <Search size={15} className="text-[#8a8370]" />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  updateQueryParams({ keyword: draft.trim() || null, page: 0 });
                }
              }}
              placeholder="Tìm shop..."
              className="h-9 w-full bg-transparent font-medium outline-none placeholder:text-[#8a8370]"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <p className="mb-4 text-sm font-medium text-[#8a8370]">Đang tải...</p>
      ) : null}

      {error ? (
        <p className="mb-4 text-sm font-medium text-[#b84a25]">{error}</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((shop) => {
          const avatarText = initials(shop?.name);
          const ratingText = formatRating(shop?.ratingAvg);

          return (
            <button
              key={shop?.id}
              type="button"
              onClick={() => navigate(`/shop/${shop?.id}`)}
              className="group overflow-hidden rounded-2xl bg-white/60 text-left transition hover:bg-white/70"
            >
              <div className="relative h-28 w-full bg-[#e8e2c6]">
                {shop?.bannerUrl ? (
                  <img
                    src={shop.bannerUrl}
                    alt={shop?.name || "Shop"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}

                <div className="absolute -bottom-5 left-4 flex h-10 w-10 items-center justify-center rounded-full border border-[#b84a25] bg-white/70 text-xs font-extrabold text-[#b84a25]">
                  {shop?.avatarUrl ? (
                    <img
                      src={shop.avatarUrl}
                      alt={shop?.name || "Shop"}
                      className="h-full w-full rounded-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    avatarText
                  )}
                </div>
              </div>

              <div className="px-4 pb-4 pt-7">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-1 text-sm font-extrabold text-[#3f3b2f] group-hover:text-[#b84a25]">
                    {shop?.name || "Shop"}
                  </h2>

                  <div className="flex items-center gap-2">
                    {shop?.isVerified ? (
                      <span className="rounded-full bg-[#e8e2c6] px-2 py-1 text-[10px] font-bold text-[#776f5d]">
                        Verified
                      </span>
                    ) : null}
                    {shop?.isActive === false ? (
                      <span className="rounded-full bg-[#e8e2c6] px-2 py-1 text-[10px] font-bold text-[#776f5d]">
                        Tạm đóng
                      </span>
                    ) : null}
                  </div>
                </div>

                {shop?.description ? (
                  <p className="mt-2 line-clamp-2 text-xs text-[#6f6858]">
                    {shop.description}
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-[#8a8370]">Chưa có mô tả</p>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-[#6f6858]">
                  <span>
                    {ratingText ? `${ratingText}★` : "Chưa có đánh giá"}
                    {typeof shop?.totalReviews === "number"
                      ? ` (${shop.totalReviews})`
                      : ""}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <Pagination
        page={Number.isFinite(page) && page >= 0 ? page : 0}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
