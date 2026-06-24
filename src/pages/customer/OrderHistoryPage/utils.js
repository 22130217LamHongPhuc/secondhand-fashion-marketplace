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
    console.log("[getStoredCustomerId] From direct key:", Number(fromDirectKey));
    return Number(fromDirectKey);
  }

  const rawUser =
    localStorage.getItem("user") || localStorage.getItem("currentUser");

  if (!rawUser) {
    console.warn("[getStoredCustomerId] No user in localStorage → returning null");
    return null;
  }

  try {
    const user = JSON.parse(rawUser);
    console.log("[getStoredCustomerId] Parsed user from localStorage:", user);
    const id = user?.customerId ?? user?.id ?? user?.userId;
    const result = Number.isFinite(Number(id)) ? Number(id) : null;
    console.log("[getStoredCustomerId] Resolved customerId:", result, "| raw id:", id);
    return result;
  } catch {
    console.error("[getStoredCustomerId] Failed to parse user from localStorage");
    return null;
  }
}
