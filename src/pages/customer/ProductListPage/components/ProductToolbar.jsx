import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";

const SORT_OPTIONS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá: thấp → cao" },
  { value: "price_desc", label: "Giá: cao → thấp" },
];

export default function ProductToolbar({
  title = "Sản phẩm",
  total = null,
  sortValue = "newest",
  onSortChange,
  keyword = "",
  onKeywordCommit,
}) {
  const [draft, setDraft] = useState(keyword ?? "");

  useEffect(() => {
    setDraft(keyword ?? "");
  }, [keyword]);

  useEffect(() => {
    const trimmed = String(draft ?? "").trim();
    const current = String(keyword ?? "").trim();
    if (trimmed === current) return;

    const timer = setTimeout(() => {
      onKeywordCommit?.(trimmed);
    }, 500);

    return () => clearTimeout(timer);
  }, [draft, keyword, onKeywordCommit]);

  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-[#b84a25]">{title}</h1>
        {typeof total === "number" ? (
          <p className="mt-1 text-xs text-[#8a8370]">
            Tìm thấy {total} sản phẩm
          </p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-3 text-xs text-[#6f6858] sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => onKeywordCommit?.(draft.trim())}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onKeywordCommit?.(draft.trim());
              }
            }}
            placeholder="Tìm sản phẩm..."
            className="h-9 w-52 rounded-lg bg-[#e9e4c9] px-4 font-medium outline-none placeholder:text-[#8a8370]"
          />
        </div>

        <span>Sắp xếp theo:</span>

        <div className="relative">
          <select
            value={sortValue}
            onChange={(event) => onSortChange?.(event.target.value)}
            className="h-9 appearance-none rounded-lg bg-[#e9e4c9] px-4 pr-10 font-medium outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          />
        </div>
      </div>
    </div>
  );
}
