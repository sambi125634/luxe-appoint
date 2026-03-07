import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";

export function useClients() {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["clients", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("salon_id", salonId!)
        .order("last_name");

      if (error) throw error;
      return data;
    },
    enabled: !!salonId,
  });
}

export function useCreateClient() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: {
      first_name: string;
      last_name: string;
      phone: string;
      email?: string;
      notes?: string;
      tags?: string[];
      rodo_consent: boolean;
      marketing_consent?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...client, salon_id: salonId! })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", salonId] });
    },
  });
}

export function useUpdateClient() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: {
      id: string;
      first_name?: string;
      last_name?: string;
      phone?: string;
      email?: string;
      notes?: string;
      tags?: string[];
      is_vip?: boolean;
      is_problematic?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", salonId] });
    },
  });
}

export function useDeleteClient() {
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clients")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", salonId] });
    },
  });
}
