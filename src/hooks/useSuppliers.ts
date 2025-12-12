import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Supplier = Tables<"suppliers">;
export type SupplierInsert = TablesInsert<"suppliers">;
export type SupplierUpdate = TablesUpdate<"suppliers">;

export function useSuppliers(salonId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", salonId],
    queryFn: async () => {
      let query = supabase
        .from("suppliers")
        .select("*")
        .order("name");
      
      if (salonId) {
        query = query.eq("salon_id", salonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Supplier[];
    },
    enabled: !!salonId,
  });

  const createSupplier = useMutation({
    mutationFn: async (supplier: SupplierInsert) => {
      const { data, error } = await supabase
        .from("suppliers")
        .insert(supplier)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Dostawca dodany", description: "Dostawca został pomyślnie dodany." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...updates }: SupplierUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Dostawca zaktualizowany", description: "Zmiany zostały zapisane." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      toast({ title: "Dostawca usunięty", description: "Dostawca został usunięty." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  return {
    suppliers: suppliersQuery.data ?? [],
    isLoading: suppliersQuery.isLoading,
    error: suppliersQuery.error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: suppliersQuery.refetch,
  };
}
