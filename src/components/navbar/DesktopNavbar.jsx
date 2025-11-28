import { Search, Store, ChevronDown } from "lucide-react";
import logoUrl from "../../assets/LOGORN.png";

export default function DesktopNavbar({
  searchValue,
  onSearchChange,
  onNavigate,
  currentPage,
  stores,
  selectedStore,
  onSelectStore,
}) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full gap-4">
          {/* 1. LOGO */}
          <div
            className="flex items-center gap-2 cursor-pointer group flex-shrink-0"
            onClick={() => onNavigate("home")}
          >
            <img src={logoUrl} alt="Logo" className="w-9 h-9 object-contain" />
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-primary leading-none">
                Stok
              </h1>
              <h2 className="text-[10px] font-bold text-secondary tracking-[0.2em] leading-none">
                PARFUM
              </h2>
            </div>
          </div>

          {/* 2. STORE SELECTOR & SEARCH */}
          <div className="flex-1 max-w-3xl mx-auto h-10 flex gap-2">
            {/* Store Dropdown */}
            <div className="relative group w-1/3 max-w-[160px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Store className="h-4 w-4 text-secondary" />
              </div>
              <select
                value={selectedStore || "all"}
                onChange={(e) =>
                  onSelectStore(
                    e.target.value === "all" ? null : Number(e.target.value)
                  )
                }
                className="appearance-none block w-full h-full pl-9 pr-8 bg-gray-50 border-transparent text-gray-900 focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-xs font-bold transition-all shadow-inner outline-none cursor-pointer truncate"
              >
                <option value="all">Semua Toko</option>
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400 group-focus-within:text-secondary transition-colors" />
              </div>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="block w-full h-full pl-10 pr-4 bg-gray-50 border-transparent text-gray-900 placeholder-gray-400 focus:bg-white focus:border-secondary focus:ring-2 focus:ring-secondary/20 rounded-xl text-sm font-medium transition-all shadow-inner outline-none"
                placeholder="Cari parfum..."
              />
            </div>
          </div>

          {/* 3. PROFILE */}
          <div className="hidden md:flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => onNavigate("profile")}
              className="p-1.5 rounded-full hover:bg-gray-100"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-gray-700 text-white flex items-center justify-center text-xs font-bold">
                ME
              </div>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
