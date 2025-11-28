import { Package, Tag, ArrowRight } from "lucide-react";

export default function PerfumeGrid({ items, onItemClick }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-300">
        <p className="text-slate-500">Belum ada stok parfum.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {items.map((item, index) => (
        <div
          key={item.id}
          onClick={() => onItemClick(item)}
          className="group relative bg-white/40 backdrop-blur-xl border border-white/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer hover:-translate-y-1"
        >
          <div className="flex h-full">
            {/* Image Section */}
            <div className="w-1/3 relative overflow-hidden">
              <img
                src={item.image_url || "https://via.placeholder.com/150"}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
            </div>

            {/* Content Section */}
            <div className="w-2/3 p-4 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {item.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {item.brand}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors">
                  {item.name}
                </h3>
                <p className="text-slate-600 text-sm font-semibold">
                  Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/50">
                <div className="flex items-center space-x-1 text-slate-500 text-xs">
                  <Package className="w-3.5 h-3.5" />
                  <span>
                    Stok:{" "}
                    <span
                      className={
                        item.stock < 5
                          ? "text-red-500 font-bold"
                          : "text-slate-700"
                      }
                    >
                      {item.stock}
                    </span>
                  </span>
                </div>
                <div className="bg-white p-1.5 rounded-full shadow-sm text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
