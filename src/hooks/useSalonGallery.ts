import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type GalleryCategory = "portfolio" | "salon" | "team" | "before_after";

export interface GalleryImage {
  id: string;
  salon_id: string;
  image_url: string;
  caption: string | null;
  category: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export function useSalonGallery(salonId: string | undefined, category?: GalleryCategory | null) {
  return useQuery({
    queryKey: ["salon-gallery", salonId, category],
    queryFn: async () => {
      if (!salonId) return [];
      let query = supabase
        .from("salon_gallery")
        .select("*")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as GalleryImage[];
    },
    enabled: !!salonId,
  });
}
