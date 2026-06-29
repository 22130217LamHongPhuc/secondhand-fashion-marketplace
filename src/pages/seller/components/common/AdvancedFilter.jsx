import React, { useState } from "react";
import { ChevronDown, ChevronUp, Filter, RotateCcw } from "lucide-react";

/**
 * AdvancedFilter Component
 * @param {Object} props
 * @param {Function} props.onApply - Callback function called with { fromDate, toDate, minPrice, maxPrice }
 * @param {Object} props.initialValues - Initial values for the filters
 */
const AdvancedFilter = ({ onApply, initialValues = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    fromDate: initialValues.fromDate || "",
    toDate: initialValues.toDate || "",
    minPrice: initialValues.minPrice || "",
    maxPrice: initialValues.maxPrice || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    const formattedFilters = { ...filters };
    if (filters.fromDate && !filters.fromDate.includes("T")) {
      formattedFilters.fromDate = `${filters.fromDate}T00:00:00`;
    }
    if (filters.toDate && !filters.toDate.includes("T")) {
      formattedFilters.toDate = `${filters.toDate}T23:59:59`;
    }

    // Convert price to numbers
    if (filters.minPrice !== "") formattedFilters.minPrice = Number(filters.minPrice);
    if (filters.maxPrice !== "") formattedFilters.maxPrice = Number(filters.maxPrice);

    onApply(formattedFilters);
  };

  const handleReset = () => {
    const defaultFilters = { fromDate: "", toDate: "", minPrice: "", maxPrice: "" };
    setFilters(defaultFilters);
    onApply(defaultFilters);
  };

  return (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl overflow-hidden mt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 bg-neutral-50/50 hover:bg-neutral-50 transition-colors"
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
          <Filter size={18} className="text-neutral-500" />
          Tìm kiếm nâng cao
        </div>
        {isOpen ? (
          <ChevronUp size={18} className="text-neutral-400" />
        ) : (
          <ChevronDown size={18} className="text-neutral-400" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 py-5 border-t border-neutral-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Khoảng thời gian
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  name="fromDate"
                  value={filters.fromDate.split("T")[0] || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="date"
                  name="toDate"
                  value={filters.toDate.split("T")[0] || ""}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-3">
                Khoảng giá (VND)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleChange}
                  placeholder="Từ"
                  min="0"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
                />
                <span className="text-neutral-400">-</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleChange}
                  placeholder="Đến"
                  min="0"
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-50 active:scale-95"
            >
              <RotateCcw size={16} />
              Làm mới
            </button>
            <div
              className="rounded-xl bg-brand-primary px-6 py-2 text-sm font-bold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-95"
            >
              <button
                onClick={handleApply}

              >
                Áp dụng
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilter;
