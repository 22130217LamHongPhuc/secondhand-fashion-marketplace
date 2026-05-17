import { Pencil, MapPin, Eye, Lightbulb, Camera } from 'lucide-react';

const StoreProfilePage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-neutral-800">
          Hồ sơ cửa hàng
        </h1>
        <p className="mt-1.5 text-sm text-neutral-500">
          Cập nhật thông tin nhận diện thương hiệu của bạn để khách hàng dễ dàng tìm thấy.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* ══════════════ Left: Form (2 cols) ══════════════ */}
        <div className="col-span-2 space-y-6">

          {/* ── Avatar Section ── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Hình ảnh đại diện
            </p>
            <div className="mt-3 flex items-center gap-5 rounded-2xl border border-neutral-200 bg-white p-5">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-[85px] w-[85px] overflow-hidden rounded-full bg-brand-light">
                  <img
                    src="https://i.pravatar.cc/85?img=47"
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-brand-primary text-white shadow-md transition-all hover:bg-brand-dark">
                  <Pencil size={12} />
                </button>
              </div>
              {/* Info text + progress */}
              <div>
                <p className="text-sm text-neutral-600">
                  Khuyên dùng ảnh hình vuông, tối thiểu 500x500px.
                  <br />
                  Định dạng JPG, PNG.
                </p>
                <div className="mt-3 h-1.5 w-44 overflow-hidden rounded-full bg-neutral-200">
                  <div className="h-full w-3/4 rounded-full bg-blue-500" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Cover Image Section ── */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Ảnh bìa cửa hàng
            </p>
            <div className="mt-3 group relative h-52 overflow-hidden rounded-2xl bg-neutral-200">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=220&fit=crop"
                alt="Cover"
                className="h-full w-full object-cover brightness-75"
              />
              {/* Overlay button always visible */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="flex items-center gap-2 rounded-xl bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30">
                  <Camera size={16} />
                  Thay đổi ảnh bìa
                </button>
              </div>
            </div>
          </div>

          {/* ── Store Name ── */}
          <div>
            <label className="text-sm font-semibold text-neutral-700">Tên cửa hàng</label>
            <input
              type="text"
              defaultValue="Tiệm Cũ Boutique"
              className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          {/* ── Description ── */}
          <div>
            <label className="text-sm font-semibold text-neutral-700">Mô tả ngắn</label>
            <textarea
              rows={5}
              defaultValue="Chào mừng bạn đến với Tiệm Cũ Boutique. Chúng mình chuyên cung cấp các mặt hàng vintage tuyển chọn, từ quần áo đến đồ trang trí nhà cửa, mang đậm hơi thở thời gian và tinh thần bền vững."
              className="mt-1.5 w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm leading-relaxed text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
            />
          </div>

          {/* ── Phone + Email ── */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-semibold text-neutral-700">Số điện thoại</label>
              <input
                type="text"
                defaultValue="090 123 4567"
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-neutral-700">Email liên hệ</label>
              <input
                type="email"
                defaultValue="contact@tiemcu.vn"
                className="mt-1.5 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
              />
            </div>
          </div>

          {/* ── Address ── */}
          <div>
            <label className="text-sm font-semibold text-neutral-700">Địa chỉ / Khu vực</label>
            <div className="relative mt-1.5">
              <input
                type="text"
                defaultValue="Quận 1, TP. Hồ Chí Minh"
                className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 pr-12 text-sm text-neutral-700 outline-none transition-all focus:border-brand-primary/40 focus:bg-white focus:ring-2 focus:ring-brand-primary/10"
              />
              <MapPin size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-primary" />
            </div>
          </div>

          {/* ── Save Button ── */}
          <div className="flex justify-center pt-2 pb-4">
            <button className="rounded-xl bg-brand-primary px-14 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-brand-dark hover:shadow-lg active:scale-[0.98]">
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* ══════════════ Right: Preview (1 col) ══════════════ */}
        <div className="space-y-4">

          {/* ── Store Preview Card ── */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <Eye size={14} className="text-accent-green" />
              <p className="text-[11px] font-bold uppercase tracking-widest text-accent-green">
                Xem trước cửa hàng
              </p>
              <div className="ml-auto flex gap-1">
                <span className="h-2 w-2 rounded-full bg-brand-primary" />
                <span className="h-2 w-2 rounded-full bg-neutral-200" />
                <span className="h-2 w-2 rounded-full bg-neutral-200" />
              </div>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-neutral-100">
              {/* Cover */}
              <div className="relative h-32 bg-gradient-to-br from-neutral-700 to-neutral-900">
                <img
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=140&fit=crop"
                  alt="Cover"
                  className="h-full w-full object-cover opacity-50"
                />
                {/* Avatar overlay */}
                <div className="absolute -bottom-7 left-4">
                  <div className="h-16 w-16 overflow-hidden rounded-2xl border-[3px] border-white bg-brand-light shadow-lg">
                    <img
                      src="https://i.pravatar.cc/64?img=47"
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Store Info */}
              <div className="px-4 pt-9 pb-4">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-neutral-800">Tiệm Cũ Boutique</h3>
                  <span className="rounded-md bg-brand-primary px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                    Top Seller
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                  <MapPin size={11} /> Quận 1, TP. Hồ Chí Minh
                </p>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 rounded-xl border border-neutral-100 py-2.5">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Sản phẩm</p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-800">124</p>
                  </div>
                  <div className="border-x border-neutral-100 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Đánh giá</p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-800">4.9/5</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Phản hồi</p>
                    <p className="mt-0.5 text-lg font-bold text-neutral-800">98%</p>
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-4 text-xs leading-relaxed text-neutral-500">
                  Chào mừng bạn đến với Tiệm Cũ Boutique. Chúng mình chuyên cung cấp các mặt hàng vintage tuyển...
                </p>

                {/* Gallery */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="h-24 overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=120&fit=crop"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-24 overflow-hidden rounded-xl">
                    <img
                      src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=120&fit=crop"
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tip Card ── */}
          <div className="rounded-2xl bg-accent-green-light/50 p-5">
            <div className="flex gap-3">
              <Lightbulb size={18} className="mt-0.5 shrink-0 text-accent-orange" />
              <div>
                <p className="text-sm font-bold text-accent-orange">Mẹo nhỏ:</p>
                <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">
                  Sử dụng ảnh bìa có tông màu trung tính sẽ làm nổi bật logo và thông tin cửa hàng của bạn hơn trên thiết bị di động.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreProfilePage;
