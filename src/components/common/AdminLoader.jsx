import React from "react";

export default function AdminLoader({ text = "Đang tải dữ liệu..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[350px] w-full animate-[fadeIn_0.2s_ease] gap-3.5 py-16">
      <div className="w-8 h-8 rounded-full border-4 border-stone-200 border-t-[#c85a28] animate-spin"></div>
      {text && (
        <span className="text-stone-400 text-sm font-semibold tracking-wide">
          {text}
        </span>
      )}
    </div>
  );
}
