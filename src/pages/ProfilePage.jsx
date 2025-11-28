import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { User, Mail, Store, Plus, Trash2, MapPin } from "lucide-react";

export default function ProfilePage({ session, onLogout }) {
  const [stores, setStores] = useState([]);
  const [newStoreName, setNewStoreName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    const { data } = await supabase
      .from("stores")
      .select("*")
      .order("created_at");
    setStores(data || []);
  };

  const handleAddStore = async (e) => {
    e.preventDefault();
    if (!newStoreName.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("stores").insert([
      {
        name: newStoreName,
        user_id: session.user.id,
      },
    ]);

    if (error) alert(error.message);
    else {
      setNewStoreName("");
      fetchStores();
    }
    setLoading(false);
  };

  const handleDeleteStore = async (id) => {
    if (!confirm("Hapus toko ini? Semua data stok di toko ini akan hilang."))
      return;
    const { error } = await supabase.from("stores").delete().eq("id", id);
    if (!error) fetchStores();
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pt-32 pb-32">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 mb-8 border border-gray-100 text-center">
        <div className="w-24 h-24 bg-primary text-white rounded-full mx-auto flex items-center justify-center mb-6 text-3xl font-bold shadow-lg shadow-primary/30">
          {session.user.email[0].toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-primary mb-1">Pengguna</h2>
        <p className="text-gray-500 mb-6 font-medium">{session.user.email}</p>
        <button
          onClick={onLogout}
          className="w-full bg-white border-2 border-red-100 text-red-500 py-3.5 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
        >
          KELUAR APLIKASI
        </button>
      </div>

      {/* Store Management */}
      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h3 className="text-lg font-bold text-primary flex items-center gap-2">
            <Store className="text-secondary" /> Manajemen Toko
          </h3>
        </div>

        <div className="p-6">
          <form onSubmit={handleAddStore} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Nama Toko Baru..."
              value={newStoreName}
              onChange={(e) => setNewStoreName(e.target.value)}
              className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-secondary focus:ring-1 focus:ring-secondary outline-none transition-all"
            />
            <button
              disabled={loading}
              className="bg-primary text-white p-3 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <Plus />
            </button>
          </form>

          <div className="space-y-3">
            {stores.length === 0 && (
              <p className="text-gray-400 text-center text-sm">
                Belum ada toko.
              </p>
            )}
            {stores.map((store) => (
              <div
                key={store.id}
                className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-gray-100 group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-full text-secondary shadow-sm">
                    <MapPin size={18} />
                  </div>
                  <span className="font-bold text-gray-700">{store.name}</span>
                </div>
                <button
                  onClick={() => handleDeleteStore(store.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
