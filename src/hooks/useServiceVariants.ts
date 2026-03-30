import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceVariant {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export function useServiceVariants(serviceId?: string) {
  return useQuery({
    queryKey: ["service-variants", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_variants" as never)
        .select("*")
        .eq("service_id", serviceId!)
        .order("sort_order");

      if (error) throw error;
      return data as unknown as ServiceVariant[];
    },
    enabled: !!serviceId,
  });
}

export function useAllServiceVariants(serviceIds: string[]) {
  return useQuery({
    queryKey: ["service-variants-all", serviceIds],
    queryFn: async () => {
      if (serviceIds.length === 0) return [];
      const { data, error } = await supabase
        .from("service_variants" as never)
        .select("*")
        .in("service_id", serviceIds)
        .order("sort_order");

      if (error) throw error;
      return data as unknown as ServiceVariant[];
    },
    enabled: serviceIds.length > 0,
  });
}

export function useSyncServiceVariants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      serviceId,
      variants,
    }: {
      serviceId: string;
      variants: Omit<ServiceVariant, "id" | "service_id" | "created_at">[];
    }) => {
      // Delete existing
      const { error: deleteError } = await supabase
        .from("service_variants" as never)
        .delete()
        .eq("service_id", serviceId);

      if (deleteError) throw deleteError;

      // Insert new
      if (variants.length > 0) {
        const rows = variants.map((v, i) => ({
          service_id: serviceId,
          name: v.name,
          description: v.description || null,
          duration: v.duration,
          price: v.price,
          is_active: v.is_active ?? true,
          sort_order: i,
        }));

        const { error: insertError } = await supabase
          .from("service_variants" as never)
          .insert(rows as never);

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-variants"] });
      queryClient.invalidateQueries({ queryKey: ["service-variants-all"] });
    },
  });
}
