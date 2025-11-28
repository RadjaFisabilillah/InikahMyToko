import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./lib/supabaseClient";
import { Plus, X } from "lucide-react";
import "./index.css";

// Components
import DesktopNavbar from "./components/navbar/DesktopNavbar";
import MobileNavbar from "./components/navbar/MobileNavbar";
import AuthPage from "./components/auth/AuthPage";
import PerfumeGrid from "./components/perfume/PerfumeGrid";
import DetailPage from "./pages/DetailPage";
import PWABadge from "./PWABadge";

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // State untuk form tambah
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
    // Cek Session
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

  // Routing Sederhana
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

    // Filter Logic
    const filteredItems = items.filter((item) => {
      if (currentPage === "home") return true;
      if (currentPage === "pria") return item.category === "Pria";
      if (currentPage === "wanita") return item.category === "Wanita";
      return false;
    });

    if (currentPage === "profile") {
      return (
        <div className="p-4 max-w-lg mx-auto pt-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center mb-4 text-blue-600 font-bold text-2xl">
              {session.user.email[0].toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">Pengguna</h2>
            <p className="text-slate-500 mb-6">{session.user.email}</p>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
              <h3 className="font-bold text-slate-700 mb-2">
                Tentang Aplikasi
              </h3>
              <p className="text-sm text-slate-600">
                Aplikasi manajemen stok parfum berbasis PWA. Dibangun untuk
                efisiensi pengelolaan inventaris dengan tampilan modern.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
            >
              Keluar
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto pb-24">
        {/* Header Section */}
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            {currentPage === "home"
              ? "Dashboard Stok"
              : `Parfum ${
                  currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
                }`}
          </h1>
          <p className="text-slate-500">
            {currentPage === "home"
              ? `Total ${items.length} varian parfum dalam inventaris.`
              : `Menampilkan koleksi untuk ${currentPage}.`}
          </p>
        </div>

        <PerfumeGrid items={filteredItems} onItemClick={setSelectedItem} />

        {/* Floating Action Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="fixed bottom-20 md:bottom-10 right-4 md:right-10 bg-blue-600 text-white p-4 rounded-full shadow-2xl hover:bg-blue-700 hover:scale-110 transition-all z-40"
        >
          <Plus size={24} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <DesktopNavbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main>{renderContent()}</main>
      <MobileNavbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <PWABadge />

      {/* Modal Tambah Data */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800"
            >
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-4">
              Tambah Stok Baru
            </h2>
            <form onSubmit={handleAddItem} className="space-y-3">
              <input
                required
                placeholder="Nama Parfum"
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
              <input
                required
                placeholder="Brand"
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setNewItem({ ...newItem, brand: e.target.value })
                }
              />
              <div className="flex gap-3">
                <input
                  required
                  type="number"
                  placeholder="Harga"
                  className="w-1/2 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) =>
                    setNewItem({ ...newItem, price: e.target.value })
                  }
                />
                <input
                  required
                  type="number"
                  placeholder="Stok"
                  className="w-1/2 p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  onChange={(e) =>
                    setNewItem({ ...newItem, stock: e.target.value })
                  }
                />
              </div>
              <select
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                <option value="Pria">Pria</option>
                <option value="Wanita">Wanita</option>
              </select>
              <input
                placeholder="URL Gambar (Opsional)"
                className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                onChange={(e) =>
                  setNewItem({ ...newItem, image_url: e.target.value })
                }
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 mt-2"
              >
                Simpan
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
