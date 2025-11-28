import { Droplets } from "lucide-react";
import PerfumeFlipCard from "./PerfumeFlipCard";

export default function PerfumeGrid({
  items,
  selectedStoreId,
  stores,
  onUpdate,
}) {
  // Pastikan items ada, jika kosong kembalikan null (sudah dihandle di main.jsx)
  if (!items || items.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-0">
      {items.map((item) => (
        <div key={item.id} className="h-80 w-full">
          <PerfumeFlipCard
            item={item}
            // PERBAIKAN PENTING: Meneruskan props ini ke bawah
            selectedStoreId={selectedStoreId}
            stores={stores}
            onUpdate={onUpdate}
            onDelete={onUpdate}
          />
        </div>
      ))}
    </div>
  );
}
