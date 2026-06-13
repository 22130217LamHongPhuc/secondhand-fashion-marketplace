import { Search, Bell } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between border-b border-neutral-200 bg-white/60 px-8 py-3 backdrop-blur-sm">
      {/* Search Bar */}
      <div className="relative w-full max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-7 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder="Tìm kiếm người dùng, email..."
          className="w-full rounded-full border border-neutral-200 bg-white py-2.5 pl-10 pr-4 text-sm text-neutral-700 placeholder:text-neutral-400 outline-none transition-all focus:border-brand-primary/40 focus:ring-2 focus:ring-brand-primary/10"
        />
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button className="relative rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-700">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-brand-primary" />
        </button>

        {/* User Avatar */}
        <button className="h-9 w-9 overflow-hidden rounded-full bg-brand-light ring-2 ring-brand-primary/20 transition-all hover:ring-brand-primary/40">
          <img
            src="https://i.pravatar.cc/36?img=47"
            alt="Avatar"
            className="h-full w-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
