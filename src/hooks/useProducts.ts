import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

// Demo salon ID for mock data mode
const DEMO_SALON_ID = "demo-salon-id";

// Mock products for demo mode
const mockProducts: Product[] = [
  { id: "1", salon_id: DEMO_SALON_ID, name: "Krem nawilżający do twarzy", brand: "Lorealle", category: "Pielęgnacja twarzy", sku: "KNT-001", ean: "5901234567890", variant: "50ml", description: "Intensywnie nawilżający krem na dzień", sale_price_gross: 89, purchase_price_net: 45, vat_rate: 23, current_stock: 25, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "2", salon_id: DEMO_SALON_ID, name: "Serum witaminowe C", brand: "Lorealle", category: "Pielęgnacja twarzy", sku: "SWC-002", ean: "5901234567891", variant: "30ml", description: "Rozświetlające serum z witaminą C", sale_price_gross: 149, purchase_price_net: 75, vat_rate: 23, current_stock: 15, min_stock: 3, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "3", salon_id: DEMO_SALON_ID, name: "Lakier hybrydowy czerwony", brand: "NailArt", category: "Manicure", sku: "LHC-001", ean: "5901234567893", variant: "Classic Red", description: "Trwały lakier hybrydowy", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 3, min_stock: 10, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "4", salon_id: DEMO_SALON_ID, name: "Baza pod lakier hybrydowy", brand: "NailArt", category: "Manicure", sku: "BLH-002", ean: "5901234567894", variant: "15ml", description: "Profesjonalna baza przedłużająca trwałość", sale_price_gross: 49, purchase_price_net: 25, vat_rate: 23, current_stock: 40, min_stock: 8, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "5", salon_id: DEMO_SALON_ID, name: "Szampon regenerujący", brand: "HairCare Pro", category: "Pielęgnacja włosów", sku: "SZR-001", ean: "5901234567896", variant: "250ml", description: "Głęboko regenerujący szampon", sale_price_gross: 65, purchase_price_net: 32, vat_rate: 23, current_stock: 0, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "6", salon_id: DEMO_SALON_ID, name: "Olejek arganowy", brand: "HairCare Pro", category: "Pielęgnacja włosów", sku: "OA-003", ean: "5901234567898", variant: "100ml", description: "Odżywczy olejek do włosów", sale_price_gross: 95, purchase_price_net: 48, vat_rate: 23, current_stock: 2, min_stock: 3, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "7", salon_id: DEMO_SALON_ID, name: "Rękawiczki jednorazowe", brand: "MedSupply", category: "Do użytku wewnętrznego", sku: "RJ-INT-001", ean: null, variant: "Rozmiar M, 100 szt", description: "Rękawiczki nitrylowe do zabiegów", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 200, min_stock: 50, is_active: true, is_for_internal_use: true, image_url: null, supplier_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export function useProducts(salonId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDemo = salonId === DEMO_SALON_ID;

  const productsQuery = useQuery({
    queryKey: ["products", salonId],
    queryFn: async () => {
      // Return mock data for demo mode
      if (isDemo) {
        return mockProducts;
      }

      let query = supabase
        .from("products")
        .select("*")
        .order("name");
      
      if (salonId) {
        query = query.eq("salon_id", salonId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Product[];
    },
    enabled: !!salonId,
  });

  const createProduct = useMutation({
    mutationFn: async (product: ProductInsert) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produkt dodany", description: "Produkt został pomyślnie dodany." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: ProductUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produkt zaktualizowany", description: "Zmiany zostały zapisane." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Produkt usunięty", description: "Produkt został usunięty z katalogu." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const updateStock = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from("products")
        .update({ current_stock: quantity })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    error: productsQuery.error,
    createProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refetch: productsQuery.refetch,
  };
}
