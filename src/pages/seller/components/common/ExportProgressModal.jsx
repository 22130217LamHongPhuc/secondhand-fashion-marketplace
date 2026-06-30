import React from "react";
import { X, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, Download } from "lucide-react";

export const ExportProgressModal = ({
  isOpen,
  onClose,
  isExporting,
  progress,
  completeData,
  error
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={!isExporting ? onClose : undefined}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md scale-100 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
        {/* Close Button */}
        {!isExporting && (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 focus:outline-none"
          >
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-neutral-100 pb-4">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            error ? 'bg-red-50 text-red-600' :
            completeData ? 'bg-green-50 text-green-600' :
            'bg-brand-primary/10 text-brand-primary'
          }`}>
            {error ? <AlertCircle size={20} /> :
             completeData ? <CheckCircle size={20} /> :
             <FileSpreadsheet size={20} />}
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-neutral-800">
              Xuất dữ liệu Excel
            </h3>
            <p className="text-sm text-neutral-500">
              {error ? "Đã có lỗi xảy ra" :
               completeData ? "Xuất dữ liệu thành công" :
               "Hệ thống đang xử lý, vui lòng không đóng trang..."}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="py-6">
          {/* Error State */}
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Success State */}
          {completeData && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-500">
                <CheckCircle size={32} />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-800">
                  Đã tạo xong tệp: <span className="text-brand-primary">{completeData.fileName}</span>
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Kích thước: {completeData.fileSizeKB} KB • Tổng cộng: {completeData.totalRows} dòng
                </p>
              </div>
              <a
                href={completeData.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                onClick={onClose}
              >
                <Download size={18} />
                Tải về ngay
              </a>
            </div>
          )}

          {/* Progress State */}
          {isExporting && progress && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-700">Tiến trình</span>
                <span className="font-bold text-brand-primary">{progress.percent}%</span>
              </div>
              
              {/* Progress Bar */}
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-neutral-100">
                <div 
                  className="h-full rounded-full bg-brand-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>
                  Đang xử lý: {progress.currentRow} / {progress.totalRows} dòng
                </span>
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  Còn khoảng ~{progress.estimatedSecondsLeft}s
                </span>
              </div>
            </div>
          )}

          {/* Initial loading state before SSE events arrive */}
          {isExporting && !progress && (
             <div className="flex flex-col items-center justify-center space-y-4 py-4">
               <Loader2 size={32} className="animate-spin text-brand-primary" />
               <p className="text-sm text-neutral-500">Đang chuẩn bị dữ liệu...</p>
             </div>
          )}
        </div>

        {/* Footer actions */}
        {(error || completeData) && (
          <div className="mt-2 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-neutral-200 bg-white px-5 py-2.5 text-sm font-semibold text-neutral-600 transition-all hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-100"
            >
              Đóng
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
