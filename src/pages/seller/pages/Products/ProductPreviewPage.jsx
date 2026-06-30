import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, Truck, ArrowLeft } from "lucide-react";
import { ProductBottomContent, ProductGallery } from "../../../customer/DetailProductPage/components";
import { useSellerProductDetail, useSellerShop } from "../../hooks";

function formatVnd(value) {
  if (value === null || value === undefined || value === "") return "";
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function mapConditionLabel(condition) {
  switch (condition) {
    case "NEW":
      return "MỚI";
    case "LIKE_NEW":
      return "NHƯ MỚI";
    case "GOOD":
      return "TỐT";
    case "FAIR":
      return "ỔN";
    default:
      return condition ?? "";
  }
}

function PreviewInfoPanel({ product, shop }) {
  return (
    <aside className="space-y-6">

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {product?.category && (
            <span className="rounded-full bg-[#d9efc4] px-3 py-1 text-xs font-semibold text-[#4c7d38]">
              {product.category}
            </span>
          )}
          {product?.condition && (
            <span className="rounded-full bg-[#f4d8bd] px-3 py-1 text-xs font-semibold text-[#b84a25]">
              {product.condition}
            </span>
          )}
          {product?.stockQuantity === 0 ? (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700 animate-pulse">
              Hết hàng
            </span>
          ) : product?.stockQuantity === 1 ? (
            <span className="rounded-full bg-[#ffeedb] px-3 py-1 text-xs font-bold text-[#b87825]">
              Hàng độc bản
            </span>
          ) : (
            <span className="rounded-full bg-[#e6f4ea] px-3 py-1 text-xs font-bold text-[#137333]">
              Còn {product?.stockQuantity || 0} sản phẩm
            </span>
          )}
        </div>

        <h2 className="text-3xl font-extrabold tracking-tight text-[#3d3a2c]">
          {product?.title}
        </h2>

        <div className="mt-3 flex items-end gap-3">
          <p className="text-2xl font-extrabold text-[#b84a25]">
            {product?.price}
          </p>
          {product?.originalPrice && (
            <p className="text-sm text-[#9c927b] line-through">
              {product.originalPrice}
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#ebe2c8] bg-[#faf7e7] p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full bg-[#d8d0ba]">
            {shop?.avatarUrl ? (
              <img
                src={shop.avatarUrl}
                alt={shop?.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-neutral-500">
                {shop?.name?.charAt(0) || "?"}
              </div>
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-bold text-[#3f3b2f]">{shop?.name || "Tiệm của bạn"}</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-[#587d36]">
              {shop?.isVerified && (
                <>
                  <Star size={13} className="fill-current" />
                  <span>Đã xác thực</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-8">
        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-4 text-center text-sm font-medium text-neutral-500">
          Chế độ xem trước: Các chức năng "Thêm vào giỏ", "Mua ngay", và "Nhắn tin" đã được ẩn.
        </div>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-[#7b705f]">
        <div className="flex items-center gap-2">
          <Truck size={17} className="text-[#b84a25]" />
          Giao hàng toàn quốc
        </div>
      </div>
    </aside>
  );
}

export default function ProductPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: product, isLoading: loading } = useSellerProductDetail(id);
  const { data: shop } = useSellerShop();

  const infoProduct = useMemo(() => {
    if (!product) return null;

    const basePrice = product.basePrice;
    const salePrice = product.salePrice;

    const displayPrice = salePrice ?? basePrice;
    const showOriginal =
      basePrice && salePrice && Number(salePrice) < Number(basePrice)
        ? basePrice
        : null;

    const conditionLabel = mapConditionLabel(product.condition);

    return {
      id: product?.id,
      stockQuantity: product?.stockQuantity,
      imageUrl: product?.thumbnailUrl,
      images: product?.images?.map(img => ({ src: img.url || img, alt: product?.name || "" })) || (product?.thumbnailUrl ? [{ src: product.thumbnailUrl, alt: product?.name || "" }] : []),
      basePrice: product?.basePrice,
      salePrice: product?.salePrice,
      category: product?.category?.name ?? "",
      condition: conditionLabel ? `Tình trạng: ${conditionLabel}` : "",
      title: product?.name ?? "",
      price: formatVnd(displayPrice),
      originalPrice: showOriginal ? formatVnd(showOriginal) : null,
    };
  }, [product]);

  const description = product?.description ?? "";

  const attributes = useMemo(() => {
    const attrs = Array.isArray(product?.attributes) ? product.attributes : [];
    return attrs
      .filter((a) => a && a.key)
      .map((a) => ({ label: a.key, value: a.value ?? "" }));
  }, [product]);

  const reviews = useMemo(() => {
    const list = Array.isArray(product?.latestReviews)
      ? product.latestReviews
      : [];

    return list.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      name: r.reviewerName,
      avatarUrl: r.reviewerAvatarUrl,
      createdAt: r.createdAt,

      images: Array.isArray(r.imageUrls)
        ? r.imageUrls.map((url, index) => ({
          id: `${r.id}-${index}`,
          url,
        }))
        : Array.isArray(r.images)
          ? r.images
          : [],
    }));
  }, [product]);

  const comments = useMemo(() => {
    const list = Array.isArray(product?.latestComments)
      ? product.latestComments
      : [];
    return list;
  }, [product]);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-brand-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4">
        <p className="text-neutral-500 font-medium">Không tìm thấy sản phẩm</p>
        <button
          onClick={() => navigate('/seller/products')}
          className="text-brand-primary font-bold hover:underline cursor-pointer"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf9f2] pb-24 pt-8 md:pt-12 font-sans selection:bg-[#ffc28f]/40">
      <div className="mx-auto max-w-[1140px] px-5 sm:px-8">
        
        <div className="mb-6">
          <button
            onClick={() => navigate('/seller/products')}
            className="flex w-fit items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-bold text-neutral-600 shadow-sm hover:bg-neutral-50 hover:text-brand-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            Quay về danh sách sản phẩm
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <ProductGallery 
              images={infoProduct?.images} 
            />
          </div>

          <div>
            <PreviewInfoPanel 
              product={infoProduct} 
              shop={shop} 
            />
          </div>
        </div>

        <ProductBottomContent
          description={description}
          attributes={attributes}
          metadata={[]}
          reviews={reviews}
          comments={comments}
          productId={id}
          isPreview={true}
        />
      </div>
    </div>
  );
}
