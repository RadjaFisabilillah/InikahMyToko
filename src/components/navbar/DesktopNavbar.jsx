// src/components/navbar/DesktopNavbar.jsx
import logoUrl from "../../assets/LOGORN.png"; // Pastikan logo tetap ada atau ganti

export default function DesktopNavbar({ currentPage, onNavigate }) {
  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "pria", label: "Parfum Pria" },
    { id: "wanita", label: "Parfum Wanita" },
    { id: "profile", label: "Profil" },
  ];

  return (
    <nav className="hidden md:block shadow-lg border-b border-blue-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => onNavigate("home")}
          >
            <div className="relative group">
              <img
                src={logoUrl}
                alt="Logo"
                className="w-12 h-12 object-contain filter drop-shadow-md transform transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
                Stok
              </h1>
              <h2 className="text-base font-semibold bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400 bg-clip-text text-transparent -mt-1">
                Parfum
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-3 text-base font-medium transition-all duration-200 border-b-2 ${
                  currentPage === item.id
                    ? "text-blue-600 border-blue-500"
                    : "text-slate-600 border-transparent hover:text-blue-500 hover:border-blue-300"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
