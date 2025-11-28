import { LayoutGrid, Droplets, Heart, User } from "lucide-react";

export default function MobileNavbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: "home", label: "Dashboard", icon: LayoutGrid },
    { id: "pria", label: "Pria", icon: Droplets },
    { id: "wanita", label: "Wanita", icon: Heart },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-fit min-w-[320px] max-w-[95%] bg-white/95 backdrop-blur-xl border-t border-x border-gray-200/80 rounded-t-3xl pb-safe z-50 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)]">
      <div className="flex items-end justify-around gap-1 px-6 py-3 pb-4">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="relative flex flex-col items-center justify-center w-14 group"
            >
              {/* Active Indicator Dot (Ganti garis jadi titik agar lebih pas dengan rounded shape) */}
              {isActive && (
                <span className="absolute -top-3 w-1 h-1 bg-secondary rounded-full shadow-[0_0_8px_rgba(205,96,126,0.8)] animate-in fade-in zoom-in duration-300"></span>
              )}

              {/* Icon */}
              <div
                className={`p-2 rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "text-primary bg-gray-100 transform -translate-y-1 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <IconComponent
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={isActive ? "fill-secondary/10" : ""}
                />
              </div>

              {/* Label (Sembunyikan label saat tidak aktif agar lebih ringkas/bersih) */}
              <span
                className={`text-[9px] font-bold tracking-wide transition-all duration-300 absolute -bottom-3 whitespace-nowrap ${
                  isActive
                    ? "text-primary opacity-100 translate-y-0"
                    : "text-gray-400 opacity-0 translate-y-1"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
