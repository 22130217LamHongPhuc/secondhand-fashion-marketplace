import { useMemo, useState } from "react";

export function ProductGallery({ images }) {
  const normalizedImages = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return images
      .filter(Boolean)
      .map((img) => (typeof img === "string" ? { src: img, alt: "" } : img));
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = normalizedImages[activeIndex] ?? normalizedImages[0];

  return (
    <div className="flex gap-5">
      <div className="hidden w-16 flex-col gap-4 md:flex">
        {normalizedImages.map((item, index) => (
          <button
            key={`${item.src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-16 w-16 overflow-hidden rounded-xl border ${
              index === activeIndex
                ? "border-[#b84a25] ring-2 ring-[#b84a25]/20"
                : "border-transparent"
            } bg-white`}
            aria-label={`Chọn ảnh ${index + 1}`}
          >
            <img
              src={item.src}
              alt={item.alt ?? ""}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      <div className="aspect-[4/3] flex-1 overflow-hidden rounded-3xl bg-[#eee5cf] shadow-sm">
        {active ? (
          <img
            src={active.src}
            alt={active.alt ?? ""}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
    </div>
  );
}
