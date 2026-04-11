import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface WaitlistEntry {
  id: string;
  user_id: string;
  salon_id: string;
  service_id: string;
  staff_member_id: string | null;
  preferred_date_from: string;
  preferred_date_to: string | null;
  preferred_time_from: string | null;
  preferred_time_to: string | null;
  status: string;
  created_at: string;
  notified_at: string | null;
  expires_at: string;
}

export function useWaitlistEntries() {
  return useQuery({
    queryKey: ["client-waitlist"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("appointment_waitlist")
        .select("*, services:service_id(name, duration, price), salons:salon_id(name, theme_primary_color), staff_members:staff_member_id(name)")
        .eq("user_id", user.id)
        .in("status", ["waiting", "notified"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

interface JoinWaitlistParams {
  salonId: string;
  serviceId: string;
  staffMemberId?: string | null;
  preferredDateFrom: string;
  preferredDateTo?: string | null;
  preferredTimeFrom?: string | null;
  preferredTimeTo?: string | null;
}

export function useJoinWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: JoinWaitlistParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Musisz być zalogowana");

      const { error } = await supabase
        .from("appointment_waitlist")
        .insert({
          user_id: user.id,
          salon_id: params.salonId,
          service_id: params.serviceId,
          staff_member_id: params.staffMemberId ?? null,
          preferred_date_from: params.preferredDateFrom,
          preferred_date_to: params.preferredDateTo ?? null,
          preferred_time_from: params.preferredTimeFrom ?? null,
          preferred_time_to: params.preferredTimeTo ?? null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-waitlist"] });
      toast.success("Dodano na listę! Powiadomimy Cię gdy zwolni się termin 🔔");
    },
    onError: () => {
      toast.error("Nie udało się dołączyć do listy oczekiwania");
    },
  });
}

export function useCancelWaitlist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entryId: string) => {
      const { error } = await supabase
        .from("appointment_waitlist")
        .update({ status: "cancelled" })
        .eq("id", entryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client-waitlist"] });
      toast.success("Usunięto z listy oczekiwania");
    },
    onError: () => {
      toast.error("Nie udało się usunąć z listy");
    },
  });
}
