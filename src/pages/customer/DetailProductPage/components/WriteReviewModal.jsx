import { ImagePlus, Star, X } from "lucide-react";
import { useMemo, useState } from "react";

export default function WriteReviewModal({
  open,
  product,
  orderId,
  onClose,
  onSubmit,
  submitting,
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);

  const previews = useMemo(() => {
    return images.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [images]);

  if (!open) return null;

  const handlePickImages = (event) => {
    const files = Array.from(event.target.files || []);
    const nextImages = [...images, ...files].slice(0, 3);
    setImages(nextImages);
    event.target.value = "";
  };

  const handleRemoveImage = (index) => {
    setImages((current) => current.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!rating) return;
    if (!comment.trim()) return;

    await onSubmit?.({
      orderId,
      productId: product?.id,
      rating,
      comment: comment.trim(),
      images,
    });

    setRating(5);
    setComment("");
    setImages([]);
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-2">
      <div className="w-full h-[90vh] my-8 max-w-2xl overflow-hidden rounded-3xl bg-[#fffaf0] shadow-2xl overflow-y-auto hidden-scrollbar">
        <div className="flex items-start justify-between border-b border-[#eadfca] p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Đánh giá sản phẩm
            </p>
            <h2 className="mt-1 text-xl font-extrabold text-[#3d3a2c]">
              Chia sẻ trải nghiệm của bạn
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white p-2 text-[#776f60] transition hover:bg-[#f3ead8]"
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
                Đơn hàng #{orderId}
              </p>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-extrabold text-[#3d3a2c]">
              Bạn đánh giá sản phẩm này bao nhiêu sao?
            </label>

            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoverRating(value)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-[#d9a321] transition hover:scale-110"
                >
                  <Star
                    size={34}
                    className={
                      value <= displayRating ? "fill-current" : "text-[#d8d0ba]"
                    }
                  />
                </button>
              ))}

              <span className="ml-2 text-sm font-bold text-[#7c7565]">
                {rating}/5
              </span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-[#3d3a2c]">
              Nội dung đánh giá
            </label>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={5}
              maxLength={500}
              placeholder="Ví dụ: Đầm rất xinh, vải nhẹ, shop gói hàng cẩn thận..."
              className="w-full resize-none rounded-2xl border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#3d3a2c] outline-none transition placeholder:text-[#b8ad99] focus:border-[#f26a3d] focus:ring-4 focus:ring-[#f26a3d]/10"
            />

            <div className="mt-1 flex justify-between text-xs font-semibold text-[#8b8372]">
              <span>Tối thiểu nên viết 10 ký tự để đánh giá rõ hơn.</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-extrabold text-[#3d3a2c]">
              Hình ảnh thực tế
            </label>

            <div className="flex flex-wrap gap-3">
              {previews.map((item, index) => (
                <div
                  key={`${item.file.name}-${index}`}
                  className="relative h-24 w-24 overflow-hidden rounded-2xl bg-[#eadfca]"
                >
                  <img
                    src={item.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white"
                  >
                    <X size={13} />
                  </button>
                </div>
              ))}

              {images.length < 3 ? (
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#d8d0ba] bg-white/70 text-[#8b8372] transition hover:border-[#f26a3d] hover:text-[#b84a25]">
                  <ImagePlus size={22} />
                  <span className="mt-1 text-xs font-bold">Thêm ảnh</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePickImages}
                    className="hidden"
                  />
                </label>
              ) : null}
            </div>

            <p className="mt-2 text-xs font-semibold text-[#8b8372]">
              Tối đa 3 ảnh.
            </p>
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
              disabled={submitting || !comment.trim()}
              className="rounded-full bg-[#3d3a2c] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#29271f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
