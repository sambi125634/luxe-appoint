import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Supplier = Tables<"suppliers">;
export type SupplierInsert = TablesInsert<"suppliers">;
export type SupplierUpdate = TablesUpdate<"suppliers">;

// Demo salon ID for mock data mode
const DEMO_SALON_ID = "demo-salon-id";

// Mock suppliers for demo mode
const mockSuppliers: Supplier[] = [
  { id: "s1", salon_id: DEMO_SALON_ID, name: "Beauty Cosmetics Sp. z o.o.", contact_person: "Anna Kowalska", email: "anna@beautycosmetics.pl", phone: "+48 111 222 333", address: "ul. Handlowa 5, Warszawa", payment_terms: "14 dni", discount_info: "10% przy zamówieniach powyżej 1000 zł", notes: "Główny dostawca kosmetyków profesjonalnych", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "s2", salon_id: DEMO_SALON_ID, name: "NailPro Distributor", contact_person: "Marek Nowak", email: "marek@nailpro.pl", phone: "+48 444 555 666", address: "ul. Przemysłowa 22, Kraków", payment_terms: "30 dni", discount_info: "5% stały rabat", notes: "Specjalista w produktach do manicure", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "s3", salon_id: DEMO_SALON_ID, name: "Hair Excellence", contact_person: "Katarzyna Wiśniewska", email: "k.wisniewska@hairexcellence.pl", phone: "+48 777 888 999", address: "ul. Fryzjerska 10, Poznań", payment_terms: "7 dni", discount_info: null, notes: "Produkty do pielęgnacji włosów", is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export function useSuppliers(salonId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDemo = salonId === DEMO_SALON_ID;

  const suppliersQuery = useQuery({
    queryKey: ["suppliers", salonId],
    queryFn: async () => {
      // Return mock data for demo mode
      if (isDemo) {
        return mockSuppliers;
      }

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
