import { X } from "lucide-react";
import { useState } from "react";

export default function WriteCommentSheet({
  open,
  product,
  onClose,
  onSubmit,
  submitting,
}) {
  const [content, setContent] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) return;

    await onSubmit?.({
      productId: product?.id,
      content: trimmed,
      parentId: null,
    });

    setContent("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-2">
      <div className="my-8 max-h-[90vh] w-full max-w-2xl overflow-hidden overflow-y-auto rounded-3xl bg-[#fffaf0] shadow-2xl hidden-scrollbar">
        <div className="flex items-start justify-between border-b border-[#eadfca] p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Bình luận
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#3d3a2c]">
              Viết bình luận của bạn
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white p-2 text-[#776f60] transition hover:bg-[#f3ead8]"
            aria-label="Đóng"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-5">
          <div className="flex gap-4 rounded-2xl bg-white/80 p-4">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded-xl bg-[#eadfca]">
              <img
                src={product?.thumbnailUrl || product?.images?.[0]?.url}
                alt={product?.name || ""}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <h3 className="line-clamp-2 font-extrabold text-[#3d3a2c]">
                {product?.name}
              </h3>
              <p className="mt-1 text-sm font-semibold text-[#7c7565]">
                Hỏi thêm về sản phẩm hoặc chia sẻ ý kiến của bạn.
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-[#3d3a2c]">
              Nội dung bình luận
            </label>

            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Ví dụ: Shop ơi, size này còn không ạ?"
              className="w-full resize-none rounded-2xl border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#3d3a2c] outline-none transition placeholder:text-[#b8ad99] focus:border-[#f26a3d] focus:ring-4 focus:ring-[#f26a3d]/10"
            />

            <div className="mt-1 flex justify-between gap-3 text-xs font-semibold text-[#8b8372]">
              <span>Tối thiểu nên viết 10 ký tự để bình luận rõ hơn.</span>
              <span>{content.length}/500</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-[#eadfca] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#6f6758] transition hover:bg-[#f3ead8]"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-full bg-[#3d3a2c] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#29271f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Gửi bình luận"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
