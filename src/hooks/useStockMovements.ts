import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type StockMovement = Tables<"stock_movements"> & {
  products?: Tables<"products">;
  suppliers?: Tables<"suppliers">;
};
export type StockMovementInsert = TablesInsert<"stock_movements">;

export function useStockMovements(salonId?: string, type?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const movementsQuery = useQuery({
    queryKey: ["stock_movements", salonId, type],
    queryFn: async () => {
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
      // Insert the movement
      const { data: newMovement, error: movementError } = await supabase
        .from("stock_movements")
        .insert(movement)
        .select()
        .single();
      if (movementError) throw movementError;

      // Update product stock
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

      // Update product stock
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

      // Update product stock
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
