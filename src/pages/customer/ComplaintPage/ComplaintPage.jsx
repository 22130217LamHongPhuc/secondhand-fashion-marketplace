import { useEffect, useState } from "react";
import { Clock, CheckCircle2, AlertCircle, FileText, Calendar, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { customerComplaintService } from "@/services/customerComplaint";
import ComplaintDetailModal from "../OrderHistoryPage/components/ComplaintDetailModal";

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

export default function ComplaintPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeComplaintId, setActiveComplaintId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadComplaints = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await customerComplaintService.getComplaints();
        if (isMounted) {
          setComplaints(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Không thể tải danh sách khiếu nại. Vui lòng thử lại sau.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadComplaints();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-7">
      <button
        type="button"
        onClick={() => navigate("/orders")}
        className="inline-flex items-center gap-2 text-xs font-extrabold text-[#b84a25] hover:text-[#8f3519]"
      >
        <ArrowLeft size={15} />
        Quay lại lịch sử đơn hàng
      </button>

      <section className="rounded-2xl border border-[#e7dfbd] bg-[#fffaf0] p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#b84a25]">
              Tài khoản của tôi
            </p>
            <h1 className="mt-1 text-2xl font-black text-[#3d3a2c]">
              Khiếu nại của tôi
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#766f60]">
              Theo dõi và quản lý các khiếu nại đã gửi về đơn hàng hoặc cửa hàng.
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-2.5 shadow-sm border border-[#e7dfbd]/60">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#9a907a]">
              Tổng số khiếu nại
            </p>
            <p className="mt-0.5 text-xl font-black text-[#b84a25]">
              {complaints.length}
            </p>
          </div>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-[#f0b7a9] bg-[#fff0ed] p-5 text-sm font-bold text-[#b23b24]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse rounded-2xl border border-[#e7dfbd] bg-white p-5 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((complaint) => (
            <article
              key={complaint.id}
              className="overflow-hidden rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e7c8] pb-3 mb-3">

                <ComplaintStatusBadge status={complaint.status} />
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-black text-[#3d3a2c]">
                  {complaint.title}
                </h3>

                <div className="flex justify-between items-end mt-4 pt-3 border-t border-[#f5efe0]">
                  <div className="flex flex-wrap gap-4 text-xs font-semibold text-[#766f60]">
                    <span className="flex items-center gap-1.5">
                      <FileText size={14} className="text-[#b84a25]" />
                      {complaint.type === "SHOP_COMPLAINT" ? "Khiếu nại cửa hàng" : "Khiếu nại hệ thống"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-[#b84a25]" />
                      {formatDate(complaint.createdAt)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveComplaintId(complaint.id)}
                    className="rounded-full bg-[#3d3a2c] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#29271f] cursor-pointer"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-[#e7dfbd] bg-white p-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#fffaf0] text-[#b84a25] mb-4">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-lg font-black text-[#3d3a2c]">Chưa có khiếu nại nào</h2>
          <p className="mt-1 text-sm text-[#766f60]">
            Các khiếu nại bạn đã gửi đối với đơn hàng hoàn thành sẽ hiển thị tại đây.
          </p>
        </div>
      )}

      <ComplaintDetailModal
        open={Boolean(activeComplaintId)}
        complaintId={activeComplaintId}
        onClose={() => setActiveComplaintId(null)}
      />
    </div>
  );
}
