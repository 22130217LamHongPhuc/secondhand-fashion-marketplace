import {
  ProductBottomContent,
  ProductGallery,
  ProductInfoPanel,
  SimilarProducts,
} from "./components";

const galleryImages = [
  {
    src: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1200",
    alt: "Váy hoa vintage dáng dài",
  },
  {
    src: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200",
    alt: "Ảnh sản phẩm 2",
  },
  {
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1200",
    alt: "Ảnh sản phẩm 3",
  },
];

const comments = [
  {
    name: "Trần Hoàng",
    time: "2 giờ trước",
    avatar: "TH",
    content: "Ghế này có hỗ trợ vận chuyển nội thành Hà Nội không shop ơi?",
    reply: "Dạ có bạn nhé, nội thành mình hỗ trợ 50% phí ship qua Lalamove ạ!",
  },
  {
    name: "Mai Lan",
    time: "Hôm qua",
    avatar: "ML",
    content: "Ghế đẹp quá, dùng còn mới luôn. Tiếc là mình ở SG.",
  },
];

const similarProducts = [
  {
    id: "101",
    name: "Áo sơ mi linen form rộng",
    price: "180.000đ",
    originalPrice: "240.000đ",
    tag: "ĐÃ MỚI: 95%",
    image:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200",
  },
  {
    id: "102",
    name: "Chân váy xếp ly vintage",
    price: "220.000đ",
    tag: "ĐÃ MỚI: 97%",
    image:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1200",
  },
  {
    id: "103",
    name: "Váy maxi hoa nhí",
    price: "390.000đ",
    originalPrice: "520.000đ",
    tag: "ĐÃ MỚI: 98%",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200",
  },
  {
    id: "104",
    name: "Đầm suông basic",
    price: "260.000đ",
    tag: "ĐÃ MỚI: 93%",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200",
  },

  {
    id: "105",
    name: "Đầm suông basic",
    price: "260.000đ",
    tag: "ĐÃ MỚI: 93%",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200",
  },
];

const product = {
  category: "VÁY & ĐẦM",
  condition: "ĐÃ MỚI: 98%",
  title: "Váy Hoa Vintage Dáng Dài",
  price: "450.000đ",
  originalPrice: "600.000đ",
  shop: {
    id: "1",
    name: "Tiệm của Minh Anh",
    meta: "Thành viên từ 2021 · 120 đánh giá",
    verified: "Đã xác thực chủ & Bảo hành 1 tháng",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=300",
  },
};

const description =
  "Chiếc váy voan phong cách vintage, chất liệu voan mềm mại, có lớp lót trong. Phù hợp cho các bạn nữ đi dạo phố hoặc đi biển.";

const attributes = [
  { label: "Size", value: "M, độ mới 98%" },
  { label: "Chất liệu", value: "Voan" },
  { label: "Màu", value: "Hồng kem" },
  { label: "Thương hiệu", value: "Local Brand" },
];

export default function ProductDetailPage() {
  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ProductGallery images={galleryImages} />
        <ProductInfoPanel product={product} />
      </section>

      <ProductBottomContent
        description={description}
        attributes={attributes}
        comments={comments}
      />

      <SimilarProducts items={similarProducts} />
    </>
  );
}
