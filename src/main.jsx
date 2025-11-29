import { StrictMode, useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./lib/supabaseClient";
import { Plus, X, SearchX, Store, Loader2 } from "lucide-react";
import "./index.css";

// Components
import DesktopNavbar from "./components/navbar/DesktopNavbar";
import MobileNavbar from "./components/navbar/MobileNavbar";
import AuthPage from "./components/auth/AuthPage";
import PerfumeGrid from "./components/perfume/PerfumeGrid";
import ProfilePage from "./pages/ProfilePage";
import PWABadge from "./PWABadge";

function App() {
  const [session, setSession] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [items, setItems] = useState([]);

  // STATE TOKO & SEARCH
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  // State untuk Form Tambah
  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "",
    category: "Pria",
    description: "",
    image_url: "",
    store_id: "",
  });

  // State Autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchStores();
        fetchData();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchStores();
        fetchData();
      }
    });

    // Event listener untuk menutup dropdown suggestion saat klik di luar
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 1. FETCH TOKO
  const fetchStores = async () => {
    const { data } = await supabase
      .from("stores")
      .select("*")
      .order("created_at");
    if (data) {
      setStores(data);
      // Otomatis set toko pertama untuk form tambah jika ada
      if (data.length > 0)
        setNewItem((prev) => ({ ...prev, store_id: data[0].id }));
    }
  };

  // 2. FETCH DATA (WAJIB ADA INVENTORY UNTUK FLIP CARD)
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("perfumes")
      .select(
        `
            *,
            inventory (
                id,
                store_id,
                stock
            )
        `
      )
      .order("created_at", { ascending: false });

    if (!error) setItems(data);
  };

  // LOGIKA AUTOCOMPLETE
  const handleNameInput = async (e) => {
    const value = e.target.value;
    setNewItem((prev) => ({ ...prev, name: value }));

    if (value.length > 1) {
      const { data } = await supabase
        .from("perfumes")
        .select("*")
        .ilike("name", `%${value}%`)
        .limit(5);

      if (data && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (perfume) => {
    setNewItem((prev) => ({
      ...prev,
      name: perfume.name,
      brand: perfume.brand,
      price: perfume.price, // Harga ikut terisi
      category: perfume.category,
      description: perfume.description || "",
      image_url: perfume.image_url || "",
    }));
    setShowSuggestions(false);
  };

  // LOGIKA TAMBAH ITEM (SMART MERGE)
  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.store_id) {
      alert("Mohon pilih toko terlebih dahulu.");
      return;
    }
    setLoadingAction(true);

    try {
      // Cek apakah parfum sudah ada (Case Insensitive)
      const { data: existingPerfumes } = await supabase
        .from("perfumes")
        .select("id")
        .ilike("name", newItem.name)
        .maybeSingle();

      let perfumeId;

      if (existingPerfumes) {
        // Parfum sudah ada, gunakan ID-nya
        perfumeId = existingPerfumes.id;
      } else {
        // Insert Parfum Baru
        const { data: newPerfume, error: createError } = await supabase
          .from("perfumes")
          .insert([
            {
              name: newItem.name,
              brand: newItem.brand,
              price: newItem.price,
              category: newItem.category,
              description: newItem.description,
              image_url: newItem.image_url,
              user_id: session.user.id,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;
        perfumeId = newPerfume.id;
      }

      // Cek Inventory di Toko Terpilih
      const { data: existingInventory } = await supabase
        .from("inventory")
        .select("id, stock")
        .eq("perfume_id", perfumeId)
        .eq("store_id", newItem.store_id)
        .maybeSingle();

      if (existingInventory) {
        // Update Stok (Akumulasi)
        const newStock = existingInventory.stock + parseInt(newItem.stock);
        const { error: updateError } = await supabase
          .from("inventory")
          .update({ stock: newStock })
          .eq("id", existingInventory.id);
        if (updateError) throw updateError;
        alert(`Stok diperbarui! Total: ${newStock} ml`);
      } else {
        // Insert Stok Baru
        const { error: insertError } = await supabase.from("inventory").insert([
          {
            perfume_id: perfumeId,
            store_id: newItem.store_id,
            stock: parseInt(newItem.stock),
          },
        ]);
        if (insertError) throw insertError;
        alert("Produk berhasil ditambahkan!");
      }

      setIsAddModalOpen(false);
      setNewItem((prev) => ({
        ...prev,
        name: "",
        brand: "",
        price: "",
        stock: "",
      }));
      fetchData();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoadingAction(false);
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
    if (currentPage === "profile") {
      return <ProfilePage session={session} onLogout={handleLogout} />;
    }

    const filteredItems = items.filter((item) => {
      // LOGIKA FILTER KATEGORI (TERMASUK UNISEX)
      const matchesCategoryPage =
        currentPage === "home"
          ? true
          : currentPage === "pria"
          ? item.category === "Pria" || item.category === "Unisex"
          : currentPage === "wanita"
          ? item.category === "Wanita" || item.category === "Unisex"
          : currentPage === "unisex"
          ? item.category === "Unisex"
          : false;

      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategoryPage && matchesSearch;
    });

    return (
      // LAYOUT FIX: pt-48 agar judul aman tidak tertutup navbar
      <div className="p-4 md:p-20 max-w-7xl mx-auto pb-32 pt-28">
        {!searchQuery && (
          <div className="mb-10 mt-4 text-center md:text-left animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-bold text-primary mb-2 tracking-tight">
              {currentPage === "home"
                ? "Dashboard"
                : `Koleksi ${
                    currentPage.charAt(0).toUpperCase() + currentPage.slice(1)
                  }`}
            </h1>
            <p className="text-gray-500">
              {selectedStore
                ? `Menampilkan stok untuk: ${
                    stores.find((s) => s.id === selectedStore)?.name
                  }`
                : "Menampilkan katalog global (Semua Toko)."}
            </p>
          </div>
        )}

        {filteredItems.length > 0 ? (
          <PerfumeGrid
            items={filteredItems}
            selectedStoreId={selectedStore}
            stores={stores}
            onUpdate={fetchData}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300 bg-white/50 rounded-3xl border border-dashed border-gray-300 mt-10">
            <div className="bg-gray-100 p-5 rounded-full mb-4">
              <SearchX className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-primary mb-1">
              Data Tidak Ditemukan
            </h3>
            <p className="text-gray-500 font-medium text-sm">
              Belum ada parfum ditambahkan.
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
        stores={stores}
        selectedStore={selectedStore}
        onSelectStore={setSelectedStore}
      />

      <main>{renderContent()}</main>

      <MobileNavbar currentPage={currentPage} onNavigate={setCurrentPage} />
      <PWABadge />

      {/* MODAL TAMBAH STOK */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 relative shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-primary transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold text-primary mb-6">
              Tambah Stok
            </h2>

            {stores.length === 0 ? (
              <div className="text-center py-10">
                <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">Anda belum memiliki toko.</p>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setCurrentPage("profile");
                  }}
                  className="text-secondary font-bold hover:underline"
                >
                  Buat Toko di Profil
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Pilih Toko
                  </label>
                  <select
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                    onChange={(e) =>
                      setNewItem({ ...newItem, store_id: e.target.value })
                    }
                    value={newItem.store_id}
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NAMA + AUTOCOMPLETE */}
                <div className="relative" ref={suggestionRef}>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Nama Parfum
                  </label>
                  <input
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium placeholder:text-gray-300"
                    value={newItem.name}
                    onChange={handleNameInput}
                    onFocus={() => newItem.name && setShowSuggestions(true)}
                    placeholder="Ketik untuk mencari..."
                  />

                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95 duration-100">
                      {suggestions.map((sug) => (
                        <div
                          key={sug.id}
                          onClick={() => selectSuggestion(sug)}
                          className="p-3 hover:bg-pink-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                        >
                          <p className="text-sm font-bold text-gray-800 group-hover:text-primary">
                            {sug.name}
                          </p>
                          <p className="text-xs text-gray-400">{sug.brand}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Brand
                  </label>
                  <input
                    required
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                    value={newItem.brand}
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
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Volume (ml)
                    </label>
                    <input
                      required
                      type="number"
                      className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                      value={newItem.stock}
                      onChange={(e) =>
                        setNewItem({ ...newItem, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Kategori
                  </label>
                  <select
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  >
                    <option value="Pria">Pria</option>
                    <option value="Wanita">Wanita</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    URL Gambar
                  </label>
                  <input
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all text-sm text-gray-500"
                    value={newItem.image_url}
                    onChange={(e) =>
                      setNewItem({ ...newItem, image_url: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    className="w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all text-sm"
                    rows="2"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold tracking-wide hover:bg-gray-900 transition-all mt-4 shadow-lg shadow-primary/20 flex justify-center items-center"
                >
                  {loadingAction ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "SIMPAN DATA"
                  )}
                </button>
              </form>
            )}
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
