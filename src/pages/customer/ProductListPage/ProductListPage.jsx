import FilterSidebar from "./components/FilterSidebar";
import Pagination from "./components/Pagination";
import ProductGrid from "./components/ProductGrid";
import ProductToolbar from "./components/ProductToolbar";

export const products = [
  {
    id: 1,
    name: "Váy Vintage thêu hoa",
    price: "245.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=600",
    badge: "MỚI 99%",
    badgeType: "new",
    seller: "Hà Nguyễn",
    rating: "4.9★",
    location: "HÀ NỘI",
    avatar: "HN",
  },
  {
    id: 2,
    name: "Sơ mi trắng Uniqlo Slim",
    price: "180.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600",
    badge: "LIKE NEW",
    badgeType: "green",
    seller: "Thế Minh",
    rating: "5.0★",
    location: "TP. HCM",
    avatar: "TM",
  },
  {
    id: 3,
    name: "Cardigan Len cổ Sài Size M",
    price: "120.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1611911813383-67769b37a149?q=80&w=600",
    badge: "USED",
    badgeType: "used",
    seller: "Phương Linh",
    rating: "4.5★",
    location: "ĐÀ NẴNG",
    avatar: "PL",
  },
  {
    id: 4,
    name: "Quần Jeans Straight Fit",
    price: "320.000 VNĐ",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=600",
    badge: "MỚI 99%",
    badgeType: "new",
    seller: "An Nguyễn",
    rating: "4.8★",
    location: "CẦN THƠ",
    avatar: "AN",
  },
];

export default function ProductListPage() {
  return (
    <div className="min-h-screen bg-[#f6f4dd] text-[#3f3b2f]">
      <main className="mx-auto flex max-w-7xl gap-8 px-6 py-8">
        <FilterSidebar />

        <section className="min-w-0 flex-1">
          <ProductToolbar />

          <ProductGrid products={products} />

          <Pagination />
        </section>
      </main>
    </div>
  );
}
