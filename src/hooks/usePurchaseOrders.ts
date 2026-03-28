import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PurchaseOrder {
  id: string;
  salon_id: string;
  supplier_id: string | null;
  order_number: string | null;
  status: string;
  ordered_at: string | null;
  delivered_at: string | null;
  total_net: number | null;
  total_gross: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  suppliers?: { name: string } | null;
}

export interface PurchaseOrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity_ordered: number;
  quantity_delivered: number;
  unit_price_net: number | null;
  vat_rate: number;
  total_net: number | null;
  notes: string | null;
  created_at: string;
}

export function usePurchaseOrders(salonId?: string) {
  const queryClient = useQueryClient();
  const queryKey = ["purchase-orders", salonId];

  const { data: orders = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchase_orders")
        .select("*, suppliers(name)")
        .eq("salon_id", salonId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as PurchaseOrder[];
    },
    enabled: !!salonId && salonId !== "demo-salon-id",
  });

  const createOrder = useMutation({
    mutationFn: async (params: {
      salon_id: string;
      supplier_id?: string | null;
      order_number?: string;
      notes?: string;
      status?: string;
      ordered_at?: string;
      total_net?: number;
      total_gross?: number;
      items: Array<{
        product_id: string | null;
        product_name: string;
        quantity_ordered: number;
        unit_price_net: number | null;
        vat_rate: number;
        total_net: number | null;
      }>;
    }) => {
      const { items, ...orderData } = params;
      const { data: order, error: orderError } = await supabase
        .from("purchase_orders")
        .insert(orderData)
        .select()
        .single();
      if (orderError) throw orderError;

      if (items.length > 0) {
        const itemsWithOrderId = items.map((item) => ({
          ...item,
          order_id: order.id,
        }));
        const { error: itemsError } = await supabase
          .from("purchase_order_items")
          .insert(itemsWithOrderId);
        if (itemsError) throw itemsError;
      }

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Zamówienie zapisane");
    },
    onError: (e: Error) => toast.error(`Błąd: ${e.message}`),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async (params: { id: string; status: string; delivered_at?: string; ordered_at?: string }) => {
      const { id, ...updates } = params;
      const { error } = await supabase
        .from("purchase_orders")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (e: Error) => toast.error(`Błąd: ${e.message}`),
  });

  const getOrderItems = async (orderId: string): Promise<PurchaseOrderItem[]> => {
    const { data, error } = await supabase
      .from("purchase_order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at");
    if (error) throw error;
    return data as PurchaseOrderItem[];
  };

  const receiveDelivery = useMutation({
    mutationFn: async (params: {
      orderId: string;
      salonId: string;
      items: Array<{
        id: string;
        product_id: string | null;
        quantity_delivered: number;
        unit_price_net: number | null;
      }>;
    }) => {
      // Update each item's quantity_delivered
      for (const item of params.items) {
        const { error: itemError } = await supabase
          .from("purchase_order_items")
          .update({ quantity_delivered: item.quantity_delivered })
          .eq("id", item.id);
        if (itemError) throw itemError;

        // Create stock movement and update product stock
        if (item.product_id && item.quantity_delivered > 0) {
          const totalValue = item.unit_price_net
            ? item.unit_price_net * item.quantity_delivered
            : null;

          const { error: mvError } = await supabase
            .from("stock_movements")
            .insert({
              salon_id: params.salonId,
              product_id: item.product_id,
              type: "delivery",
              quantity: item.quantity_delivered,
              unit_price: item.unit_price_net,
              total_value: totalValue,
              note: `Zamówienie zbiorcze`,
            });
          if (mvError) throw mvError;

          // Update product stock
          const { data: product } = await supabase
            .from("products")
            .select("current_stock")
            .eq("id", item.product_id)
            .single();

          if (product) {
            const { error: updateError } = await supabase
              .from("products")
              .update({
                current_stock: product.current_stock + item.quantity_delivered,
                updated_at: new Date().toISOString(),
              })
              .eq("id", item.product_id);
            if (updateError) throw updateError;
          }
        }
      }

      // Update order status
      const { error: orderError } = await supabase
        .from("purchase_orders")
        .update({
          status: "delivered",
          delivered_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.orderId);
      if (orderError) throw orderError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast.success("Dostawa przyjęta. Stany magazynowe zaktualizowane.");
    },
    onError: (e: Error) => toast.error(`Błąd: ${e.message}`),
  });

  return { orders, isLoading, createOrder, updateOrderStatus, getOrderItems, receiveDelivery };
}
