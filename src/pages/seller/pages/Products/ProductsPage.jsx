import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Pencil, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSellerProductList, useSellerProductsByStatus, useDeleteProduct } from '../../hooks';
import { Pagination } from '../../models';
import TableSkeleton from '../../components/common/TableSkeleton';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';

const statusTabs = [
  { label: 'Tất cả', id: 'all' },
  { label: 'Đang bán', id: 'active' },
  { label: 'Đã ẩn', id: 'hidden' },
];

const StatusBadge = ({ status }) => {
  const config = {
    'Đang bán': {
      dot: 'bg-accent-green',
      pill: 'border-accent-green/30 text-neutral-700',
    },
    'Đã ẩn': {
      dot: 'bg-neutral-400',
      pill: 'border-neutral-300 text-neutral-500',
    },
    'Hết hàng': {
      dot: 'bg-accent-orange',
      pill: 'border-accent-yellow/40 text-neutral-700',
    },
  };

  const c = config[status] || config['Đang bán'];

  return (
    <span className={`inline-flex items-center gap-2 rounded-full border bg-white px-3.5 py-1.5 text-xs font-medium ${c.pill}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {status}
    </span>
  );
};

const ProductsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const navigate = useNavigate();

  const isFilteredByStatus = activeTab !== 0;
  const queryParams = isFilteredByStatus
    ? { isActive: activeTab === 1, page: currentPage }
    : { page: currentPage };

  const { data: allData, isLoading: allLoading, error: allError } = useSellerProductList(queryParams, { enabled: !isFilteredByStatus });
  const { data: statusData, isLoading: statusLoading, error: statusError } = useSellerProductsByStatus(queryParams, { enabled: isFilteredByStatus });

  const loading = isFilteredByStatus ? statusLoading : allLoading;
  const error = isFilteredByStatus ? statusError : allError;
  const products = (isFilteredByStatus ? statusData?.products : allData?.products) || [];
  const pagination = (isFilteredByStatus ? statusData?.pagination : allData?.pagination) || Pagination.empty();

  const { mutateAsync: deleteProduct } = useDeleteProduct();

  const handleTabChange = (index) => {
    setActiveTab(index);
    setCurrentPage(0); 
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await deleteProduct(id);
      } catch (e) {
        console.log(e);
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="font-heading text-3xl font-bold text-neutral-800">
        Quản lý sản phẩm
      </h1>

      {/* Search + Filter Tabs */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-full max-w-70">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {statusTabs.map((tab, i) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(i)}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition-colors ${
                activeTab === i
                  ? 'border-2 border-brand-primary text-brand-primary'
                  : 'border-2 border-transparent text-neutral-500 hover:text-neutral-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Data Area */}
      {loading ? (
        <TableSkeleton columns={6} rows={5} />
      ) : error ? (
        <ErrorState message={error.message || error} />
      ) : products.length === 0 ? (
        <EmptyState 
          title="Không có sản phẩm" 
          description="Chưa có sản phẩm nào trong danh mục này." 
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="w-25 px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Hình ảnh
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Tên sản phẩm
                </th>
                <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Giá (VND)
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Kho hàng
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-neutral-50 transition-colors hover:bg-brand-bg/40"
                >
                  <td className="px-6 py-5">
                    <div className="h-16 w-16 overflow-hidden rounded-xl bg-neutral-100">
                      {p.thumbnailUrl ? (
                        <img src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-neutral-200 flex items-center justify-center text-xs text-neutral-400">No img</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-neutral-800">{p.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {p.brand}
                      {p.conditionLabel ? ` • ${p.conditionLabel}` : ''}
                    </p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm font-bold text-brand-primary">{p.formattedPrice}</span>
                    {p.hasDiscount && (
                      <p className="text-xs text-neutral-400 line-through">{p.formattedBasePrice}</p>
                    )}
                  </td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-sm font-semibold text-neutral-700">{p.stockQuantity}</span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <StatusBadge status={p.displayStatus} />
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center gap-2">
                      <button className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => navigate(`/seller/products/${p.id}`)} className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-accent-red/60 transition-colors hover:bg-accent-red-light hover:text-accent-red">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {!pagination.isEmpty && (
            <div className="flex items-center justify-between border-t border-neutral-100 px-6 py-4">
              <p className="text-sm text-neutral-400">
                Hiển thị {pagination.startItem}-{pagination.endItem} của {pagination.totalElements} sản phẩm
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={!pagination.hasPrevious}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={18} />
                </button>
                {pagination.pageNumbers.map((n) => (
                  <button
                    key={n}
                    onClick={() => setCurrentPage(n)}
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                      currentPage === n
                        ? 'bg-accent-green text-white shadow-sm'
                        : 'text-neutral-500 hover:bg-neutral-100'
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}
                <button 
                  disabled={!pagination.hasNext}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export Banner */}
      <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100">
            <FileSpreadsheet size={22} className="text-neutral-500" />
          </div>
          <div>
            <p className="text-sm font-bold text-neutral-700">Xuất báo cáo tồn kho</p>
            <p className="mt-0.5 text-sm text-neutral-400">
              Tải xuống file Excel dữ liệu sản phẩm hiện tại.
            </p>
          </div>
        </div>
        <button className="rounded-xl bg-brand-primary px-7 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
          Tải báo cáo (.csv)
        </button>
      </div>
    </div>
  );
};

export default ProductsPage;
