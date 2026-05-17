import { categories } from "../data";

export default function CategoryList() {
  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c65a2e]">
            Danh mục
          </p>
          <h2 className="mt-1 text-2xl font-black text-[#3f392f]">
            Mua sắm theo nhu cầu
          </h2>
        </div>

        <button className="hidden text-sm font-bold text-[#c65a2e] hover:underline sm:block">
          Xem tất cả →
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <button
              key={category.id}
              className="group rounded-3xl bg-white p-5 text-left shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0df] text-[#c65a2e] transition group-hover:bg-[#c65a2e] group-hover:text-white">
                <Icon size={22} />
              </div>

              <p className="mt-4 text-sm font-black text-[#3f392f]">
                {category.name}
              </p>

              <p className="mt-1 text-xs font-medium text-[#8a7f6c]">
                Xem sản phẩm
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
