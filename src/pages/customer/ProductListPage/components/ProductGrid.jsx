import ProductCard from "./ProductCard";

export const categories = [
  "Tất Cả Sản Phẩm",
  "Áo Sơ Mi Họa Tiết",
  "Quần Jeans Ống Rộng",
  "Váy Hoa Vintage",
];

export const sizes = ["S", "M", "L", "Freesize"];

export const products = [
  {
    id: 1,
    name: "Áo Sơ Mi Lụa Cổ Điển",
    price: "350k",
    meta: "Size M · Họa Tiết 80s",
    image:
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop",
    badge: "LIKE NEW",
    badgeType: "green",
  },
  {
    id: 2,
    name: "Quần Jeans Denim Rộng",
    price: "420k",
    meta: "Size S · Bạc Màu Tự Nhiên",
    image:
      "https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Váy Maxi Hoa Cúc Nhí",
    price: "280k",
    meta: "Freesize · Tôn Dáng",
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop",
    badge: "HIẾM",
    badgeType: "orange",
  },
  {
    id: 4,
    name: "Áo Thun Band Tee Faded",
    price: "150k",
    meta: "Size L · Unisex",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
  },
];

export default function ProductGrid({ products }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
