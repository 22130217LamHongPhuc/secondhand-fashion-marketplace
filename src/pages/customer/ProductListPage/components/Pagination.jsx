import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page = 0, totalPages = 1, onPageChange }) {
  const current = Number.isFinite(page) ? page : 0;
  const total = Number.isFinite(totalPages) ? totalPages : 1;

  if (total <= 1) return null;

  const pages = getVisiblePages(current, total);

  return (
    <div className="mt-14 flex items-center justify-center gap-2">
      <PageButton
        disabled={current <= 0}
        onClick={() => onPageChange?.(current - 1)}
      >
        <ChevronLeft size={15} />
      </PageButton>

      {pages.map((value, index) => {
        if (value === "ellipsis") {
          return (
            <span key={`e-${index}`} className="px-2 text-sm text-[#8d846f]">
              ...
            </span>
          );
        }

        const isActive = value === current;
        return (
          <PageButton
            key={value}
            active={isActive}
            onClick={() => onPageChange?.(value)}
          >
            {value + 1}
          </PageButton>
        );
      })}

      <PageButton
        disabled={current >= total - 1}
        onClick={() => onPageChange?.(current + 1)}
      >
        <ChevronRight size={15} />
      </PageButton>
    </div>
  );
}

function PageButton({ children, active = false, disabled = false, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex h-9 min-w-9 items-center justify-center rounded-xl text-sm font-bold transition ${
        disabled
          ? "bg-[#e8e2c6] text-[#b6ae99]"
          : active
            ? "bg-[#c04f25] text-white shadow-sm"
            : "bg-[#e8e2c6] text-[#776f5d] hover:bg-[#ddd5b7]"
      }`}
    >
      {children}
    </button>
  );
}

function getVisiblePages(currentPage, totalPages) {
  const last = totalPages - 1;

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }

  const result = [0];
  const start = Math.max(1, currentPage - 1);
  const end = Math.min(last - 1, currentPage + 1);

  if (start > 1) result.push("ellipsis");
  for (let i = start; i <= end; i += 1) result.push(i);
  if (end < last - 1) result.push("ellipsis");
  result.push(last);

  return result;
}
