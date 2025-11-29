import { useState } from "react";
import {
  Droplets,
  Save,
  Trash2,
  X,
  Store,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

export default function PerfumeFlipCard({
  item,
  selectedStoreId,
  stores = [],
  onUpdate,
  onDelete,
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ ...item });

  const currentInventory = item.inventory?.find(
    (inv) => inv.store_id === selectedStoreId
  );
  const currentStock = currentInventory ? currentInventory.stock : 0;

  const inputClass =
    "w-full p-3 bg-gray-50 rounded-xl border border-transparent focus:bg-white focus:border-secondary focus:ring-0 transition-all font-medium outline-none text-gray-800";
  const labelClass = "block text-xs font-bold text-gray-500 uppercase mb-1";
  const btnPrimaryClass =
    "flex-1 bg-primary text-white py-3 rounded-xl font-bold tracking-wide hover:bg-gray-900 transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2";
  const btnDeleteClass =
    "p-3 bg-white border-2 border-red-50 text-red-500 rounded-xl hover:bg-red-50 hover:border-red-100 transition-colors";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setLoading(true);

    const { error: perfumeError } = await supabase
      .from("perfumes")
      .update({
        name: formData.name,
        brand: formData.brand,
        price: formData.price,
        category: formData.category,
        description: formData.description,
        image_url: formData.image_url,
      })
      .eq("id", item.id);

    if (perfumeError) {
      alert(perfumeError.message);
      setLoading(false);
      return;
    }

    if (selectedStoreId) {
      if (currentInventory) {
        const { error: invError } = await supabase
          .from("inventory")
          .update({ stock: formData.stock })
          .eq("id", currentInventory.id);
        if (invError) alert(invError.message);
      } else {
        const { error: invError } = await supabase.from("inventory").insert([
          {
            perfume_id: item.id,
            store_id: selectedStoreId,
            stock: formData.stock,
          },
        ]);
        if (invError) alert(invError.message);
      }
    }

    setLoading(false);
    onUpdate();
    setIsFlipped(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Hapus produk ini?")) return;
    setLoading(true);
    const { error } = await supabase
      .from("perfumes")
      .delete()
      .eq("id", item.id);
    if (!error) onDelete();
    else {
      alert(error.message);
      setLoading(false);
    }
  };

  const handleFlip = () => {
    setFormData({
      ...item,
      stock: selectedStoreId ? currentStock : 0,
    });
    setIsFlipped(true);
  };

  // Helper untuk warna badge
  const getCategoryColor = (cat) => {
    if (cat === "Pria") return "bg-primary";
    if (cat === "Wanita") return "bg-secondary";
    return "bg-purple-600"; // Warna UNISEX
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity duration-500 ${
          isFlipped
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsFlipped(false)}
      />

      <div
        className={`transition-all duration-700 ease-in-out perspective-1000 ${
          isFlipped
            ? "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md z-[100] h-[600px] max-h-[90vh]"
            : "relative w-full h-80 z-0"
        }`}
      >
        <div
          className={`relative w-full h-full duration-700 transform-style-3d shadow-2xl rounded-3xl ${
            isFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* DEPAN */}
          <div
            onClick={handleFlip}
            className="absolute inset-0 w-full h-full backface-hidden bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-secondary/10 transition-all group"
          >
            <div className="h-48 w-full bg-gray-100 relative">
              <img
                src={item.image_url || "https://via.placeholder.com/300"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-2 left-2">
                <span
                  className={`text-[10px] uppercase font-bold tracking-widest px-2 py-1 rounded-md text-white shadow-sm ${getCategoryColor(
                    item.category
                  )}`}
                >
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col justify-between h-[calc(100%-12rem)]">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-0.5">
                  {item.brand}
                </span>
                <h3 className="font-bold text-gray-900 text-lg leading-tight truncate group-hover:text-secondary transition-colors">
                  {item.name}
                </h3>
              </div>

              <div className="flex justify-between items-end border-t border-gray-50 pt-3 mt-2">
                <div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">
                    Harga
                  </p>
                  <p className="text-primary font-bold">
                    Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>

                {selectedStoreId ? (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded-lg">
                    <Droplets
                      size={14}
                      className={
                        currentStock < 50 ? "text-red-500" : "text-blue-400"
                      }
                    />
                    <span
                      className={
                        currentStock < 50 ? "text-red-500 font-bold" : ""
                      }
                    >
                      {currentStock} ml
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs font-bold text-secondary bg-pink-50 px-2 py-1 rounded-lg">
                    <Store size={14} /> <span>Cek Stok</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* BELAKANG */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-white rounded-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 pb-4 flex justify-between items-center bg-white border-b border-gray-50">
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {selectedStoreId ? "Edit Produk" : "Detail Stok"}
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-wide mt-1">
                  {item.name}
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFlipped(false);
                }}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-primary transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 pt-4 overflow-y-auto flex-1 custom-scrollbar">
              {!selectedStoreId && (
                <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                    <Store size={14} /> Ketersediaan Per Toko
                  </h4>
                  <div className="space-y-2">
                    {stores?.length > 0 ? (
                      stores.map((store) => {
                        const inv = item.inventory?.find(
                          (i) => i.store_id === store.id
                        );
                        const stockVal = inv ? inv.stock : 0;
                        const isAvailable = stockVal > 0;

                        return (
                          <div
                            key={store.id}
                            className={`flex justify-between items-center p-3 rounded-xl border transition-colors ${
                              isAvailable
                                ? "bg-white border-gray-200 shadow-sm"
                                : "bg-transparent border-transparent opacity-60"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-1.5 rounded-full ${
                                  isAvailable
                                    ? "bg-green-100 text-green-600"
                                    : "bg-gray-200 text-gray-400"
                                }`}
                              >
                                <MapPin size={14} />
                              </div>
                              <span
                                className={`text-sm font-bold ${
                                  isAvailable
                                    ? "text-gray-800"
                                    : "text-gray-400"
                                }`}
                              >
                                {store.name}
                              </span>
                            </div>

                            {isAvailable ? (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                <Droplets size={12} /> {stockVal} ml
                              </div>
                            ) : (
                              <span className="text-xs font-bold text-gray-400 bg-gray-200 px-2 py-1 rounded-lg">
                                Habis
                              </span>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-gray-400">
                        Belum ada toko terdaftar.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {selectedStoreId && (
                  <div className="bg-secondary/5 p-4 rounded-xl border border-secondary/20 mb-6">
                    <label className={`${labelClass} text-secondary`}>
                      Stok di Toko Ini (ml)
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full p-3 bg-white rounded-xl border border-secondary focus:ring-2 focus:ring-secondary/20 font-bold text-lg outline-none pl-10 text-primary"
                      />
                      <Droplets className="absolute left-3 top-4 text-secondary w-5 h-5" />
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">
                    Informasi Produk (Global)
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className={labelClass}>Nama Produk</label>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Brand</label>
                      <input
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div className="flex gap-4">
                      <div className="w-full">
                        <label className={labelClass}>Harga (Rp)</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          className={inputClass}
                        />
                      </div>
                    </div>

                    {/* PILIHAN KATEGORI BARU (TERMASUK UNISEX) */}
                    <div>
                      <label className={labelClass}>Kategori</label>
                      <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-transparent">
                        {["Pria", "Wanita", "Unisex"].map((cat) => (
                          <label
                            key={cat}
                            className={`flex-1 py-2.5 text-center text-sm font-bold rounded-lg cursor-pointer transition-all ${
                              formData.category === cat
                                ? cat === "Unisex"
                                  ? "bg-purple-600 text-white shadow-md"
                                  : cat === "Pria"
                                  ? "bg-primary text-white shadow-md"
                                  : "bg-secondary text-white shadow-md"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name="category"
                              value={cat}
                              checked={formData.category === cat}
                              onChange={handleChange}
                              className="hidden"
                            />
                            {cat}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>URL Gambar</label>
                      <input
                        name="image_url"
                        value={formData.image_url}
                        onChange={handleChange}
                        className={`${inputClass} text-xs text-gray-500`}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Deskripsi</label>
                      <textarea
                        name="description"
                        rows="2"
                        value={formData.description || ""}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-4 bg-white border-t border-gray-50 flex gap-3 shrink-0">
              <button
                onClick={handleDelete}
                disabled={loading}
                className={btnDeleteClass}
              >
                <Trash2 size={20} />
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={btnPrimaryClass}
              >
                {loading ? (
                  <span className="animate-pulse">Menyimpan...</span>
                ) : (
                  <>
                    <Save size={18} /> SIMPAN
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
