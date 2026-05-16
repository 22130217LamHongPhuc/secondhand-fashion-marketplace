import { CalendarDays, MapPin, MessageSquare, Star } from "lucide-react";

export default function ShopHero() {
  return (
    <section className="mx-8 mt-4 rounded-[32px] bg-gradient-to-r from-[#fff7dc] to-[#ffe1b5] px-8 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-7">
          <div className="relative shrink-0">
            <img
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=400&auto=format&fit=crop"
              alt="Shop avatar"
              className="h-28 w-28 rounded-full object-cover"
            />

            <span className="absolute bottom-3 right-1 h-4 w-4 rounded-full border-2 border-[#fff4cf] bg-green-500" />
          </div>

          <div>
            <h2 className="text-4xl font-black tracking-tight text-[#a84720]">
              Sài Gòn Retro
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#7a6b58]">
              Chuyên quần áo vintage tuyển chọn từ thập niên 80s - 90s. Mỗi món
              đồ đều có một câu chuyện riêng.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-6 text-xs text-[#6f6657]">
              <div className="flex items-center gap-1">
                <Star size={13} className="fill-[#b34d22] text-[#b34d22]" />
                <span className="font-bold text-[#3f392f]">4.9</span>
                <span>(1.2k đánh giá)</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin size={13} />
                <span>Quận 1, TP.HCM</span>
              </div>

              <div className="flex items-center gap-1">
                <CalendarDays size={13} />
                <span>Tham gia 2021</span>
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
