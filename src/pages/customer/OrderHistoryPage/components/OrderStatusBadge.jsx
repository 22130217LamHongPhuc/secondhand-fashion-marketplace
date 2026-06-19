import { ORDER_STATUS_META } from "../constants";

export default function OrderStatusBadge({ status }) {
  const meta = ORDER_STATUS_META[status] || ORDER_STATUS_META.PENDING;
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
