import React, { useState, useEffect } from "react";

export default function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Nhập thông tin",
  message = "Vui lòng nhập thông tin bên dưới:",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  placeholder = "Nhập nội dung...",
  type = "danger" // "danger" or "warning" or "info"
}) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputValue("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmButtonBg = type === "danger" 
    ? "bg-red-600 hover:bg-red-700 focus:ring-red-500" 
    : type === "warning"
    ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500"
    : "bg-[#c85a28] hover:bg-[#b84c1a] focus:ring-orange-500";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-all duration-300">
      <div 
        className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl border border-stone-100 transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          {type === "danger" && (
            <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-red-50 text-red-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          )}
          {type === "warning" && (
            <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-amber-50 text-amber-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          )}
          {type === "info" && (
            <span className="shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-blue-50 text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          )}
          
          <div className="flex-1 w-full">
            <h3 className="text-base font-bold text-stone-900">
              {title}
            </h3>
            <p className="mt-2 text-sm text-stone-500 leading-relaxed mb-4">
              {message}
            </p>
            <input
              type="text"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            className="inline-flex justify-center rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 cursor-pointer transition-all active:scale-[0.98]"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`inline-flex justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-all active:scale-[0.98] ${confirmButtonBg}`}
            onClick={() => {
              onConfirm(inputValue);
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
