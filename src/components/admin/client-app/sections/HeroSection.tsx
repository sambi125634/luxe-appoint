import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, Upload, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface HeroSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
  onSplashChange?: (url: string | null) => void;
}

const DEMO_SPLASH = "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80";

export function HeroSection({ isDemo, salonId, onSplashChange }: HeroSectionProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  const { data: salon } = useQuery({
    queryKey: ["salon-hero", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase
        .from("salons")
        .select("splash_image_url")
        .eq("id", salonId)
        .maybeSingle();
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  const currentUrl = isDemo
    ? (localPreview ?? DEMO_SPLASH)
    : (localPreview ?? salon?.splash_image_url ?? null);

  useEffect(() => {
    onSplashChange?.(currentUrl);
  }, [currentUrl, onSplashChange]);

  const saveMutation = useMutation({
    mutationFn: async (url: string | null) => {
      if (!salonId) return;
      const { error } = await supabase
        .from("salons")
        .update({ splash_image_url: url })
        .eq("id", salonId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salon-hero", salonId] });
    },
  });

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Zdjęcie jest za duże (max 5 MB)");
      return;
    }
    if (isDemo) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLocalPreview(e.target?.result as string);
        toast.success("Podgląd zaktualizowany ✓ (w demo nie zapisujemy)");
      };
      reader.readAsDataURL(file);
      return;
    }
    if (!salonId) return;
    setUploading(true);
    try {
      const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase();
      const path = `${salonId}/splash-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("salon-media")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("salon-media").getPublicUrl(path);
      await saveMutation.mutateAsync(pub.publicUrl);
      setLocalPreview(pub.publicUrl);
      toast.success("Zdjęcie powitalne zapisane ✓");
    } catch (e) {
      console.error(e);
      toast.error("Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (isDemo) {
      setLocalPreview(null);
      toast.success("Usunięto podgląd (demo)");
      return;
    }
    try {
      await saveMutation.mutateAsync(null);
      setLocalPreview(null);
      toast.success("Zdjęcie usunięte");
    } catch {
      toast.error("Nie udało się usunąć");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <ImageIcon className="w-5 h-5" />
          Zdjęcie powitalne aplikacji
        </CardTitle>
        <CardDescription>
          Pierwsze, co zobaczy klientka po wejściu w Twój profil w aplikacji. To jedyne ustawienie wizualne specyficzne dla aplikacji — kolor przewodni, logo i opis salonu pobierane są automatycznie z profilu salonu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted">
          {currentUrl ? (
            <img src={currentUrl} alt="Zdjęcie powitalne" className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <ImageIcon className="w-10 h-10 opacity-40" />
              <p className="text-sm">Brak zdjęcia — klientki zobaczą gradient z koloru przewodniego</p>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => inputRef.current?.click()} disabled={uploading} className="gap-2">
            <Upload className="w-4 h-4" />
            {currentUrl ? "Wymień zdjęcie" : "Wgraj zdjęcie"}
          </Button>
          {currentUrl && (
            <Button variant="outline" onClick={handleRemove} disabled={uploading} className="gap-2">
              <Trash2 className="w-4 h-4" />
              Usuń
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Format: JPG / PNG / WEBP · max 5 MB · zalecane proporcje 16:9, min. 1200×675 px
        </p>
      </CardContent>
    </Card>
  );
}