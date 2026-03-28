import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { toast } from "sonner";

export interface ConsultationSend {
  id: string;
  salon_id: string;
  card_id: string | null;
  client_id: string | null;
  appointment_id: string | null;
  sent_at: string;
  send_method: string;
  status: string;
  completed_at: string | null;
  expires_at: string | null;
  unique_token: string;
}

export function useConsultationSends() {
  const { salonId } = useSalonId();
  return useQuery({
    queryKey: ["consultation-sends", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("consultation_sends")
        .select("*")
        .eq("salon_id", salonId)
        .order("sent_at", { ascending: false });
      if (error) throw error;
      return (data || []) as ConsultationSend[];
    },
    enabled: !!salonId,
  });
}

export function useCreateConsultationSend() {
  const qc = useQueryClient();
  const { salonId } = useSalonId();
  return useMutation({
    mutationFn: async (send: {
      card_id: string;
      client_id: string;
      appointment_id?: string;
      send_method?: string;
      expires_at?: string;
    }) => {
      if (!salonId) throw new Error("Brak salon_id");
      const { error } = await supabase.from("consultation_sends").insert({
        salon_id: salonId,
        card_id: send.card_id,
        client_id: send.client_id,
        appointment_id: send.appointment_id || null,
        send_method: send.send_method || "link",
        expires_at: send.expires_at || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultation-sends"] });
      toast.success("Karta konsultacyjna wysłana");
    },
    onError: () => toast.error("Błąd wysyłki karty"),
  });
}

export interface ServiceConsultationCard {
  id: string;
  service_id: string;
  card_id: string;
  send_timing: string;
  send_hours_before: number;
  is_required: boolean;
}

export function useServiceConsultationCards() {
  return useQuery({
    queryKey: ["service-consultation-cards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_consultation_cards")
        .select("*");
      if (error) throw error;
      return (data || []) as ServiceConsultationCard[];
    },
  });
}

export function useSaveServiceConsultationCards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignments: {
      service_id: string;
      card_id: string;
      send_timing: string;
      send_hours_before: number;
      is_required: boolean;
    }[]) => {
      // Delete all existing and re-insert
      const serviceIds = [...new Set(assignments.map(a => a.service_id))];
      for (const sid of serviceIds) {
        await supabase
          .from("service_consultation_cards")
          .delete()
          .eq("service_id", sid);
      }
      if (assignments.length > 0) {
        const { error } = await supabase
          .from("service_consultation_cards")
          .insert(assignments);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["service-consultation-cards"] });
      toast.success("Przypisania zapisane");
    },
    onError: () => toast.error("Błąd zapisu przypisań"),
  });
}
