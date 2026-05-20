import {
  ProductBottomContent,
  ProductGallery,
  ProductInfoPanel,
  SimilarProducts,
} from "./components";
import WriteReviewModal from "./components/WriteReviewModal";
import { reviewService } from "@/services/reviewService";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { customerProductService } from "@/services/customerProduct";

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

function toDiscountPercent(basePrice, salePrice, discountAmount) {
  const base = Number(basePrice);
  const sale = Number(salePrice);
  const discount = Number(discountAmount);
  if (
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(discount) &&
    discount > 0
  ) {
    return Math.round((discount / base) * 100);
  }
  if (
    Number.isFinite(base) &&
    base > 0 &&
    Number.isFinite(sale) &&
    sale > 0 &&
    sale < base
  ) {
    return Math.round(((base - sale) / base) * 100);
  }
  return null;
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

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    customerProductService
      .getById(id)
      .then((data) => {
        if (!isMounted) return;
        setProduct(data);
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e?.message ?? "Không tải được chi tiết sản phẩm");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const galleryImages = useMemo(() => {
    const imgs = product?.images?.length
      ? product.images
          .slice()
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
          .map((img) => ({ src: img.url, alt: product?.name ?? "" }))
      : product?.thumbnailUrl
        ? [{ src: product.thumbnailUrl, alt: product?.name ?? "" }]
        : [];
    return imgs;
  }, [product]);

  const comments = useMemo(() => {
    const list = Array.isArray(product?.latestComments)
      ? product.latestComments
      : [];

    return list.map((c) => ({
      id: c.id,
      name: c.commenterName,
      avatarUrl: c.commenterAvatarUrl,
      content: c.content,
      createdAt: c.createdAt,
      commenterId: c.commenterId,
    }));
  }, [product]);

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
      category: product?.category?.name ?? "",
      condition: conditionLabel ? `Tình trạng: ${conditionLabel}` : "",
      title: product?.name ?? "",
      price: formatVnd(displayPrice),
      originalPrice: showOriginal ? formatVnd(showOriginal) : null,
      shop: {
        id: product?.shop?.id,
        name: product?.shop?.name ?? "",
        meta: `${product?.shop?.ratingAvg ?? ""}${product?.shop?.totalReviews ? ` · ${product.shop.totalReviews} đánh giá` : ""}`.trim(),
        verified: product?.shop?.isVerified ? "Đã xác thực" : "",
        avatar: product?.shop?.avatarUrl ?? "",
      },
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

  const handleSubmitReview = async (payload) => {
    setSubmittingReview(true);

    try {
      const response = await reviewService.createReview(payload);
      const createdReview = response?.data ?? response;

      setProduct((current) => {
        if (!current) return current;

        const nextReview = {
          id: createdReview.id,
          rating: createdReview.rating,
          comment: createdReview.comment,
          reviewerId: createdReview.reviewerId,
          reviewerName: createdReview.reviewerName,
          reviewerAvatarUrl: createdReview.reviewerAvatarUrl,
          createdAt: createdReview.createdAt,

          imageUrls: createdReview.imageUrls ?? [],
        };

        return {
          ...current,
          latestReviews: [nextReview, ...(current.latestReviews ?? [])],
        };
      });

      setReviewModalOpen(false);
    } catch (error) {
      alert(error?.message ?? "Không gửi được đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  const similarProducts = useMemo(() => {
    const items = Array.isArray(product?.relatedProducts)
      ? product.relatedProducts
      : [];

    return items.map((p) => {
      const percent = toDiscountPercent(
        p.basePrice,
        p.salePrice,
        p.discountAmount,
      );
      const displayPrice = p.salePrice ?? p.basePrice;
      const showOriginal =
        p.basePrice && p.salePrice && Number(p.salePrice) < Number(p.basePrice)
          ? p.basePrice
          : null;

      return {
        id: p.id,
        name: p.name,
        price: formatVnd(displayPrice),
        originalPrice: showOriginal ? formatVnd(showOriginal) : null,
        tag: percent ? `-${percent}%` : "Gợi ý",
        image: p.thumbnailUrl,
      };
    });
  }, [product]);

  if (loading) {
    return (
      <div className="py-10 text-sm font-semibold text-[#7c7565]">
        Đang tải chi tiết sản phẩm...
      </div>
    );
  }

  if (error || !product || !infoProduct) {
    return (
      <div className="py-10 text-sm font-semibold text-[#b84a25]">
        {error || "Không tìm thấy sản phẩm"}
      </div>
    );
  }

  return (
    <>
      <section className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <ProductGallery images={galleryImages} />
        <ProductInfoPanel product={infoProduct} />
      </section>

      <ProductBottomContent
        description={description}
        attributes={attributes}
        reviews={reviews}
        comments={comments}
        onWriteReview={() => setReviewModalOpen(true)}
      />

      <SimilarProducts items={similarProducts} />

      <WriteReviewModal
        open={reviewModalOpen}
        product={product}
        orderId={801}
        submitting={submittingReview}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleSubmitReview}
      />
    </>
  );
}
