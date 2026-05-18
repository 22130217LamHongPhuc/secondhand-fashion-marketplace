import { useState } from 'react';
import { ImagePlus, Plus, Camera, Heart, Star, Lightbulb, ShieldCheck } from 'lucide-react';

const conditionOptions = ['Mới', '99%', '95%', 'Cũ'];

const ProductDetailPage = () => {
  const [activeCondition, setActiveCondition] = useState('Mới');

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="font-heading text-3xl font-bold text-neutral-800">
        Thông tin sản phẩm
      </h1>

      <div className="grid grid-cols-3 gap-6">
        {/* ══════════════ Left: Form (2 cols) ══════════════ */}
        <div className="col-span-2 space-y-6">

          {/* ── Image Upload Section ── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="flex items-center gap-2 text-sm font-bold text-neutral-800">
              <ImagePlus size={16} className="text-neutral-500" />
              Hình ảnh sản phẩm
            </h2>

            <div className="mt-5 flex gap-4">
              {/* Main upload area */}
              <label className="flex h-44 w-44 shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50/50 transition-colors hover:border-brand-primary/40 hover:bg-brand-bg/50">
                <Camera size={32} className="text-neutral-300" />
                <span className="mt-2 text-[11px] font-medium text-neutral-400">
                  Ảnh bìa (Bắt buộc)
                </span>
                <input type="file" className="hidden" accept="image/*" />
              </label>

              {/* Thumbnails column */}
              <div className="flex flex-col gap-3">
                {/* Existing thumbnails */}
                <div className="flex gap-3">
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                    <img
                      src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop"
                      alt="Preview 1"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-20 w-20 overflow-hidden rounded-lg border border-neutral-200">
                    <img
                      src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=100&h=100&fit=crop&q=80"
                      alt="Preview 2"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Additional upload slots */}
                <div className="flex gap-3">
                  {[1, 2].map((n) => (
                    <label
                      key={n}
                      className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-neutral-200 text-neutral-300 transition-colors hover:border-brand-primary/30 hover:text-brand-primary/40"
                    >
                      <Plus size={20} />
                      <input type="file" className="hidden" accept="image/*" />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-neutral-400">
              Đăng tối đa 10 ảnh. Định dạng: JPG, PNG. Kích thước tối thiểu: 800x800px.
            </p>
          </div>

          {/* ── Basic Details Section ── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <h2 className="text-sm font-bold text-neutral-800">
              🏷️ Chi tiết cơ bản
            </h2>

            <div className="mt-5 space-y-5">
              {/* Product Name */}
              <div>
                <label className="text-sm font-semibold text-neutral-700">Tên sản phẩm</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Áo khoác Jean Vintage Levis 501"
                  className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>

              {/* Price + Category */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700">Giá bán (đ)</label>
                  <div className="relative mt-1.5">
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-10 text-sm text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-neutral-400">
                      đ
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700">Danh mục</label>
                  <select className="mt-1.5 w-full appearance-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10">
                    <option>Chọn danh mục</option>
                    <option>Thời trang nam</option>
                    <option>Thời trang nữ</option>
                    <option>Phụ kiện</option>
                  </select>
                </div>
              </div>

              {/* Brand + Condition */}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="text-sm font-semibold text-neutral-700">Thương hiệu</label>
                  <input
                    type="text"
                    placeholder="Nhập tên thương hiệu"
                    className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-neutral-700">Tình trạng</label>
                  <div className="mt-1.5 flex gap-2">
                    {conditionOptions.map((c) => (
                      <button
                        key={c}
                        onClick={() => setActiveCondition(c)}
                        className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          activeCondition === c
                            ? 'border-accent-green/30 bg-accent-green-light text-accent-green'
                            : 'border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold text-neutral-700">Mô tả sản phẩm</label>
                <textarea
                  rows={4}
                  placeholder="Mô tả chi tiết về kích thước, màu sắc, chất liệu và tình trạng sản phẩm..."
                  className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
                />
              </div>
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div className="flex items-center justify-center gap-4 pt-2 pb-4">
            <button className="px-8 py-3 text-sm font-bold text-neutral-600 transition-colors hover:text-neutral-800">
              Hủy
            </button>
            <button className="rounded-xl bg-brand-primary px-12 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
              Đăng sản phẩm
            </button>
          </div>
        </div>

        {/* ══════════════ Right: Preview (1 col) ══════════════ */}
        <div className="space-y-4">

          {/* ── Preview Card ── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
              Xem trước hiển thị
            </p>

            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100">
              {/* Product Image */}
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop"
                  alt="Preview"
                  className="h-72 w-full object-cover"
                />
                {/* Badges */}
                <div className="absolute left-3 top-3 flex gap-2">
                  <span className="rounded-md bg-accent-green px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                    Like New
                  </span>
                  <span className="rounded-md bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase text-neutral-700 shadow-sm">
                    Levis
                  </span>
                </div>
                {/* Heart */}
                <button className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-primary shadow-sm transition-all hover:bg-white hover:shadow-md">
                  <Heart size={18} />
                </button>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <p className="text-[11px] text-neutral-400">
                  Thời trang nam • Áo khoác
                </p>
                <h3 className="mt-1.5 text-sm font-bold leading-snug text-neutral-800">
                  Áo khoác Jean Vintage Levis 501 Classic Edition
                </h3>
                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-xl font-bold text-brand-primary">850.000đ</span>
                  <span className="text-xs text-neutral-400 line-through">1.200.000đ</span>
                </div>

                {/* Shop Info */}
                <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src="https://i.pravatar.cc/28?img=47"
                      alt="Shop"
                      className="h-7 w-7 rounded-full"
                    />
                    <div>
                      <p className="text-xs font-semibold text-neutral-700">Tiệm Cũ Boutique</p>
                      <p className="text-[10px] text-neutral-400">Quận 1, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-accent-yellow text-accent-yellow" />
                    <span className="text-xs font-bold text-neutral-700">4.9</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tip: Mẹo bán hàng nhanh ── */}
          <div className="rounded-2xl border border-accent-green/20 bg-accent-green-light/30 p-4">
            <div className="flex gap-3">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent-green" />
              <div>
                <p className="text-sm font-bold text-accent-green">Mẹo bán hàng nhanh</p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                  Sản phẩm có mô tả chi tiết trên 200 chữ và ít nhất 5 hình ảnh có tỉ lệ chốt đơn cao hơn 40%.
                </p>
              </div>
            </div>
          </div>

          {/* ── Tip: Kiểm định miễn phí ── */}
          <div className="rounded-2xl border border-accent-yellow/30 bg-accent-yellow-light/40 p-4">
            <div className="flex gap-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-accent-orange" />
              <div>
                <p className="text-sm font-bold text-accent-orange">Kiểm định miễn phí</p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                  Sản phẩm của bạn đủ điều kiện tham gia chương trình "Đảm bảo chính hãng" của Tiệm Cũ.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
