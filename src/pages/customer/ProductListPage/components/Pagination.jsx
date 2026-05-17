import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination() {
  return (
    <div className="mt-14 flex items-center justify-center gap-2">
      <PageButton>
        <ChevronLeft size={15} />
      </PageButton>

      <PageButton active>1</PageButton>
      <PageButton>2</PageButton>
      <PageButton>3</PageButton>

      <span className="px-2 text-sm text-[#8d846f]">...</span>

      <PageButton>42</PageButton>

      <PageButton>
        <ChevronRight size={15} />
      </PageButton>
    </div>
  );
}

function PageButton({ children, active = false }) {
  return (
    <button
      className={`flex h-9 min-w-9 items-center justify-center rounded-xl text-sm font-bold transition ${
        active
          ? "bg-[#c04f25] text-white shadow-sm"
          : "bg-[#e8e2c6] text-[#776f5d] hover:bg-[#ddd5b7]"
      }`}
    >
      {children}
    </button>
  );
}
