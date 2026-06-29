import React, { useState, useEffect, useRef } from "react";
import { Search, Copy } from "lucide-react";

/**
 * CloneDataAutocomplete Component
 * @param {Object} props
 * @param {Function} props.fetchOptions - Function that takes a keyword and returns a Promise resolving to an array of items { id, title, image }
 * @param {Function} props.onSelectData - Callback called when an item is selected, receives the selected item's full detail. Needs a fetchDetail prop.
 * @param {Function} props.fetchDetail - Function to fetch detail by id.
 * @param {String} props.placeholder - Placeholder for input
 */
const CloneDataAutocomplete = ({ fetchOptions, fetchDetail, onSelectData, placeholder = "Tìm kiếm dữ liệu cũ để sao chép..." }) => {
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  const [debouncedKeyword, setDebouncedKeyword] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(keyword);
    }, 400);
    return () => clearTimeout(handler);
  }, [keyword]);

  useEffect(() => {
    if (debouncedKeyword.trim()) {
      setLoading(true);
      fetchOptions(debouncedKeyword)
        .then((res) => {
          setOptions(res);
          setIsOpen(true);
        })
        .catch(() => setOptions([]))
        .finally(() => setLoading(false));
    } else {
      setOptions([]);
      setIsOpen(false);
    }
  }, [debouncedKeyword, fetchOptions]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (id) => {
    setIsOpen(false);
    setKeyword("");
    try {
      const detail = await fetchDetail(id);
      onSelectData(detail);
    } catch (e) {
      console.error("Failed to fetch detail for clone", e);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mb-6">
      <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-brand-primary">
        <Copy size={16} />
        <span>Sao chép dữ liệu cũ (Tùy chọn)</span>
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-7 -translate-y-1/2 text-neutral-400" />
        <input
          type="text"
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            if (!isOpen && e.target.value) setIsOpen(true);
          }}
          onFocus={() => { if (options.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
        />
        {loading && <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-neutral-400">Đang tìm...</div>}
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 cursor-pointer border-b border-neutral-50 last:border-0 transition-colors"
            >
              {opt.image && (
                <img src={opt.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-neutral-100" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-700 truncate">{opt.title}</p>
                {opt.subtitle && <p className="text-xs text-neutral-400 truncate">{opt.subtitle}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
      {isOpen && !loading && options.length === 0 && debouncedKeyword && (
        <div className="absolute z-10 mt-1 w-full rounded-xl border border-neutral-200 bg-white shadow-lg px-4 py-3 text-sm text-neutral-500 text-center">
          Không tìm thấy kết quả phù hợp
        </div>
      )}
    </div>
  );
};

export default CloneDataAutocomplete;
