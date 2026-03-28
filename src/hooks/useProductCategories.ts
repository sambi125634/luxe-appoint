import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type ProductCategory = Tables<"product_categories">;
export type ProductCategoryInsert = TablesInsert<"product_categories">;
export type ProductCategoryUpdate = TablesUpdate<"product_categories">;

const DEMO_SALON_ID = "demo-salon-id";

const mockCategories: ProductCategory[] = [
  { id: "pc1", salon_id: DEMO_SALON_ID, name: "Pielęgnacja twarzy", icon: "✨", color: "#7c3aed", is_default: true, sort_order: 1, created_at: new Date().toISOString() },
  { id: "pc2", salon_id: DEMO_SALON_ID, name: "Pielęgnacja ciała", icon: "💆", color: "#ec4899", is_default: true, sort_order: 2, created_at: new Date().toISOString() },
  { id: "pc3", salon_id: DEMO_SALON_ID, name: "Włosy", icon: "💇", color: "#f59e0b", is_default: true, sort_order: 3, created_at: new Date().toISOString() },
  { id: "pc4", salon_id: DEMO_SALON_ID, name: "Paznokcie", icon: "💅", color: "#ef4444", is_default: true, sort_order: 4, created_at: new Date().toISOString() },
  { id: "pc5", salon_id: DEMO_SALON_ID, name: "Makijaż", icon: "💄", color: "#e11d48", is_default: true, sort_order: 5, created_at: new Date().toISOString() },
  { id: "pc6", salon_id: DEMO_SALON_ID, name: "Perfumy", icon: "🌸", color: "#a855f7", is_default: true, sort_order: 6, created_at: new Date().toISOString() },
  { id: "pc7", salon_id: DEMO_SALON_ID, name: "Środki dezynfekcyjne", icon: "🧴", color: "#14b8a6", is_default: true, sort_order: 7, created_at: new Date().toISOString() },
  { id: "pc8", salon_id: DEMO_SALON_ID, name: "Materiały jednorazowe", icon: "🧤", color: "#6366f1", is_default: true, sort_order: 8, created_at: new Date().toISOString() },
  { id: "pc9", salon_id: DEMO_SALON_ID, name: "Akcesoria", icon: "🔧", color: "#64748b", is_default: true, sort_order: 9, created_at: new Date().toISOString() },
  { id: "pc10", salon_id: DEMO_SALON_ID, name: "Inne", icon: "📦", color: "#7c3aed", is_default: true, sort_order: 10, created_at: new Date().toISOString() },
];

export function useProductCategories(salonId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDemo = salonId === DEMO_SALON_ID;

  const categoriesQuery = useQuery({
    queryKey: ["product_categories", salonId],
    queryFn: async () => {
      if (isDemo) return mockCategories;

      const { data, error } = await supabase
        .from("product_categories")
        .select("*")
        .eq("salon_id", salonId!)
        .order("sort_order");
      if (error) throw error;

      // If no categories exist, seed defaults
      if (data.length === 0 && salonId) {
        const { error: seedError } = await supabase.rpc("seed_default_product_categories", { p_salon_id: salonId });
        if (seedError) throw seedError;
        const { data: seeded, error: refetchError } = await supabase
          .from("product_categories")
          .select("*")
          .eq("salon_id", salonId)
          .order("sort_order");
        if (refetchError) throw refetchError;
        return seeded as ProductCategory[];
      }

      return data as ProductCategory[];
    },
    enabled: !!salonId,
  });

  const createCategory = useMutation({
    mutationFn: async (cat: ProductCategoryInsert) => {
      if (isDemo) return { ...cat, id: `demo-${Date.now()}`, created_at: new Date().toISOString() } as ProductCategory;
      const { data, error } = await supabase.from("product_categories").insert(cat).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
      toast({ title: "Kategoria dodana" });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, ...updates }: ProductCategoryUpdate & { id: string }) => {
      if (isDemo) return { id, ...updates } as ProductCategory;
      const { data, error } = await supabase.from("product_categories").update(updates).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
      toast({ title: "Kategoria zaktualizowana" });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: string) => {
      if (isDemo) return;
      const { error } = await supabase.from("product_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product_categories"] });
      toast({ title: "Kategoria usunięta" });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  return {
    categories: categoriesQuery.data ?? [],
    isLoading: categoriesQuery.isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
