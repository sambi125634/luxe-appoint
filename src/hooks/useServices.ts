import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export function useServices() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["services", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("salon_id", salonId!)
        .order("name");

      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
}

export function useServiceCategories() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["service-categories", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .eq("salon_id", salonId!)
        .order("sort_order");

      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
}

export function useStaffServices(serviceId?: string) {
  return useQuery({
    queryKey: ["staff-services", serviceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_services")
        .select("staff_id")
        .eq("service_id", serviceId!);

      if (error) throw error;
      return data.map(ss => ss.staff_id);
    },
    enabled: !!serviceId,
  });
}

export function useCreateService() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (service: {
      name: string;
      category_id?: string;
      duration: number;
      price: number;
      description?: string;
      media?: import("@/integrations/supabase/types").Json;
      benefits?: import("@/integrations/supabase/types").Json;
      vat_rate?: number;
    }) => {
      const { data, error } = await supabase
        .from("services")
        .insert({ ...service, salon_id: salonId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", salonId] });
    },
  });
}

export function useUpdateService() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      name?: string;
      category_id?: string;
      duration?: number;
      price?: number;
      description?: string;
      media?: import("@/integrations/supabase/types").Json;
      benefits?: import("@/integrations/supabase/types").Json;
      vat_rate?: number;
    }) => {
      const { data, error } = await supabase
        .from("services")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", salonId] });
    },
  });
}

export function useDeleteService() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services", salonId] });
    },
  });
}

export function useCreateCategory() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { name: string; icon?: string }) => {
      const { data, error } = await supabase
        .from("service_categories")
        .insert({ ...category, salon_id: salonId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", salonId] });
    },
  });
}

export function useUpdateCategory() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; name?: string; icon?: string }) => {
      const { data, error } = await supabase
        .from("service_categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", salonId] });
    },
  });
}

export function useDeleteCategory() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["service-categories", salonId] });
      queryClient.invalidateQueries({ queryKey: ["services", salonId] });
    },
  });
}

export function useSyncStaffServices() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ serviceId, staffIds }: { serviceId: string; staffIds: string[] }) => {
      // Delete existing
      const { error: deleteError } = await supabase
        .from("staff_services")
        .delete()
        .eq("service_id", serviceId);

      if (deleteError) throw deleteError;

      // Insert new
      if (staffIds.length > 0) {
        const { error: insertError } = await supabase
          .from("staff_services")
          .insert(staffIds.map(staffId => ({ staff_id: staffId, service_id: serviceId })));

        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-services"] });
    },
  });
}
