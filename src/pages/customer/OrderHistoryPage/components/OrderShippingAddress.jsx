import { MapPin, Phone, UserRound } from "lucide-react";

export default function OrderShippingAddress({ address }) {
  if (!address) return null;

  const lines = [
    address.addressDetail,
    address.ward,
    address.district,
    address.province,
  ].filter(Boolean);

  return (
    <section className="rounded-2xl border border-[#e7dfbd] bg-white p-5 shadow-sm">
      <h2 className="text-lg font-black text-[#3d3a2c]">Địa chỉ nhận hàng</h2>

      <div className="mt-5 space-y-3 text-sm font-semibold text-[#766f60]">
        <p className="flex items-center gap-2">
          <UserRound size={16} className="text-[#b84a25]" />
          <span className="font-extrabold text-[#3d3a2c]">
            {address.fullName}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <Phone size={16} className="text-[#b84a25]" />
          {address.phone}
        </p>
        <p className="flex items-start gap-2 leading-6">
          <MapPin size={16} className="mt-1 shrink-0 text-[#b84a25]" />
          <span>{lines.join(", ")}</span>
        </p>
      </div>
    </section>
  );
}
