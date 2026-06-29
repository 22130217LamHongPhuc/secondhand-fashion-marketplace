import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Pencil,
  Calendar,
  Tag,
  ChevronDown
} from "lucide-react";
import { useSellerPromotionList, useChangePromotionStatus } from "../../hooks";
import { toastService } from "@/services/toastService";
import { Pagination } from "../../models";
import TableSkeleton from "../../components/common/TableSkeleton";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import ToggleSwitch from "../../components/common/ToggleSwitch";
import AdvancedFilter from "../../components/common/AdvancedFilter";

const StatusBadge = ({ status }) => {
  const config = {
    ACTIVE: {
      label: "Đang hoạt động",
      dot: "bg-accent-green",
      pill: "border-accent-green/30 text-neutral-700",
    },
    PAUSED: {
      label: "Tạm dừng",
      dot: "bg-neutral-400",
      pill: "border-neutral-300 text-neutral-500",
    },
    EXPIRED: {
      label: "Hết hạn",
      dot: "bg-accent-red",
      pill: "border-accent-red/40 text-neutral-700",
    },
  };

  const c = config[status] || config.ACTIVE;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium ${c.pill}`}
    >
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const ShopPromotionsPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [advancedFilters, setAdvancedFilters] = useState({});
  const [sortBy, setSortBy] = useState("newest");
  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchInput);
      setCurrentPage(0); // Reset page when search term changes
    }, 400);

    return () => clearTimeout(handler);
  }, [searchInput]);

  const queryParams = {
    page: currentPage,
    size: 12,
    sortBy,
  };
  // Note: Backend might need to support keyword search later, but we pass it anyway
  if (debouncedKeyword.trim()) {
    queryParams.keyword = debouncedKeyword.trim();
  }
  
  if (advancedFilters.fromDate) queryParams.fromDate = advancedFilters.fromDate;
  if (advancedFilters.toDate) queryParams.toDate = advancedFilters.toDate;
  if (advancedFilters.minPrice !== undefined) queryParams.minPrice = advancedFilters.minPrice;
  if (advancedFilters.maxPrice !== undefined) queryParams.maxPrice = advancedFilters.maxPrice;

  const { data, isLoading: loading, error } = useSellerPromotionList(queryParams);
  const { mutateAsync: changeStatus } = useChangePromotionStatus();

  const promotions = data?.promotions || [];
  const pagination = data?.pagination || Pagination.empty();

  const getPages = () => {
    const total = pagination.totalPages;
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i);
    }

    let start;
    if (currentPage <= 1) {
      start = 0;
    } else if (currentPage >= total - 3) {
      start = total - 3;
    } else {
      start = currentPage;
    }

    const pages = [start, start + 1, start + 2];
    if (start + 2 < total - 1) {
      pages.push("...");
      pages.push(total - 1);
    }
    return pages;
  };

  const handleToggleStatus = async (promotion, currentChecked) => {
    const newStatus = currentChecked ? "PAUSED" : "ACTIVE";
    try {
      await changeStatus({ id: promotion.id, status: newStatus });
      toastService.success(`Đã ${newStatus === 'ACTIVE' ? 'kích hoạt' : 'tạm dừng'} khuyến mãi!`);
    } catch (e) {
      console.error(e);
      toastService.error(e.response?.data?.message || "Lỗi khi thay đổi trạng thái!");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold text-neutral-800">
          Mã khuyến mãi Shop
        </h1>
        <div className="rounded-xl bg-brand-primary text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
          <button
            onClick={() => navigate("/seller/shop-promotions/new")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 w-full h-full"
          >
            <Plus size={18} />
            <span>Thêm mã mới</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-full max-w-md flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-7 -translate-y-1/2 text-neutral-400"
          />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm kiếm theo mã..."
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(0);
            }}
            className="appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-2.5 pr-10 text-sm font-medium text-neutral-600 outline-none transition-all hover:bg-neutral-50 focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10 cursor-pointer"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      <AdvancedFilter onApply={(filters) => { setAdvancedFilters(filters); setCurrentPage(0); }} />

      {/* Data Area */}
      {loading ? (
        <TableSkeleton columns={3} rows={3} />
      ) : error ? (
        <ErrorState message={error.message || error} />
      ) : promotions.length === 0 ? (
        <EmptyState
          title="Không có mã khuyến mãi"
          description="Bạn chưa tạo mã khuyến mãi nào cho shop."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <div key={promo.id} className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-light/30 text-brand-primary">
                    <Tag size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-800">{promo.code}</h3>
                    <p className="text-xs text-neutral-500 line-clamp-1">{promo.name}</p>
                  </div>
                </div>
                <StatusBadge status={promo.status} />
              </div>

              <div className="space-y-3 mb-5 border-t border-b border-neutral-100 py-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Mức giảm:</span>
                  <span className="font-semibold text-brand-primary">
                    {promo.discountType === 'PERCENTAGE'
                      ? `${promo.discountValue}% (Tối đa ${formatCurrency(promo.maxDiscountAmount)})`
                      : formatCurrency(promo.discountValue)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Đơn tối thiểu:</span>
                  <span className="font-medium text-neutral-700">{formatCurrency(promo.minOrderValue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Thời hạn:</span>
                  <span className="flex items-center gap-1 font-medium text-neutral-700">
                    <Calendar size={14} className="text-neutral-400" />
                    {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Đã dùng:</span>
                  <span className="font-medium text-neutral-700">{promo.usedQuantity} / {promo.quantity}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <ToggleSwitch
                  checked={promo.status === 'ACTIVE'}
                  onChange={(checked) => handleToggleStatus(promo, !checked)}
                  label={promo.status === 'ACTIVE' ? 'Đang bật' : 'Đã tắt'}
                  disabled={promo.status === 'EXPIRED'}
                />
                <div className="rounded-lg border border-neutral-200 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 hover:text-brand-primary">
                  <button
                    onClick={() => navigate(`/seller/shop-promotions/${promo.id}/edit`, { state: { promotion: promo } })}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 w-full h-full"
                  >
                    <Pencil size={14} />
                    Sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {getPages().map((page, index) =>
            page === "..." ? (
              <span key={`ellipsis-${index}`} className="px-2 text-neutral-400">
                ...
              </span>
            ) : (
              <div
                key={page}
                className={`rounded-xl text-sm font-medium transition-all ${currentPage === page
                  ? "bg-brand-primary text-white shadow-md"
                  : "bg-white text-neutral-600 hover:bg-neutral-100"
                  }`}
              >
                <button
                  onClick={() => setCurrentPage(page)}
                  className="flex h-10 w-10 items-center justify-center w-full h-full"
                >
                  {page + 1}
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ShopPromotionsPage;
