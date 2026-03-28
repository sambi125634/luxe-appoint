import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

// Demo salon ID for mock data mode
const DEMO_SALON_ID = "demo-salon-id";

// Mock products for demo mode — realistic salon cosmetics
const mockProducts: Product[] = [
  { id: "p1", salon_id: DEMO_SALON_ID, name: "Krem nawilżający do twarzy", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", sku: "KNT-001", ean: "5901234567890", variant: "50ml", description: "Intensywnie nawilżający krem na dzień", sale_price_gross: 89, purchase_price_net: 45, vat_rate: 23, current_stock: 25, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s1", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p2", salon_id: DEMO_SALON_ID, name: "Serum witaminowe C", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", sku: "SWC-002", ean: "5901234567891", variant: "30ml", description: "Rozświetlające serum z witaminą C", sale_price_gross: 149, purchase_price_net: 75, vat_rate: 23, current_stock: 15, min_stock: 3, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s1", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p3", salon_id: DEMO_SALON_ID, name: "Lakier hybrydowy Classic Red", brand: "Semilac", category: "Manicure", sku: "LHC-001", ean: "5901234567893", variant: "7ml", description: "Trwały lakier hybrydowy w intensywnej czerwieni", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 3, min_stock: 10, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s2", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p4", salon_id: DEMO_SALON_ID, name: "Baza pod lakier hybrydowy", brand: "Semilac", category: "Manicure", sku: "BLH-002", ean: "5901234567894", variant: "15ml", description: "Profesjonalna baza przedłużająca trwałość", sale_price_gross: 49, purchase_price_net: 25, vat_rate: 23, current_stock: 40, min_stock: 8, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s2", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p5", salon_id: DEMO_SALON_ID, name: "Szampon regenerujący", brand: "Kérastase", category: "Pielęgnacja włosów", sku: "SZR-001", ean: "5901234567896", variant: "250ml", description: "Głęboko regenerujący szampon do włosów zniszczonych", sale_price_gross: 125, purchase_price_net: 62, vat_rate: 23, current_stock: 0, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s3", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p6", salon_id: DEMO_SALON_ID, name: "Olejek arganowy do włosów", brand: "Kérastase", category: "Pielęgnacja włosów", sku: "OA-003", ean: "5901234567898", variant: "100ml", description: "Odżywczy olejek nadający blask", sale_price_gross: 95, purchase_price_net: 48, vat_rate: 23, current_stock: 2, min_stock: 3, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s3", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p7", salon_id: DEMO_SALON_ID, name: "Maska nawilżająca do włosów", brand: "Kérastase", category: "Pielęgnacja włosów", sku: "MNW-004", ean: "5901234567899", variant: "200ml", description: "Intensywna maska odbudowująca strukturę włosa", sale_price_gross: 159, purchase_price_net: 80, vat_rate: 23, current_stock: 8, min_stock: 4, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s3", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p8", salon_id: DEMO_SALON_ID, name: "Lakier hybrydowy Nude Beige", brand: "Semilac", category: "Manicure", sku: "LHN-003", ean: "5901234567900", variant: "7ml", description: "Delikatny odcień nude", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 12, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s2", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p9", salon_id: DEMO_SALON_ID, name: "Krem pod oczy z retinolem", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", sku: "KPO-005", ean: "5901234567901", variant: "15ml", description: "Anti-aging krem pod oczy", sale_price_gross: 119, purchase_price_net: 60, vat_rate: 23, current_stock: 6, min_stock: 3, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s1", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p10", salon_id: DEMO_SALON_ID, name: "Odżywka termoaktywna", brand: "Kérastase", category: "Pielęgnacja włosów", sku: "OT-006", ean: "5901234567902", variant: "150ml", description: "Ochrona termiczna przed suszeniem i prostownicą", sale_price_gross: 79, purchase_price_net: 40, vat_rate: 23, current_stock: 18, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s3", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p11", salon_id: DEMO_SALON_ID, name: "Top coat no-wipe", brand: "Semilac", category: "Manicure", sku: "TCN-004", ean: "5901234567903", variant: "7ml", description: "Top coat bez przemywania, super połysk", sale_price_gross: 39, purchase_price_net: 20, vat_rate: 23, current_stock: 0, min_stock: 8, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s2", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p12", salon_id: DEMO_SALON_ID, name: "Rękawiczki nitrylowe M", brand: "MedSupply", category: "Do użytku wewnętrznego", sku: "RJ-INT-001", ean: null, variant: "100 szt", description: "Rękawiczki jednorazowe do zabiegów", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 200, min_stock: 50, is_active: true, is_for_internal_use: true, image_url: null, supplier_id: "s1", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: "p13", salon_id: DEMO_SALON_ID, name: "Waciki bezpyłowe", brand: "MedSupply", category: "Do użytku wewnętrznego", sku: "WB-INT-002", ean: null, variant: "500 szt", description: "Bezpyłowe waciki celulozowe do manicure", sale_price_gross: 25, purchase_price_net: 12, vat_rate: 23, current_stock: 4, min_stock: 10, is_active: true, is_for_internal_use: true, image_url: null, supplier_id: "s2", product_category_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export function useProducts(salonId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDemo = salonId === DEMO_SALON_ID;

  const productsQuery = useQuery({
    queryKey: ["products", salonId],
    queryFn: async () => {
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
      if (isDemo) {
        return { ...product, id: `demo-${Date.now()}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Product;
      }
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
      if (isDemo) {
        return { id, ...updates } as Product;
      }
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
      if (isDemo) return;
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
      if (isDemo) {
        return { id, current_stock: quantity } as Product;
      }
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
