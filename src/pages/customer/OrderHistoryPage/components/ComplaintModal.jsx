import { createPortal } from "react-dom";
import { AlertCircle, X, Loader2 } from "lucide-react";
import { useState } from "react";

export default function ComplaintModal({
  open,
  order,
  submitting,
  error,
  onClose,
  onConfirm,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;
    await onConfirm?.({
      title: title.trim(),
      content: content.trim(),
    });
    setTitle("");
    setContent("");
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-3">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#fffaf0] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#eadfca] p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff6df] text-[#b84a25]">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
                Khiếu nại đơn hàng
              </p>
              <h2 className="mt-1 text-xl font-black text-[#3d3a2c]">
                Đơn hàng {order?.orderCode}
              </h2>
            </div>
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

        <form onSubmit={handleSubmit} className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-extrabold text-[#3d3a2c]">
              Tiêu đề khiếu nại
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={100}
              placeholder="Ví dụ: Sản phẩm không đúng mô tả"
              className="w-full rounded-2xl border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#3d3a2c] outline-none transition placeholder:text-[#b8ad99] focus:border-[#f26a3d] focus:ring-4 focus:ring-[#f26a3d]/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-[#3d3a2c]">
              Nội dung khiếu nại
            </label>
            <textarea
              required
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={4}
              maxLength={500}
              placeholder="Vui lòng mô tả chi tiết lỗi sản phẩm, sai kích thước hoặc màu sắc..."
              className="w-full resize-none rounded-2xl border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#3d3a2c] outline-none transition placeholder:text-[#b8ad99] focus:border-[#f26a3d] focus:ring-4 focus:ring-[#f26a3d]/10"
            />
            <div className="mt-1 flex justify-end text-xs font-semibold text-[#8b8372]">
              {content.length}/500
            </div>
          </div>

          {error ? (
            <div className="rounded-2xl border border-[#f0b7a9] bg-[#fff0ed] p-4 text-sm font-bold text-[#b23b24]">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3 border-t border-[#eadfca] pt-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-[#6f6758] transition hover:bg-[#f3ead8]"
            >
              Hủy bỏ
            </button>

            <button
              type="submit"
              disabled={submitting || !title.trim() || !content.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-[#b84a25] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#913519] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Đang gửi...
                </>
              ) : (
                "Gửi khiếu nại"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
