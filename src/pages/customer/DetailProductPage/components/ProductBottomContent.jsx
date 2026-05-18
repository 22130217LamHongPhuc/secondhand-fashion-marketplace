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
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

export function ProductBottomContent({
  description,
  attributes,
  reviews,
  comments,
  loadingComments,
  onLoadComments,
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

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-[1.45fr_0.65fr]">
      <div className="space-y-8">
        <section>
          <h3 className="mb-5 inline-block border-b-4 border-[#f26a3d] pb-2 text-xl font-extrabold">
            Mô tả sản phẩm
          </h3>

          <div className="max-w-3xl space-y-4 text-sm leading-7 text-[#67604f]">
            <p>{description}</p>

            <div className="grid gap-2 sm:grid-cols-2">
              {resolvedAttributes.map((attr) => (
                <p key={attr.label}>
                  <span className="font-semibold text-[#3f3b2f]">
                    {attr.label}:
                  </span>{" "}
                  {attr.value}
                </p>
              ))}
            </div>
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-extrabold">Hỏi đáp &amp; Bình luận</h3>

            <button className="flex items-center gap-1 text-sm font-bold text-[#b84a25]">
              Viết bình luận
              <Pencil size={14} />
            </button>
          </div>

          <div className="mb-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSwitchTab("reviews")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                activeTab === "reviews"
                  ? "bg-[#3d3a2c] text-white"
                  : "bg-white/70 text-[#3d3a2c] hover:bg-white"
              }`}
            >
              Review
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab("comments")}
              className={`rounded-full px-4 py-2 text-sm font-extrabold transition ${
                activeTab === "comments"
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
                  <article
                    key={review.id ?? `${review.name}-${index}`}
                    className="rounded-2xl bg-white/80 p-5 shadow-sm"
                  >
                    <div className="flex gap-3">
                      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#d8d0ba]">
                        {review.avatarUrl ? (
                          <img
                            src={review.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs font-extrabold text-[#3d3a2c]">
                            {initials(review.name)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold">{review.name}</h4>
                            <div className="mt-1 flex items-center gap-1 text-xs font-bold text-[#587d36]">
                              <Star size={13} className="fill-current" />
                              <span>{review.rating}</span>
                            </div>
                          </div>

                          <span className="text-xs text-[#8b8372]">
                            {formatDateTime(review.createdAt)}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-[#605a4e]">
                          {review.comment}
                        </p>
                      </div>
                    </div>
                  </article>
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
              resolvedComments.map((comment, index) => (
                <article
                  key={comment.id ?? `${comment.name}-${index}`}
                  className="rounded-2xl bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        index % 2 === 0
                          ? "bg-[#d9efc4] text-[#5b8439]"
                          : "bg-[#f6c18b] text-[#9c4a20]"
                      }`}
                    >
                      {comment.avatar ?? initials(comment.name)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold">{comment.name}</h4>
                        <span className="text-xs text-[#8b8372]">
                          {comment.time}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-[#605a4e]">
                        {comment.content}
                      </p>

                      {comment.reply ? (
                        <div className="mt-4 rounded-xl bg-[#f7f1cf] p-4 text-sm text-[#5d5545]">
                          <span className="font-bold text-[#b84a25]">
                            Chủ tiệm phản hồi:
                          </span>{" "}
                          {comment.reply}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
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
