import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { X, Clock, CheckCircle2, FileText, Calendar, MessageSquare, Loader2 } from "lucide-react";
import { customerComplaintService } from "@/services/customerComplaint";

const COMPLAINT_STATUS_META = {
  PENDING: {
    label: "Chờ xử lý",
    className: "border-[#f5d6a3] bg-[#fff6df] text-[#946300]",
    icon: Clock,
  },
  RESOLVED: {
    label: "Đã giải quyết",
    className: "border-[#bfe5c4] bg-[#edf8ed] text-[#2f7d38]",
    icon: CheckCircle2,
  },
};

function ComplaintStatusBadge({ status }) {
  const meta = COMPLAINT_STATUS_META[status] || COMPLAINT_STATUS_META.PENDING;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${meta.className}`}
    >
      <Icon size={13} />
      {meta.label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function ComplaintDetailModal({ open, complaintId, onClose }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !complaintId) return;

    let isMounted = true;
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await customerComplaintService.getComplaintDetail(complaintId);
        if (isMounted) {
          setComplaint(data);
        }
      } catch (err) {
        if (isMounted) {
          setError("Không thể tải chi tiết khiếu nại. Vui lòng thử lại sau.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      isMounted = false;
    };
  }, [open, complaintId]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-3">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-[#fffaf0] shadow-2xl">
        <div className="flex items-start justify-between border-b border-[#eadfca] p-5">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Chi tiết khiếu nại
            </p>
            <h2 className="mt-1 text-xl font-black text-[#3d3a2c]">
              Mã khiếu nại: #{complaintId}
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

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-[#b84a25]">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-sm font-semibold">Đang tải thông tin...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-[#f0b7a9] bg-[#fff0ed] p-4 text-sm font-bold text-[#b23b24]">
              {error}
            </div>
          ) : complaint ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e7c8] pb-3">
                <ComplaintStatusBadge status={complaint.status} />
                <span className="flex items-center gap-1 text-xs font-semibold text-[#766f60]">
                  <Calendar size={14} className="text-[#b84a25]" />
                  {formatDate(complaint.createdAt)}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#9c937d]">Tiêu đề</p>
                <h3 className="text-base font-black text-[#3d3a2c]">{complaint.title}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-[#766f60]">
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#9c937d]">Loại khiếu nại</p>
                  <span className="flex items-center gap-1">
                    <FileText size={14} className="text-[#b84a25]" />
                    {complaint.type === "SHOP_COMPLAINT" ? "Khiếu nại cửa hàng" : "Khiếu nại hệ thống"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-extrabold uppercase tracking-wider text-[#9c937d]">Nội dung khiếu nại</p>
                <div className="rounded-2xl border border-[#eadfca] bg-white px-4 py-3 text-sm text-[#3d3a2c] leading-relaxed">
                  {complaint.content}
                </div>
              </div>

              {complaint.status === "RESOLVED" && complaint.resolution && (
                <div className="space-y-1">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#2f7d38]">Giải quyết từ Admin</p>
                  <div className="rounded-2xl border border-[#bfe5c4] bg-[#edf8ed] p-4 text-sm text-[#2f7d38] leading-relaxed flex gap-3">
                    <MessageSquare size={18} className="shrink-0 mt-0.5 text-[#2f7d38]" />
                    <div>
                      <p className="font-extrabold text-[11px] uppercase tracking-wider text-[#27662e] mb-1">
                        Phản hồi hỗ trợ
                      </p>
                      <p className="font-semibold">{complaint.resolution}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end border-t border-[#eadfca] p-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-[#3d3a2c] px-6 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#29271f]"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
