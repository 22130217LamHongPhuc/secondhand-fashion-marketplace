import { Leaf, Pencil, Star } from "lucide-react";
import { useMemo, useState } from "react";

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name) {
  if (!name) return "?";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";

  return `${first}${last}`.toUpperCase();
}

function normalizeImages(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `${item}-${index}`,
          url: item,
        };
      }

      return {
        id: item.id ?? item.url ?? index,
        url: item.url ?? item.imageUrl ?? item.src ?? "",
      };
    })
    .filter((item) => item.url);
}

function UserAvatar({ avatarUrl, name }) {
  return (
    <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#d8d0ba]">
      {avatarUrl ? (
        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs font-extrabold text-[#3d3a2c]">
          {initials(name)}
        </div>
      )}
    </div>
  );
}

function ImageList({ images }) {
  const normalizedImages = normalizeImages(images);

  if (!normalizedImages.length) return null;

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:flex sm:flex-wrap">
      {normalizedImages.map((image) => (
        <div
          key={image.id}
          className="h-20 w-20 overflow-hidden rounded-xl bg-[#eadfca]"
        >
          <img src={image.url} alt="" className="h-full w-full object-cover" />
        </div>
      ))}
    </div>
  );
}

function ReviewItem({ review, index }) {
  const name = review.name ?? review.reviewerName ?? "Người dùng";
  const avatarUrl = review.avatarUrl ?? review.reviewerAvatarUrl;
  const images = review.images ?? review.imageUrls ?? review.reviewImages ?? [];

  return (
    <article
      key={review.id ?? `${name}-${index}`}
      className="rounded-2xl bg-white/80 p-5 shadow-sm"
    >
      <div className="flex gap-3">
        <UserAvatar avatarUrl={avatarUrl} name={name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-[#3f3b2f]">{name}</h4>

              <div className="mt-1 flex items-center gap-1 text-xs font-bold text-[#d9a321]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={13}
                    className={
                      star <= Number(review.rating) ? "fill-current" : ""
                    }
                  />
                ))}

                <span className="ml-1 text-[#587d36]">
                  {review.rating ?? 0}
                </span>
              </div>
            </div>

            <span className="shrink-0 text-xs text-[#8b8372]">
              {formatDateTime(review.createdAt)}
            </span>
          </div>

          {review.comment ? (
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#605a4e]">
              {review.comment}
            </p>
          ) : null}

          <ImageList images={images} />
        </div>
      </div>
    </article>
  );
}

function CommentItem({ comment, isReply = false }) {
  const name =
    comment.userName ??
    comment.reviewerName ??
    comment.name ??
    comment.fullName ??
    "Người dùng";

  const avatarUrl =
    comment.userAvatarUrl ??
    comment.reviewerAvatarUrl ??
    comment.avatarUrl ??
    comment.avatar;

  const images =
    comment.images ?? comment.imageUrls ?? comment.commentImages ?? [];

  return (
    <article
      className={`rounded-2xl p-5 shadow-sm ${isReply
          ? "ml-8 border-l-4 border-[#f2d2b8] bg-[#fffaf4] sm:ml-12"
          : "bg-white/80"
        }`}
    >
      <div className="flex gap-3">
        <UserAvatar avatarUrl={avatarUrl} name={name} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-bold text-[#3f3b2f]">{name}</h4>

              {isReply ? (
                <span className="mt-1 inline-block rounded-full bg-[#fff0e4] px-2 py-0.5 text-[11px] font-bold text-[#b84a25]">
                  Phản hồi
                </span>
              ) : null}
            </div>

            <span className="shrink-0 text-xs text-[#8b8372]">
              {formatDateTime(comment.createdAt)}
            </span>
          </div>

          <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#605a4e]">
            {comment.content}
          </p>

          <ImageList images={images} />

          {!isReply ? (
            <button
              type="button"
              className="mt-3 text-xs font-extrabold text-[#b84a25] hover:underline"
            >
              Trả lời
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ProductBottomContent({
  description,
  attributes,
  metadata,
  reviews,
  comments,
  loadingComments,
  onLoadComments,
  onWriteReview,
  onWriteComment,
}) {
  const [activeTab, setActiveTab] = useState("reviews");

  const resolvedAttributes = useMemo(() => {
    return Array.isArray(attributes) ? attributes : [];
  }, [attributes]);

  const resolvedReviews = useMemo(() => {
    return Array.isArray(reviews) ? reviews : [];
  }, [reviews]);

  const resolvedComments = useMemo(() => {
    return Array.isArray(comments) ? comments : [];
  }, [comments]);

  const handleSwitchTab = async (next) => {
    setActiveTab(next);

    if (next === "comments") {
      await onLoadComments?.();
    }
  };

  const handleWrite = () => {
    if (activeTab === "comments") {
      onWriteComment?.();
      return;
    }

    onWriteReview?.();
  };

  const { cleanDesc, metadataList } = useMemo(() => {
    const getMetadataLabel = (k) => {
      const mapping = {
        size: "Kích cỡ (Size)",
        location: "Khu vực bán",
        raw_condition: "Độ mới",
        source: "Nguồn tin",
        source_url: "Link bài đăng gốc",
      };
      return mapping[k] || null;
    };

    const getMetadataValue = (k, v) => {
      if (k === "source" && String(v).toLowerCase() === "chotot") {
        return "Chợ Tốt";
      }
      if (k === "raw_condition") {
        const lower = String(v).toLowerCase();
        if (lower.includes("like new")) return "Đã sử dụng (Như mới)";
        if (lower.includes("good")) return "Đã sử dụng (Tốt)";
        if (lower.includes("fair")) return "Đã sử dụng (Trung bình)";
        if (lower.includes("used")) return "Đã sử dụng";
        if (lower.includes("new")) return "Mới";
        return v;
      }
      return v;
    };

    if (metadata && typeof metadata === "object") {
      const list = Object.entries(metadata)
        .filter(([key, val]) => val !== null && val !== undefined && val !== "" && getMetadataLabel(key) !== null)
        .map(([key, val]) => ({
          key,
          label: getMetadataLabel(key),
          value: getMetadataValue(key, String(val)),
        }));
      return { cleanDesc: description || "", metadataList: list };
    }

    if (!description) return { cleanDesc: "", metadataList: [] };

    const lines = description.split("\n");
    const cleanLines = [];
    const metaList = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        cleanLines.push("");
        continue;
      }

      const match = trimmed.match(/^([a-z_]+):\s*(.+)$/);
      if (match) {
        const key = match[1];
        const val = match[2];
        const label = getMetadataLabel(key);
        if (label) {
          metaList.push({ key, label, value: getMetadataValue(key, val) });
        }
      } else {
        cleanLines.push(trimmed);
      }
    }

    const clean = cleanLines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
    return { cleanDesc: clean, metadataList: metaList };
  }, [description, metadata]);

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1.45fr_0.65fr]">
      <div className="space-y-8">
        <section>
          <h3 className="mb-5 inline-block border-b-4 border-[#f26a3d] pb-2 text-xl font-extrabold">
            Mô tả sản phẩm
          </h3>

          <div className="max-w-3xl space-y-6">
            {cleanDesc ? (
              <p className="whitespace-pre-line text-sm leading-7 text-[#67604f]">
                {cleanDesc}
              </p>
            ) : null}



            {metadataList.length > 0 ? (
              <div className="rounded-2xl border border-[#e7dfbd] bg-[#fffaf0] p-5 shadow-sm mt-6">
                <h4 className="mb-4 text-sm font-extrabold text-[#3d3a2c] flex items-center gap-2">
                  <Leaf size={16} className="text-[#b84a25]" />
                  Thông tin nguồn tin
                </h4>
                <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-xs">
                  {metadataList.map((item) => (
                    <div key={item.key} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#e7dfbd]/40 pb-2 gap-1">
                      <span className="font-semibold text-[#7c7565] min-w-[120px]">
                        {item.label}
                      </span>
                      <span className="text-[#3f3b2f] text-right font-medium break-all max-w-full">
                        {item.key === "source_url" ? (
                          <a
                            href={item.value}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#b84a25] underline hover:text-[#9e3a1b]"
                          >
                            Xem tin gốc ↗
                          </a>
                        ) : item.key === "posted_at" ? (
                          formatDateTime(item.value) || item.value
                        ) : (
                          item.value
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between gap-4">
            <h3 className="text-xl font-extrabold">Đánh giá &amp; Bình luận</h3>

            <button
              type="button"
              onClick={handleWrite}
              className="flex shrink-0 items-center gap-1 rounded-full bg-[#fff3e8] px-4 py-2 text-sm font-extrabold text-[#b84a25] transition hover:bg-[#ffe2cd]"
            >
              {activeTab === "comments" ? "Viết bình luận" : "Viết đánh giá"}
              <Pencil size={14} />
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSwitchTab("reviews")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${activeTab === "reviews"
                  ? "bg-[#3d3a2c] text-white"
                  : "bg-white/70 text-[#3d3a2c] hover:bg-white"
                }`}
            >
              Review
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("comments")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${activeTab === "comments"
                  ? "bg-[#3d3a2c] text-white"
                  : "bg-white/70 text-[#3d3a2c] hover:bg-white"
                }`}
            >
              Comment
            </button>
          </div>

          <div className="space-y-4">
            {activeTab === "reviews" ? (
              resolvedReviews.length ? (
                resolvedReviews.map((review, index) => (
                  <ReviewItem
                    key={review.id ?? `${review.name}-${index}`}
                    review={review}
                    index={index}
                  />
                ))
              ) : (
                <div className="rounded-2xl bg-white/60 p-5 text-sm font-semibold text-[#7c7565]">
                  Chưa có review.
                </div>
              )
            ) : loadingComments ? (
              <div className="rounded-2xl bg-white/60 p-5 text-sm font-semibold text-[#7c7565]">
                Đang tải comment...
              </div>
            ) : comments === null ? (
              <div className="rounded-2xl bg-white/60 p-5 text-sm font-semibold text-[#7c7565]">
                Nhấn tab Comment để tải dữ liệu.
              </div>
            ) : resolvedComments.length ? (
              resolvedComments.map((comment) => (
                <div key={comment.id} className="space-y-3">
                  <CommentItem comment={comment} />

                  {Array.isArray(comment.replies) &&
                    comment.replies.length > 0 ? (
                    <div className="space-y-3">
                      {comment.replies.map((reply) => (
                        <CommentItem key={reply.id} comment={reply} isReply />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl bg-white/60 p-5 text-sm font-semibold text-[#7c7565]">
                Chưa có comment.
              </div>
            )}
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <div className="rounded-3xl bg-[#e4f2c9] p-6">
          <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/60 text-[#5d8b38]">
            <Leaf size={22} />
          </div>

          <h3 className="text-lg font-extrabold text-[#52772e]">
            Lựa chọn Bền vững
          </h3>

          <p className="mt-3 text-sm leading-6 text-[#667554]">
            Mua đồ cũ giúp giảm tiêu thụ thời trang mới, việc mua sắm có trách
            nhiệm và thân thiện hơn với môi trường.
          </p>
        </div>
      </aside>
    </div>
  );
}
