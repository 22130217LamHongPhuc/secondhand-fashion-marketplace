export function formatVnd(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

export function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStoredCustomerId() {
  const fromDirectKey =
    localStorage.getItem("customerId") || localStorage.getItem("userId");

  if (fromDirectKey && Number.isFinite(Number(fromDirectKey))) {
    return Number(fromDirectKey);
  }

  const rawUser =
    localStorage.getItem("user") || localStorage.getItem("currentUser");

  if (!rawUser) return 1;

  try {
    const user = JSON.parse(rawUser);
    const id = user?.customerId ?? user?.id ?? user?.userId;
    return Number.isFinite(Number(id)) ? Number(id) : 1;
  } catch {
    return 1;
  }
}
