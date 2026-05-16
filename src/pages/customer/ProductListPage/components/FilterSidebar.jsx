import { SlidersHorizontal } from "lucide-react";

export default function FilterSidebar() {
  return (
    <aside className="w-[230px] shrink-0 rounded-2xl bg-[#f3f0d6] p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-[#b84a25]">Bộ Lọc</h2>
        <SlidersHorizontal size={15} className="text-[#776f5d]" />
      </div>

      <FilterGroup title="Danh Mục">
        <Checkbox label="Áo" />
        <Checkbox label="Váy" checked />
        <Checkbox label="Quần" />
        <Checkbox label="Phụ kiện" />
      </FilterGroup>

      <FilterGroup title="Kích Cỡ">
        <div className="flex flex-wrap gap-2">
          {["S", "M", "L", "Freesize"].map((size) => (
            <button
              key={size}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                size === "M"
                  ? "bg-[#c04f25] text-white"
                  : "bg-[#e6e0c2] text-[#776f5d]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Tình Trạng">
        <Checkbox label="Mới 99%" checked />
        <Checkbox label="Mới 95%" />
        <Checkbox label="Mới 90%" />
      </FilterGroup>

      <FilterGroup title="Mức Giá">
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Từ"
            className="h-9 rounded-lg bg-[#e7e1c3] px-3 text-xs outline-none placeholder:text-[#8c846d]"
          />
          <input
            placeholder="Đến"
            className="h-9 rounded-lg bg-[#e7e1c3] px-3 text-xs outline-none placeholder:text-[#8c846d]"
          />
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

function Checkbox({ label, checked = false }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-xs text-[#6c6656]">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-sm ${
          checked ? "bg-[#c04f25]" : "bg-[#e1dcc1]"
        }`}
      >
        {checked && <span className="text-[10px] text-white">✓</span>}
      </span>
      {label}
    </label>
  );
}
