import { useRef, useState } from "react";
import { Upload, Tag, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Photo {
  id: string;
  url: string;
  category: string;
}

const CATEGORIES = ["Wszystkie", "Zabiegi", "Wnętrze", "Zespół", "Przed/Po"];

const DEMO_PHOTOS: Photo[] = [
  { id: "1", url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600", category: "Zabiegi" },
  { id: "2", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600", category: "Wnętrze" },
  { id: "3", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600", category: "Zabiegi" },
  { id: "4", url: "https://images.unsplash.com/photo-1487412947147-5cebf100d293?w=600", category: "Zespół" },
  { id: "5", url: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=600", category: "Zabiegi" },
  { id: "6", url: "https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=600", category: "Przed/Po" },
];

export function GaleriaTab() {
  const [photos, setPhotos] = useState(DEMO_PHOTOS);
  const [filter, setFilter] = useState("Wszystkie");
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = filter === "Wszystkie" ? photos : photos.filter((p) => p.category === filter);

  const handleUpload = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).slice(0, 20).forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos((prev) => [...prev, { id: Date.now().toString() + Math.random(), url: e.target?.result as string, category: "Zabiegi" }]);
      };
      reader.readAsDataURL(f);
    });
    toast.success("✓ Zdjęcia dodane");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">🖼️ Galeria salonu</h2>
        <p className="text-sm text-muted-foreground mt-1">Pierwsze 3 zdjęcia widoczne bez scrollowania w aplikacji klientki</p>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => { e.preventDefault(); handleUpload(e.dataTransfer.files); }}
        className="border-2 border-dashed border-border rounded-2xl p-10 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="font-medium">Przeciągnij zdjęcia lub kliknij</p>
        <p className="text-xs text-muted-foreground mt-1">JPG, PNG — max 5MB każde — max 20 zdjęć</p>
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {visible.map((p, idx) => (
          <div
            key={p.id}
            className={cn(
              "relative group aspect-square rounded-xl overflow-hidden border bg-muted",
              filter === "Wszystkie" && idx < 3 && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/60 text-white">{p.category}</span>
            </div>
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1 bg-white/90 rounded text-muted-foreground cursor-grab"><GripVertical className="w-3.5 h-3.5" /></button>
            </div>
            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between">
              <button className="text-[10px] text-white flex items-center gap-1"><Tag className="w-3 h-3" /> Kategoria</button>
              <button onClick={() => setPhotos(photos.filter((x) => x.id !== p.id))} className="text-[10px] text-white flex items-center gap-1"><Trash2 className="w-3 h-3" /> Usuń</button>
            </div>
            {filter === "Wszystkie" && idx < 3 && (
              <div className="absolute bottom-1 left-1 text-[9px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded">Widoczne bez scrollowania</div>
            )}
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="mb-3">Dodaj pierwsze zdjęcia salonu — klientki pokochają je</p>
          <button onClick={() => inputRef.current?.click()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium">Dodaj zdjęcia</button>
        </div>
      )}

      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-3 text-sm">
        💡 <span className="font-medium">Tip:</span> Zdjęcia „Przed/Po" zwiększają konwersję nowych klientek o 34%
      </div>
    </div>
  );
}