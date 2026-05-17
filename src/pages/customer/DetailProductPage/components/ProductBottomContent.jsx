import { Leaf, Pencil } from "lucide-react";

export function ProductBottomContent({ description, attributes, comments }) {
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
              {attributes.map((attr) => (
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

          <div className="space-y-4">
            {comments.map((comment, index) => (
              <article
                key={`${comment.name}-${index}`}
                className="rounded-2xl bg-white/80 p-5 shadow-sm"
              >
                <div className="flex gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      index === 0
                        ? "bg-[#d9efc4] text-[#5b8439]"
                        : "bg-[#f6c18b] text-[#9c4a20]"
                    }`}
                  >
                    {comment.avatar}
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
            ))}
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
