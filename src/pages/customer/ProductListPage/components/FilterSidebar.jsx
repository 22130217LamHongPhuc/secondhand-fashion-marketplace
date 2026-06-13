import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CONDITION_OPTIONS = [
  { value: "NEW", label: "Mới" },
  { value: "LIKE_NEW", label: "Like new" },
  { value: "GOOD", label: "Tốt" },
  { value: "FAIR", label: "Khá" },
];

export default function FilterSidebar({
  categories = [],
  selectedCategoryIds = [],
  onCategoryIdsChange,
  condition = "",
  onConditionChange,
  brands = "",
  onBrandsCommit,
  origins = "",
  onOriginsCommit,
  minPrice = "",
  maxPrice = "",
  onPriceCommit,
}) {
  const [brandDraft, setBrandDraft] = useState(brands ?? "");
  const [originDraft, setOriginDraft] = useState(origins ?? "");
  const [minPriceDraft, setMinPriceDraft] = useState(minPrice ?? "");
  const [maxPriceDraft, setMaxPriceDraft] = useState(maxPrice ?? "");

  const PRICE_STEP = 10000;

  const normalizePriceText = (value) => {
    const raw = String(value ?? "");
    const digits = raw.replace(/[^0-9]/g, "");
    return digits;
  };

  const clampAndCommitPrice = (nextMinDraft, nextMaxDraft) => {
    const minText = normalizePriceText(nextMinDraft);
    const maxText = normalizePriceText(nextMaxDraft);

    const minNum = minText ? Number(minText) : null;
    const maxNum = maxText ? Number(maxText) : null;

    const safeMin = Number.isFinite(minNum) ? minNum : null;
    const safeMax = Number.isFinite(maxNum) ? maxNum : null;

    let resolvedMin = safeMin;
    let resolvedMax = safeMax;

    if (
      resolvedMin !== null &&
      resolvedMax !== null &&
      resolvedMin > resolvedMax
    ) {
      resolvedMax = resolvedMin;
    }

    onPriceCommit?.({
      minPrice: resolvedMin === null ? "" : String(resolvedMin),
      maxPrice: resolvedMax === null ? "" : String(resolvedMax),
    });
  };

  useEffect(() => {
    setBrandDraft(brands ?? "");
  }, [brands]);

  useEffect(() => {
    setOriginDraft(origins ?? "");
  }, [origins]);

  useEffect(() => {
    setMinPriceDraft(minPrice ?? "");
  }, [minPrice]);

  useEffect(() => {
    setMaxPriceDraft(maxPrice ?? "");
  }, [maxPrice]);

  const resolvedCategories = useMemo(() => {
    if (!Array.isArray(categories)) return [];

    return categories
      .filter((c) => c && typeof c === "object")
      .map((c) => ({
        id: c.id,
        name: c.name,
        sortOrder: c.sortOrder ?? 999,
      }))
      .filter((c) => c.id !== null && c.id !== undefined && c.name)
      .sort((a, b) => {
        const order = Number(a.sortOrder) - Number(b.sortOrder);
        if (Number.isFinite(order) && order !== 0) return order;
        return String(a.name).localeCompare(String(b.name), "vi");
      });
  }, [categories]);

  const handleCommitText = (kind) => {
    if (kind === "brand") onBrandsCommit?.(brandDraft.trim());
    if (kind === "origin") onOriginsCommit?.(originDraft.trim());
  };

  useEffect(() => {
    const next = String(brandDraft ?? "").trim();
    const current = String(brands ?? "").trim();
    if (next === current) return;
    const timer = setTimeout(() => {
      onBrandsCommit?.(next);
    }, 500);
    return () => clearTimeout(timer);
  }, [brandDraft, brands, onBrandsCommit]);

  useEffect(() => {
    const next = String(originDraft ?? "").trim();
    const current = String(origins ?? "").trim();
    if (next === current) return;
    const timer = setTimeout(() => {
      onOriginsCommit?.(next);
    }, 500);
    return () => clearTimeout(timer);
  }, [originDraft, origins, onOriginsCommit]);

  const selectedIds = Array.isArray(selectedCategoryIds)
    ? selectedCategoryIds
    : [];

  const isSelected = (id) =>
    selectedIds.some((value) => Number(value) === Number(id));

  const toggleCategory = (id) => {
    const next = isSelected(id)
      ? selectedIds.filter((value) => Number(value) !== Number(id))
      : [...selectedIds, id];
    onCategoryIdsChange?.(next);
  };

  const handleCommitPrice = () => {
    clampAndCommitPrice(minPriceDraft, maxPriceDraft);
  };

  useEffect(() => {
    const nextMin = normalizePriceText(minPriceDraft);
    const nextMax = normalizePriceText(maxPriceDraft);
    const currentMin = normalizePriceText(minPrice);
    const currentMax = normalizePriceText(maxPrice);

    if (nextMin === currentMin && nextMax === currentMax) return;

    const timer = setTimeout(() => {
      clampAndCommitPrice(nextMin, nextMax);
    }, 500);

    return () => clearTimeout(timer);
  }, [minPriceDraft, maxPriceDraft, minPrice, maxPrice]);

  const bumpPrice = (kind, delta) => {
    const currentText = kind === "min" ? minPriceDraft : maxPriceDraft;
    const currentNum = Number(normalizePriceText(currentText) || 0);
    const nextNum = Math.max(0, currentNum + delta);
    const nextText = nextNum === 0 ? "" : String(nextNum);

    if (kind === "min") {
      setMinPriceDraft(nextText);
      return;
    }

    setMaxPriceDraft(nextText);
  };

  return (
    <aside className="w-[230px] shrink-0 rounded-2xl bg-[#f3f0d6] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-[#b84a25]">Bộ Lọc</h2>
        <SlidersHorizontal size={15} className="text-[#776f5d]" />
      </div>

      <FilterGroup title="Danh Mục">
        <Checkbox
          label="Tất cả"
          checked={selectedIds.length === 0}
          onToggle={() => onCategoryIdsChange?.([])}
        />
        {resolvedCategories.map((category) => (
          <Checkbox
            key={category.id}
            label={category.name}
            checked={isSelected(category.id)}
            onToggle={() => toggleCategory(category.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Tình Trạng">
        {CONDITION_OPTIONS.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={condition === option.value}
            onToggle={() =>
              onConditionChange?.(
                condition === option.value ? "" : option.value,
              )
            }
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Thương Hiệu">
        <input
          value={brandDraft}
          onChange={(event) => setBrandDraft(event.target.value)}
          onBlur={() => handleCommitText("brand")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCommitText("brand");
            }
          }}
          placeholder="Ví dụ: Nike, Adidas"
          className="h-9 w-full rounded-lg bg-[#e7e1c3] px-3 text-xs outline-none placeholder:text-[#8c846d]"
        />
      </FilterGroup>

      <FilterGroup title="Xuất Xứ">
        <input
          value={originDraft}
          onChange={(event) => setOriginDraft(event.target.value)}
          onBlur={() => handleCommitText("origin")}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleCommitText("origin");
            }
          }}
          placeholder="Ví dụ: Vietnam, Japan"
          className="h-9 w-full rounded-lg bg-[#e7e1c3] px-3 text-xs outline-none placeholder:text-[#8c846d]"
        />
      </FilterGroup>

      <FilterGroup title="Mức Giá">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex h-9 items-center gap-1 rounded-lg bg-[#e7e1c3] px-2">
            <button
              type="button"
              onClick={() => bumpPrice("min", -PRICE_STEP)}
              className="h-7 w-7 rounded-md bg-[#e1dcc1] text-xs font-bold text-[#6c6656]"
              aria-label="Giảm giá tối thiểu"
            >
              -
            </button>
            <input
              placeholder="Từ"
              inputMode="numeric"
              value={minPriceDraft}
              onChange={(event) =>
                setMinPriceDraft(normalizePriceText(event.target.value))
              }
              onBlur={handleCommitPrice}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCommitPrice();
                }
              }}
              className="h-9 w-full bg-transparent px-1 text-xs outline-none placeholder:text-[#8c846d]"
            />
            <button
              type="button"
              onClick={() => bumpPrice("min", PRICE_STEP)}
              className="h-7 w-7 rounded-md bg-[#e1dcc1] text-xs font-bold text-[#6c6656]"
              aria-label="Tăng giá tối thiểu"
            >
              +
            </button>
          </div>

          <div className="flex h-9 items-center gap-1 rounded-lg bg-[#e7e1c3] px-2">
            <button
              type="button"
              onClick={() => bumpPrice("max", -PRICE_STEP)}
              className="h-7 w-7 rounded-md bg-[#e1dcc1] text-xs font-bold text-[#6c6656]"
              aria-label="Giảm giá tối đa"
            >
              -
            </button>
            <input
              placeholder="Đến"
              inputMode="numeric"
              value={maxPriceDraft}
              onChange={(event) =>
                setMaxPriceDraft(normalizePriceText(event.target.value))
              }
              onBlur={handleCommitPrice}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleCommitPrice();
                }
              }}
              className="h-9 w-full bg-transparent px-1 text-xs outline-none placeholder:text-[#8c846d]"
            />
            <button
              type="button"
              onClick={() => bumpPrice("max", PRICE_STEP)}
              className="h-7 w-7 rounded-md bg-[#e1dcc1] text-xs font-bold text-[#6c6656]"
              aria-label="Tăng giá tối đa"
            >
              +
            </button>
          </div>
        </div>
      </FilterGroup>
    </aside>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-xs font-bold text-[#5f5948]">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Checkbox({ label, checked = false, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2 text-left text-xs text-[#6c6656]"
    >
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-sm ${
          checked ? "bg-[#c04f25]" : "bg-[#e1dcc1]"
        }`}
      >
        {checked && <span className="text-[10px] text-white">✓</span>}
      </span>
      {label}
    </button>
  );
}
