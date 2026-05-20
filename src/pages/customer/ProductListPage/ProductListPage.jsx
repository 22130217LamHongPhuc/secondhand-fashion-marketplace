import FilterSidebar from "./components/FilterSidebar";
import Pagination from "./components/Pagination";
import ProductGrid from "./components/ProductGrid";
import ProductToolbar from "./components/ProductToolbar";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { customerProductService } from "@/services/customerProduct";
import { customerHomeService } from "@/services/customerHome";

function parseStringList(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function parseNumberList(value) {
  return parseStringList(value)
    .map((part) => Number(part))
    .filter((num) => Number.isFinite(num));
}

const fallbackProducts = [
  {
    id: 1,
    name: "Váy Vintage thêu hoa",
    price: "245.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600",
    badge: "MỚI 99%",
    badgeType: "new",
    seller: "Hà Nguyễn",
    rating: "4.9★",
    location: "HÀ NỘI",
    avatar: "HN",
  },
  {
    id: 2,
    name: "Sơ mi trắng Uniqlo Slim",
    price: "180.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600",
    badge: "LIKE NEW",
    badgeType: "green",
    seller: "Thế Minh",
    rating: "5.0★",
    location: "TP. HCM",
    avatar: "TM",
  },
  {
    id: 3,
    name: "Cardigan Len cổ Sài Size M",
    price: "120.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1611911813383-67769b37a149?q=80&w=600",
    badge: "USED",
    badgeType: "used",
    seller: "Phương Linh",
    rating: "4.5★",
    location: "ĐÀ NẴNG",
    avatar: "PL",
  },
  {
    id: 4,
    name: "Quần Jeans Straight Fit",
    price: "320.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600",
    badge: "MỚI 99%",
    badgeType: "new",
    seller: "An Nguyễn",
    rating: "4.8★",
    location: "CẦN THƠ",
    avatar: "AN",
  },
];

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const legacyCategoryRaw = searchParams.get("category");
  const keyword = searchParams.get("keyword") || "";
  const pageRaw = searchParams.get("page");
  const sizeRaw = searchParams.get("size");
  const sort = searchParams.get("sort") || "newest";
  const condition = searchParams.get("condition") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const page = pageRaw ? Number(pageRaw) : 0;
  const size = sizeRaw ? Number(sizeRaw) : 10;

  const categoryIdsText =
    searchParams.getAll("categoryIds").join(",") ||
    searchParams.get("categoryIds") ||
    (legacyCategoryRaw ? String(legacyCategoryRaw) : "");

  const brandsText =
    searchParams.getAll("brands").join(",") || searchParams.get("brands") || "";

  const originsText =
    searchParams.getAll("origins").join(",") ||
    searchParams.get("origins") ||
    "";

  const categoryIds = parseNumberList(categoryIdsText);
  const brands = parseStringList(brandsText);
  const origins = parseStringList(originsText);

  const [categories, setCategories] = useState([]);
  const [resolvedProducts, setResolvedProducts] = useState(fallbackProducts);
  const [totalElements, setTotalElements] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateQueryParams = (updates) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);

      for (const [key, value] of Object.entries(updates)) {
        const resolved = Array.isArray(value) ? value.join(",") : value;

        if (resolved === null || resolved === undefined || resolved === "") {
          next.delete(key);
        } else {
          next.set(key, String(resolved));
        }
      }

      return next;
    });
  };

  useEffect(() => {
    let isMounted = true;
    customerHomeService
      .getCategories()
      .then((data) => {
        if (!isMounted) return;
        setCategories(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Failed to load categories", err);
        setCategories([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryName = useMemo(() => {
    if (!Array.isArray(categories)) return null;
    if (categoryIds.length !== 1) return null;
    const match = categories.find(
      (c) => Number(c?.id) === Number(categoryIds[0]),
    );
    return match?.name ?? null;
  }, [categories, categoryIds]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await customerProductService.filterAndSortProducts({
          keyword: keyword.trim() || null,
          categoryIds: categoryIds.length > 0 ? categoryIds : null,
          condition: condition || null,
          brands: brands.length > 0 ? brands : null,
          origins: origins.length > 0 ? origins : null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
          sort,
          page: Number.isFinite(page) && page >= 0 ? page : 0,
          size: Number.isFinite(size) ? size : 10,
        });

        if (!isMounted) return;
        setResolvedProducts(Array.isArray(result?.items) ? result.items : []);
        setTotalElements(
          typeof result?.totalElements === "number" ? result.totalElements : 0,
        );
        setTotalPages(
          typeof result?.totalPages === "number" ? result.totalPages : 1,
        );
      } catch (err) {
        if (!isMounted) return;
        console.error("Failed to load products", err);
        setResolvedProducts([]);
        setTotalElements(0);
        setTotalPages(1);
        setError("Không thể tải danh sách sản phẩm.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [
    keyword,
    categoryIdsText,
    condition,
    brandsText,
    originsText,
    minPrice,
    maxPrice,
    sort,
    page,
    size,
  ]);

  const handlePageChange = (nextPage) => {
    const safeNext = Math.max(0, Number(nextPage) || 0);
    updateQueryParams({ page: safeNext });
  };

  const handleSortChange = (nextSort) => {
    updateQueryParams({ sort: nextSort, page: 0 });
  };

  const handleCategoryIdsChange = (nextCategoryIds) => {
    updateQueryParams({
      categoryIds: nextCategoryIds,
      category: null,
      page: 0,
    });
  };

  const handleConditionChange = (nextCondition) => {
    updateQueryParams({ condition: nextCondition || null, page: 0 });
  };

  const handleBrandsCommit = (nextBrandsText) => {
    updateQueryParams({ brands: nextBrandsText || null, page: 0 });
  };

  const handleOriginsCommit = (nextOriginsText) => {
    updateQueryParams({ origins: nextOriginsText || null, page: 0 });
  };

  const handlePriceCommit = ({ minPrice: nextMin, maxPrice: nextMax }) => {
    updateQueryParams({
      minPrice: nextMin || null,
      maxPrice: nextMax || null,
      page: 0,
    });
  };

  const handleKeywordCommit = (nextKeyword) => {
    updateQueryParams({ keyword: nextKeyword || null, page: 0 });
  };

  return (
    <div className="min-h-screen bg-[#f6f4dd] text-[#3f3b2f]">
      <main className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <FilterSidebar
          categories={categories}
          selectedCategoryIds={categoryIds}
          onCategoryIdsChange={handleCategoryIdsChange}
          condition={condition}
          onConditionChange={handleConditionChange}
          brands={brandsText}
          onBrandsCommit={handleBrandsCommit}
          origins={originsText}
          onOriginsCommit={handleOriginsCommit}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onPriceCommit={handlePriceCommit}
        />

        <section className="min-w-0 flex-1">
          <ProductToolbar
            title={
              keyword ? `Kết quả: ${keyword}` : (categoryName ?? "Sản phẩm")
            }
            total={typeof totalElements === "number" ? totalElements : null}
            sortValue={sort}
            onSortChange={handleSortChange}
            keyword={keyword}
            onKeywordCommit={handleKeywordCommit}
          />

          {loading ? (
            <p className="mb-4 text-sm font-medium text-[#8a8370]">
              Đang tải...
            </p>
          ) : null}

          {error ? (
            <p className="mb-4 text-sm font-medium text-[#b84a25]">{error}</p>
          ) : null}

          <ProductGrid products={resolvedProducts} />

          <Pagination
            page={Number.isFinite(page) && page >= 0 ? page : 0}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      </main>
    </div>
  );
}
