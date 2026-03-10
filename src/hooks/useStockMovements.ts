import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type StockMovement = Tables<"stock_movements"> & {
  products?: Tables<"products">;
  suppliers?: Tables<"suppliers">;
};
export type StockMovementInsert = TablesInsert<"stock_movements">;

const DEMO_SALON_ID = "demo-salon-id";

const mockMovements: StockMovement[] = [
  {
    id: "sm1", salon_id: DEMO_SALON_ID, product_id: "p1", quantity: 20, type: "delivery", unit_price: 45, total_value: 900, supplier_id: "s1", invoice_number: "FV/2026/03/001", note: "Dostawa regularna", staff_id: null, transaction_id: null, expiry_date: "2027-03-01", created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    products: { id: "p1", salon_id: DEMO_SALON_ID, name: "Krem nawilżający do twarzy", brand: "L'Oréal Professionnel", category: "Pielęgnacja twarzy", sku: "KNT-001", ean: "5901234567890", variant: "50ml", description: "", sale_price_gross: 89, purchase_price_net: 45, vat_rate: 23, current_stock: 25, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s1", created_at: "", updated_at: "" },
    suppliers: { id: "s1", salon_id: DEMO_SALON_ID, name: "Beauty Cosmetics Sp. z o.o.", contact_person: "Anna Kowalska", email: "anna@beautycosmetics.pl", phone: "+48 111 222 333", address: "ul. Handlowa 5, Warszawa", payment_terms: "14 dni", discount_info: "10%", notes: null, is_active: true, created_at: "", updated_at: "" },
  },
  {
    id: "sm2", salon_id: DEMO_SALON_ID, product_id: "p3", quantity: 30, type: "delivery", unit_price: 18, total_value: 540, supplier_id: "s2", invoice_number: "FV/2026/03/002", note: "Uzupełnienie lakierów", staff_id: null, transaction_id: null, expiry_date: "2027-06-15", created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    products: { id: "p3", salon_id: DEMO_SALON_ID, name: "Lakier hybrydowy Classic Red", brand: "Semilac", category: "Manicure", sku: "LHC-001", ean: "5901234567893", variant: "7ml", description: "", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 3, min_stock: 10, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s2", created_at: "", updated_at: "" },
    suppliers: { id: "s2", salon_id: DEMO_SALON_ID, name: "NailPro Distributor", contact_person: "Marek Nowak", email: "marek@nailpro.pl", phone: "+48 444 555 666", address: "ul. Przemysłowa 22, Kraków", payment_terms: "30 dni", discount_info: "5%", notes: null, is_active: true, created_at: "", updated_at: "" },
  },
  {
    id: "sm3", salon_id: DEMO_SALON_ID, product_id: "p5", quantity: 10, type: "delivery", unit_price: 62, total_value: 620, supplier_id: "s3", invoice_number: "FV/2026/02/018", note: "Szampony Kérastase", staff_id: null, transaction_id: null, expiry_date: "2027-12-01", created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    products: { id: "p5", salon_id: DEMO_SALON_ID, name: "Szampon regenerujący", brand: "Kérastase", category: "Pielęgnacja włosów", sku: "SZR-001", ean: "5901234567896", variant: "250ml", description: "", sale_price_gross: 125, purchase_price_net: 62, vat_rate: 23, current_stock: 0, min_stock: 5, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s3", created_at: "", updated_at: "" },
    suppliers: { id: "s3", salon_id: DEMO_SALON_ID, name: "Hair Excellence", contact_person: "Katarzyna Wiśniewska", email: "k.wisniewska@hairexcellence.pl", phone: "+48 777 888 999", address: "ul. Fryzjerska 10, Poznań", payment_terms: "7 dni", discount_info: null, notes: null, is_active: true, created_at: "", updated_at: "" },
  },
  {
    id: "sm4", salon_id: DEMO_SALON_ID, product_id: "p6", quantity: -2, type: "correction", unit_price: null, total_value: null, supplier_id: null, invoice_number: null, note: "Korekta po inwentaryzacji – 2 szt. uszkodzone", staff_id: null, transaction_id: null, expiry_date: null, created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    products: { id: "p6", salon_id: DEMO_SALON_ID, name: "Olejek arganowy do włosów", brand: "Kérastase", category: "Pielęgnacja włosów", sku: "OA-003", ean: "5901234567898", variant: "100ml", description: "", sale_price_gross: 95, purchase_price_net: 48, vat_rate: 23, current_stock: 2, min_stock: 3, is_active: true, is_for_internal_use: false, image_url: null, supplier_id: "s3", created_at: "", updated_at: "" },
  },
  {
    id: "sm5", salon_id: DEMO_SALON_ID, product_id: "p12", quantity: 200, type: "delivery", unit_price: 18, total_value: 3600, supplier_id: "s1", invoice_number: "FV/2026/03/005", note: "Rękawiczki – zamówienie kwartalne", staff_id: null, transaction_id: null, expiry_date: null, created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    products: { id: "p12", salon_id: DEMO_SALON_ID, name: "Rękawiczki nitrylowe M", brand: "MedSupply", category: "Do użytku wewnętrznego", sku: "RJ-INT-001", ean: null, variant: "100 szt", description: "", sale_price_gross: 35, purchase_price_net: 18, vat_rate: 23, current_stock: 200, min_stock: 50, is_active: true, is_for_internal_use: true, image_url: null, supplier_id: "s1", created_at: "", updated_at: "" },
    suppliers: { id: "s1", salon_id: DEMO_SALON_ID, name: "Beauty Cosmetics Sp. z o.o.", contact_person: "Anna Kowalska", email: "anna@beautycosmetics.pl", phone: "+48 111 222 333", address: "ul. Handlowa 5, Warszawa", payment_terms: "14 dni", discount_info: "10%", notes: null, is_active: true, created_at: "", updated_at: "" },
  },
];

export function useStockMovements(salonId?: string, type?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isDemo = salonId === DEMO_SALON_ID;

  const movementsQuery = useQuery({
    queryKey: ["stock_movements", salonId, type],
    queryFn: async () => {
      if (isDemo) {
        let filtered = mockMovements;
        if (type) filtered = filtered.filter(m => m.type === type);
        return filtered;
      }

      let query = supabase
        .from("stock_movements")
        .select(`
          *,
          products (*),
          suppliers (*)
        `)
        .order("created_at", { ascending: false });
      
      if (salonId) {
        query = query.eq("salon_id", salonId);
      }
      
      if (type) {
        query = query.eq("type", type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as StockMovement[];
    },
    enabled: !!salonId,
  });

  const createMovement = useMutation({
    mutationFn: async (movement: StockMovementInsert) => {
      if (isDemo) {
        return { ...movement, id: `demo-${Date.now()}`, created_at: new Date().toISOString() } as unknown as Tables<"stock_movements">;
      }

      const { data: newMovement, error: movementError } = await supabase
        .from("stock_movements")
        .insert(movement)
        .select()
        .single();
      if (movementError) throw movementError;

      const { data: product, error: productFetchError } = await supabase
        .from("products")
        .select("current_stock")
        .eq("id", movement.product_id)
        .single();
      if (productFetchError) throw productFetchError;

      const newStock = (product?.current_stock || 0) + movement.quantity;
      const { error: stockError } = await supabase
        .from("products")
        .update({ current_stock: Math.max(0, newStock) })
        .eq("id", movement.product_id);
      if (stockError) throw stockError;

      return newMovement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Ruch magazynowy zapisany", description: "Stan magazynu został zaktualizowany." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const createDelivery = useMutation({
    mutationFn: async (delivery: {
      salon_id: string;
      product_id: string;
      quantity: number;
      unit_price?: number;
      supplier_id?: string;
      invoice_number?: string;
      expiry_date?: string;
      note?: string;
    }) => {
      if (isDemo) {
        return { ...delivery, id: `demo-${Date.now()}`, type: "delivery", created_at: new Date().toISOString() } as unknown as Tables<"stock_movements">;
      }

      const movement: StockMovementInsert = {
        ...delivery,
        type: "delivery",
        total_value: delivery.unit_price ? delivery.unit_price * delivery.quantity : undefined,
      };

      const { data: newMovement, error: movementError } = await supabase
        .from("stock_movements")
        .insert(movement)
        .select()
        .single();
      if (movementError) throw movementError;

      const { data: product, error: productFetchError } = await supabase
        .from("products")
        .select("current_stock")
        .eq("id", delivery.product_id)
        .single();
      if (productFetchError) throw productFetchError;

      const newStock = (product?.current_stock || 0) + delivery.quantity;
      const { error: stockError } = await supabase
        .from("products")
        .update({ current_stock: newStock })
        .eq("id", delivery.product_id);
      if (stockError) throw stockError;

      return newMovement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Dostawa przyjęta", description: "Stan magazynu został zaktualizowany." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  const createCorrection = useMutation({
    mutationFn: async (correction: {
      salon_id: string;
      product_id: string;
      quantity: number;
      note?: string;
      staff_id?: string;
    }) => {
      if (isDemo) {
        return { ...correction, id: `demo-${Date.now()}`, type: "correction", created_at: new Date().toISOString() } as unknown as Tables<"stock_movements">;
      }

      const movement: StockMovementInsert = {
        ...correction,
        type: "correction",
      };

      const { data: newMovement, error: movementError } = await supabase
        .from("stock_movements")
        .insert(movement)
        .select()
        .single();
      if (movementError) throw movementError;

      const { data: product, error: productFetchError } = await supabase
        .from("products")
        .select("current_stock")
        .eq("id", correction.product_id)
        .single();
      if (productFetchError) throw productFetchError;

      const newStock = (product?.current_stock || 0) + correction.quantity;
      const { error: stockError } = await supabase
        .from("products")
        .update({ current_stock: Math.max(0, newStock) })
        .eq("id", correction.product_id);
      if (stockError) throw stockError;

      return newMovement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Korekta zapisana", description: "Stan magazynu został zaktualizowany." });
    },
    onError: (error) => {
      toast({ title: "Błąd", description: error.message, variant: "destructive" });
    },
  });

  return {
    movements: movementsQuery.data ?? [],
    isLoading: movementsQuery.isLoading,
    error: movementsQuery.error,
    createMovement,
    createDelivery,
    createCorrection,
    refetch: movementsQuery.refetch,
  };
}
