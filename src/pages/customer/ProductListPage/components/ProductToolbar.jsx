import { ChevronDown } from "lucide-react";

export default function ProductToolbar() {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-[#b84a25]">Váy Mùa Thu</h1>
        <p className="mt-1 text-xs text-[#8a8370]">Tìm thấy 124 sản phẩm</p>
      </div>

      <div className="flex items-center gap-3 text-xs text-[#6f6858]">
        <span>Sắp xếp theo:</span>

        <button className="flex h-9 items-center gap-2 rounded-lg bg-[#e9e4c9] px-4 font-medium">
          Mới nhất
          <ChevronDown size={14} />
        </button>
      </div>
    </div>
  );
}
