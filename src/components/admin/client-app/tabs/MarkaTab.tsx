import { useRef, useState } from "react";
import { Upload, Trash2, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { motion } from "framer-motion";
import type { BrandState } from "../ClientAppPage";

interface MarkaTabProps {
  brand: BrandState;
  setBrand: (b: BrandState) => void;
  isDemo: boolean;
}

export function MarkaTab({ brand, setBrand, isDemo }: MarkaTabProps) {
  const [saving, setSaving] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const readFile = (file: File, onLoaded: (url: string) => void) => {
    if (file.size > 2_500_000) {
      toast.error("Plik jest za duży (max 2 MB dla logo, 5 MB dla okładki)");
    }
    const reader = new FileReader();
    reader.onload = (e) => onLoaded(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    toast.success("✓ Aplikacja klientki zaktualizowana");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">🎨 Tożsamość marki</h2>
        <p className="text-sm text-muted-foreground mt-1">Jak klientki widzą Twój salon w aplikacji</p>
      </div>

      {/* Salon name */}
      <div className="space-y-2">
        <Label>Nazwa salonu w aplikacji</Label>
        <Input
          value={brand.salonName}
          onChange={(e) => setBrand({ ...brand, salonName: e.target.value })}
          placeholder="Helena Milewska Kosmetologia"
        />
        <p className="text-xs text-muted-foreground">Może być krótsza niż nazwa konta — widoczna na ekranie klientki</p>
      </div>

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo salonu</Label>
        <div
          onClick={() => logoRef.current?.click()}
          className="border-2 border-dashed border-border rounded-2xl p-8 text-center hover:border-primary hover:bg-primary/5 cursor-pointer transition-colors"
        >
          <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm font-medium">Przeciągnij logo lub kliknij</p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG — max 2MB</p>
        </div>
        <input
          ref={logoRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readFile(f, (url) => setBrand({ ...brand, logoUrl: url }));
          }}
        />
        {brand.logoUrl && (
          <div className="flex items-center gap-3">
            <img src={brand.logoUrl} alt="logo" className="w-20 h-20 rounded-full object-cover border" />
            <button
              onClick={() => setBrand({ ...brand, logoUrl: null })}
              className="text-sm text-destructive hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Usuń
            </button>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Wyświetlane jako okrągła ikona w aplikacji klientki</p>
      </div>

      {/* Cover */}
      <div className="space-y-2">
        <Label>Zdjęcie okładki</Label>
        <div
          onClick={() => coverRef.current?.click()}
          className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-border overflow-hidden hover:border-primary cursor-pointer bg-muted/40 transition-colors"
        >
          {brand.coverUrl ? (
            <img src={brand.coverUrl} alt="cover" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Upload className="w-6 h-6 mb-1" /> <span className="text-sm">Dodaj zdjęcie okładki (16:9)</span>
            </div>
          )}
        </div>
        <input
          ref={coverRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) readFile(f, (url) => setBrand({ ...brand, coverUrl: url }));
          }}
        />
        <p className="text-xs text-muted-foreground">Pierwsze co widzi klientka po otwarciu Twojej aplikacji</p>
      </div>

      {/* Brand color */}
      <div className="space-y-2">
        <Label>Kolor marki</Label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={brand.brandColor}
            onChange={(e) => setBrand({ ...brand, brandColor: e.target.value })}
            className="w-12 h-12 rounded-xl border cursor-pointer"
          />
          <Input
            value={brand.brandColor}
            onChange={(e) => setBrand({ ...brand, brandColor: e.target.value })}
            className="max-w-[140px] font-mono uppercase"
          />
          <div
            className="w-10 h-10 rounded-full shadow-sm transition-all duration-300"
            style={{ backgroundColor: brand.brandColor }}
          />
        </div>
        <p className="text-xs text-muted-foreground">Kolor przycisków i akcentów w aplikacji klientki</p>
        <p className="text-xs italic text-accent">Klientki kojarzą ten kolor z Twoim salonem — bądź konsekwentna</p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Opis salonu</Label>
        <Textarea
          value={brand.description}
          onChange={(e) => setBrand({ ...brand, description: e.target.value.slice(0, 160) })}
          rows={3}
          maxLength={160}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Widoczny w profilu salonu w aplikacji klientki</p>
          <span className="text-xs text-muted-foreground">{brand.description.length} / 160</span>
        </div>
      </div>

      {/* Instagram */}
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5"><Instagram className="w-4 h-4" /> Instagram salonu</Label>
        <div className="flex items-center">
          <span className="px-3 py-2 bg-muted rounded-l-md text-sm text-muted-foreground border border-r-0">@</span>
          <Input
            className="rounded-l-none"
            value={brand.instagram}
            onChange={(e) => setBrand({ ...brand, instagram: e.target.value.replace(/^@/, "") })}
            placeholder="helena_milewska_kosmetologia"
          />
        </div>
        <p className="text-xs text-muted-foreground">Link wyświetlany w profilu — klientki mogą Cię obserwować</p>
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-60"
      >
        {saving ? "Zapisuję..." : "Zapisz tożsamość marki"}
      </motion.button>
      {isDemo && (
        <p className="text-xs text-center text-muted-foreground -mt-2">Tryb demo — zmiany są tymczasowe</p>
      )}
    </div>
  );
}