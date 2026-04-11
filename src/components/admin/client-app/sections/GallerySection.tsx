import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Trash2, ImagePlus } from "lucide-react";
import { DEMO_GALLERY } from "../demo/demoData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface GallerySectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
}

const CATEGORIES = [
  { value: "all", label: "Wszystkie" },
  { value: "portfolio", label: "Portfolio" },
  { value: "salon", label: "Salon" },
  { value: "team", label: "Zespół" },
  { value: "before_after", label: "Przed/Po" },
];

export function GallerySection({ isDemo, salonId }: GallerySectionProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: liveGallery, isLoading } = useQuery({
    queryKey: ["admin-salon-gallery", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data } = await supabase
        .from("salon_gallery")
        .select("*")
        .eq("salon_id", salonId)
        .order("display_order", { ascending: true });
      return data ?? [];
    },
    enabled: !!salonId && !isDemo,
  });

  const normalizedGallery = isDemo
    ? DEMO_GALLERY
    : (liveGallery ?? []).map((g) => ({ ...g, url: g.image_url }));
  const filtered = activeCategory === "all" ? normalizedGallery : normalizedGallery.filter((g) => g.category === activeCategory);

  const handleUpload = () => {
    if (isDemo) {
      toast.info("W trybie demo dodaj zdjęcia gdy klientki dołączą — lub dodaj je już teraz!");
    } else {
      toast.info("Upload zdjęć wkrótce dostępny");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Camera className="w-5 h-5" />
              Galeria i portfolio
            </CardTitle>
            <CardDescription>Zdjęcia które klientki widzą na profilu Twojego salonu</CardDescription>
          </div>
          <Badge variant="secondary">{normalizedGallery.length} / 30 zdjęć</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList>
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c.value} value={c.value} className="text-xs">{c.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {!isDemo && isLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImagePlus className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Twoja aplikacja jest gotowa</p>
            <p className="text-sm mt-1">Dodaj zdjęcia żeby przyciągnąć klientki 📸</p>
            <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={handleUpload}>
              <Upload className="w-4 h-4" />
              Dodaj pierwsze zdjęcie
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((photo) => (
              <div key={photo.id} className="relative group aspect-square rounded-xl overflow-hidden border">
                <img
                  src={photo.url}
                  alt={photo.caption ?? "Zdjęcie salonu"}
                  className="w-full h-full object-cover"
                />
                {isDemo && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary" className="text-[10px] opacity-70">Demo</Badge>
                  </div>
                )}
                <Badge className="absolute top-2 right-2 text-[10px]" variant="secondary">
                  {CATEGORIES.find((c) => c.value === photo.category)?.label}
                </Badge>
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button variant="destructive" size="icon" className="w-8 h-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {photo.caption && (
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent p-2">
                    <p className="text-white text-xs">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={handleUpload}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Upload className="w-6 h-6" />
              <span className="text-xs">Dodaj zdjęcie</span>
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
