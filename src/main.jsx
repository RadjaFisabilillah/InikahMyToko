import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./lib/supabaseClient";
import { Plus, X, SearchX, Droplets } from "lucide-react";
import "./index.css";

// Components
import DesktopNavbar from "./components/navbar/DesktopNavbar";
import MobileNavbar from "./components/navbar/MobileNavbar";
import AuthPage from "./components/auth/AuthPage";
import PerfumeGrid from "./components/perfume/PerfumeGrid";
import PWABadge from "./PWABadge";

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State Search
  const [searchQuery, setSearchQuery] = useState("");

  // State Add Item
  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    price: 0,
    stock: 0,
    category: "Pria",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData();
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async () => {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setItems(data);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("perfumes")
      .insert([{ ...newItem, user_id: session.user.id }]);
    if (error) alert(error.message);
    else {
      setIsAddModalOpen(false);
      setNewItem({
        name: "",
        brand: "",
        price: 0,
        stock: 0,
        category: "Pria",
        description: "",
        image_url: "",
      });
      fetchData();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setItems([]);
  };

  if (!session) {
    return <AuthPage />;
  }

  const renderContent = () => {
    if (selectedItem) {
      return (
        <DetailPage
          item={selectedItem}
          onBack={() => setSelectedItem(null)}
          onUpdate={fetchData}
        />
      );
    }

    // LOGIKA FILTER
    const filteredItems = items.filter((item) => {
      const matchesCategory =
        currentPage === "home"
          ? true
          : currentPage === "pria"
          ? item.category === "Pria"
          : currentPage === "wanita"
          ? item.category === "Wanita"
          : false;

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    if (currentPage === "profile") {
      return (
        // PERBAIKAN 1: Tambah padding top profil jadi pt-40
        <div className="p-4 max-w-lg mx-auto pt-40 pb-32">
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 text-center border border-gray-100">
            <div className="w-24 h-24 bg-primary text-white rounded-full mx-auto flex items-center justify-center mb-6 text-3xl font-bold shadow-lg shadow-primary/30">
              {session.user.email[0].toUpperCase()}
            </div>
            <h2 className="text-2xl font-bold text-primary mb-1">Pengguna</h2>
            <p className="text-gray-500 mb-8 font-medium">
              {session.user.email}
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-white border-2 border-red-100 text-red-500 py-3.5 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
            >
              KELUAR APLIKASI
            </button>
          </div>
        </div>
      );
    }

    return (
      // PERBAIKAN 2: Ubah pt-32 menjadi pt-40 (160px) untuk jarak yang jauh lebih aman
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-32 pt-40">
        {!searchQuery && (
          // PERBAIKAN 3: Tambah mt-4 untuk dorongan ekstra pada judul
          <div className="mb-10 mt-10 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">
              {currentPage === "home"
                ? "Dashboard"
                : `Koleksi ${
                    currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
                  }`}
            </h1>
            <p className="text-gray-500">
              {currentPage === "home"
                ? `Total ${items.length} varian parfum tersedia.`
                : `Menampilkan ${filteredItems.length} item.`}
            </p>
          </div>
        )}

        {filteredItems.length > 0 ? (
          <PerfumeGrid items={filteredItems} onUpdate={fetchData} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300 bg-white/50 rounded-3xl border border-dashed border-gray-300 mt-10">
            <div className="bg-gray-100 p-5 rounded-full mb-4">
              <SearchX className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">
              Data Tidak Ditemukan
            </h3>
            <p className="text-gray-500 font-medium text-sm">
              Parfum habis atau belum ditambahkan.
            </p>
          </div>
        )}

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-24 right-4 md:right-10 bg-primary text-white p-4 rounded-2xl shadow-xl shadow-primary/30 hover:bg-gray-800 hover:scale-105 transition-all z-40 border-2 border-white/20"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <DesktopNavbar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main>{renderContent()}</main>

      <MobileNavbar currentPage={currentPage} onNavigate={setCurrentPage} />

      <PWABadge />

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Tambah Stok
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Nama Parfum
                </label>
                <input
                  required
                  className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Brand
                </label>
                <input
                  required
                  className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                  onChange={(e) =>
                    setNewItem({ ...newItem, brand: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-4">
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Harga
                  </label>
                  <input
                    required
                    type="number"
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Volume (ml)
                  </label>
                  <div className="relative">
                    <input
                      required
                      type="number"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium pl-9"
                      onChange={(e) =>
                        setNewItem({ ...newItem, stock: e.target.value })
                      }
                    />
                    <Droplets className="absolute left-3 top-3.5 text-gray-400 w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  Kategori
                </label>
                <select
                  className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                >
                  <option value="Pria">Pria</option>
                  <option value="Wanita">Wanita</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  URL Gambar
                </label>
                <input
                  className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all text-sm text-gray-500"
                  onChange={(e) =>
                    setNewItem({ ...newItem, image_url: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-wide hover:bg-gray-900 transition-all mt-4 shadow-lg shadow-primary/20"
              >
                SIMPAN DATA
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
