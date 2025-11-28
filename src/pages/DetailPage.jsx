import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Trash2, Save, Package } from "lucide-react";

export default function DetailPage({ item, onBack, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...item });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("perfumes")
      .update(formData)
      .eq("id", item.id);

    setLoading(false);
    if (error) {
      alert("Gagal update: " + error.message);
    } else {
      onUpdate(); // Refresh data di parent
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus parfum ini?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("perfumes")
      .delete()
      .eq("id", item.id);
    if (!error) {
      onUpdate();
      onBack();
    } else {
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 pb-24 px-4 max-w-4xl mx-auto min-h-screen">
      <button
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={formData.image_url || "https://via.placeholder.com/400"}
            className="w-full h-full object-cover"
            alt="Preview"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
            <div>
              <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full uppercase tracking-wider mb-2 inline-block">
                {formData.category}
              </span>
              <h1 className="text-3xl font-bold text-white">{formData.name}</h1>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Detail Produk</h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Harga (Rp)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed font-bold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Stok
                </label>
                <div className="relative">
                  <Package className="absolute left-3 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-10 p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  URL Gambar
                </label>
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-500 mb-1">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows="4"
                  className="w-full p-3 bg-slate-50 rounded-xl border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {isEditing && (
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 transition-all flex justify-center items-center gap-2 mt-4"
              >
                {loading ? (
                  "Menyimpan..."
                ) : (
                  <>
                    <Save size={20} /> Simpan Perubahan
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
