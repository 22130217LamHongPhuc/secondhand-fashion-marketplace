import { CalendarDays, MapPin, MessageSquare, Star, BadgeCheck } from "lucide-react";

function initials(name) {
  if (!name) return "";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return `${first}${last}`.toUpperCase();
}

function joinYear(createdAt) {
  if (!createdAt) return "";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "";
  return String(date.getFullYear());
}

export default function ShopHero({ shop }) {
  const resolvedShop = shop ?? {
    name: "Sài Gòn Retro",
    description:
      "Chuyên quần áo vintage tuyển chọn từ thập niên 80s - 90s. Mỗi món đồ đều có một câu chuyện riêng.",
    avatarUrl:
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop",
    bannerUrl: "",
    ratingAvg: "4.9",
    totalReviews: "1.2k",
    isActive: true,
    isVerified: false,
    createdAt: "2021-01-01",
  };

  return (
    <section className="relative mx-8 mt-4 overflow-hidden rounded-4xl bg-linear-to-r from-[#fff7dc] to-[#ffe1b5] px-8 py-8">
      {resolvedShop.bannerUrl ? (
        <div
          className="pointer-events-none absolute inset-0 opacity-15"
          style={{
            backgroundImage: `url(${resolvedShop.bannerUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : null}

      <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-7">
          <div className="relative shrink-0">
            <div className="h-28 w-28 overflow-hidden rounded-full bg-[#d8d0ba]">
              {resolvedShop.avatarUrl ? (
                <img
                  src={resolvedShop.avatarUrl}
                  alt="Shop avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-black text-[#a84720]">
                  {initials(resolvedShop.name)}
                </div>
              )}
            </div>

            <span
              className={`absolute bottom-3 right-1 h-4 w-4 rounded-full border-2 border-[#fff4cf] ${
                resolvedShop.isActive ? "bg-green-500" : "bg-[#d7cfb8]"
              }`}
            />
          </div>

          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#a84720] flex items-center gap-2">
              {resolvedShop.name}
              {resolvedShop.isVerified && (
                <BadgeCheck className="w-8 h-8 text-blue-500 fill-blue-500/10 shrink-0" />
              )}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#7a6b58]">
              {resolvedShop.description}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-[#6f6657]">
              <div className="flex items-center gap-1">
                <Star size={13} className="fill-[#b34d22] text-[#b34d22]" />
                <span className="font-bold text-[#3f392f]">
                  {resolvedShop.ratingAvg ?? ""}
                </span>
                <span>
                  ({resolvedShop.totalReviews ?? 0} đánh giá)
                  {resolvedShop.isVerified ? " · Đã xác thực" : ""}
                </span>
              </div>

              {resolvedShop.location ? (
                <div className="flex items-center gap-1">
                  <MapPin size={13} />
                  <span>{resolvedShop.location}</span>
                </div>
              ) : null}

              <div className="flex items-center gap-1">
                <CalendarDays size={13} />
                <span>Tham gia {joinYear(resolvedShop.createdAt) || ""}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 md:self-start">
          <button className="rounded-full bg-[#b34d22] px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#963d18]">
            + Theo dõi
          </button>

          <button className="grid h-12 w-12 place-items-center rounded-full bg-[#fff2ca] text-[#b34d22] transition hover:bg-white">
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
