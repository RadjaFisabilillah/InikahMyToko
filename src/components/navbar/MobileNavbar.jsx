// src/components/navbar/MobileNavbar.jsx
import { Home, User, Droplets, Heart } from "lucide-react";

export default function MobileNavbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "pria", label: "Pria", icon: Droplets },
    { id: "wanita", label: "Wanita", icon: Heart },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-1 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-around max-w-sm mx-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center py-2 px-3 transition-colors duration-200 ${
                isActive ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <IconComponent
                size={20}
                className="mb-1"
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
