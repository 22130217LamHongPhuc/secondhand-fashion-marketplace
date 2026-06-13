import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function CancelOrderModal({
  open,
  orderCode,
  submitting,
  error,
  onClose,
  onConfirm,
}) {
  const [reason, setReason] = useState("");

  if (!open) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onConfirm?.(reason.trim());
    setReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-3">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#fffaf0] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#eadfca] p-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0ed] text-[#b23b24]">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
                Hủy đơn hàng
              </p>
              <h2 className="mt-1 text-xl font-black text-[#3d3a2c]">
                Xác nhận hủy {orderCode}
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
          <p className="text-sm leading-6 text-[#766f60]">
            Bạn chỉ có thể hủy đơn khi đơn hàng còn ở trạng thái chờ xác nhận.
            Sau khi hủy, đơn hàng sẽ chuyển sang trạng thái đã hủy.
          </p>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-[#3d3a2c]">
              Lý do hủy
            </label>
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={4}
              maxLength={300}
              placeholder="Ví dụ: Tôi muốn thay đổi địa chỉ nhận hàng."
              className="w-full resize-none rounded-2xl border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#3d3a2c] outline-none transition placeholder:text-[#b8ad99] focus:border-[#f26a3d] focus:ring-4 focus:ring-[#f26a3d]/10"
            />
            <div className="mt-1 flex justify-end text-xs font-semibold text-[#8b8372]">
              {reason.length}/300
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
              Giữ đơn hàng
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-[#b23b24] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#912f1d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang hủy..." : "Hủy đơn hàng"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
