import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { toast } from "sonner";

export interface ConsultationField {
  id: string;
  type: "text" | "textarea" | "select" | "multiselect" | "slider" | "photo" | "signature" | "medical";
  label: string;
  required?: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface ConsultationTemplate {
  id: string;
  salon_id: string;
  name: string;
  fields: ConsultationField[];
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConsultationCard {
  id: string;
  salon_id: string;
  client_id: string;
  template_id: string | null;
  responses: Record<string, unknown>;
  signature_url: string | null;
  red_flags: string[];
  status: string;
  filled_at: string | null;
  created_at: string;
}

export interface VoiceNote {
  id: string;
  salon_id: string;
  client_id: string;
  staff_id: string | null;
  appointment_id: string | null;
  audio_url: string;
  duration_seconds: number | null;
  transcript: string | null;
  ai_extracted: {
    products?: string[];
    tags?: string[];
    nextVisit?: { daysFromNow: number; service: string };
    notes?: string;
  };
  created_at: string;
}

export function useConsultationTemplates() {
  const salonId = useSalonId();
  return useQuery({
    queryKey: ["consultation-templates", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("consultation_templates")
        .select("*")
        .eq("salon_id", salonId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((t) => ({
        ...t,
        fields: (t.fields || []) as ConsultationField[],
      })) as ConsultationTemplate[];
    },
    enabled: !!salonId,
  });
}

export function useSaveTemplate() {
  const qc = useQueryClient();
  const salonId = useSalonId();
  return useMutation({
    mutationFn: async (template: { name: string; fields: ConsultationField[]; id?: string }) => {
      if (!salonId) throw new Error("Brak salon_id");
      if (template.id) {
        const { error } = await supabase
          .from("consultation_templates")
          .update({ name: template.name, fields: template.fields as unknown as Record<string, unknown>[], updated_at: new Date().toISOString() })
          .eq("id", template.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("consultation_templates")
          .insert({ salon_id: salonId, name: template.name, fields: template.fields as unknown as Record<string, unknown>[] });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultation-templates"] });
      toast.success("Szablon zapisany");
    },
    onError: () => toast.error("Błąd zapisu szablonu"),
  });
}

export function useConsultationCards(clientId?: string) {
  const salonId = useSalonId();
  return useQuery({
    queryKey: ["consultation-cards", salonId, clientId],
    queryFn: async () => {
      if (!salonId) return [];
      let q = supabase
        .from("consultation_cards")
        .select("*")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });
      if (clientId) q = q.eq("client_id", clientId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as ConsultationCard[];
    },
    enabled: !!salonId,
  });
}

export function useSaveCard() {
  const qc = useQueryClient();
  const salonId = useSalonId();
  return useMutation({
    mutationFn: async (card: {
      client_id: string;
      template_id?: string;
      responses: Record<string, unknown>;
      signature_url?: string;
      red_flags?: string[];
      status?: string;
    }) => {
      if (!salonId) throw new Error("Brak salon_id");
      const { error } = await supabase.from("consultation_cards").insert({
        salon_id: salonId,
        client_id: card.client_id,
        template_id: card.template_id || null,
        responses: card.responses,
        signature_url: card.signature_url || null,
        red_flags: card.red_flags || [],
        status: card.status || "completed",
        filled_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consultation-cards"] });
      toast.success("Karta zapisana");
    },
    onError: () => toast.error("Błąd zapisu karty"),
  });
}

export function useVoiceNotes(clientId?: string) {
  const salonId = useSalonId();
  return useQuery({
    queryKey: ["voice-notes", salonId, clientId],
    queryFn: async () => {
      if (!salonId) return [];
      let q = supabase
        .from("voice_notes")
        .select("*")
        .eq("salon_id", salonId)
        .order("created_at", { ascending: false });
      if (clientId) q = q.eq("client_id", clientId);
      const { data, error } = await q;
      if (error) throw error;
      return (data || []) as VoiceNote[];
    },
    enabled: !!salonId,
  });
}

export function useSaveVoiceNote() {
  const qc = useQueryClient();
  const salonId = useSalonId();
  return useMutation({
    mutationFn: async (note: {
      client_id: string;
      staff_id?: string;
      appointment_id?: string;
      audio_url: string;
      duration_seconds?: number;
      transcript?: string;
    }) => {
      if (!salonId) throw new Error("Brak salon_id");
      const { data, error } = await supabase
        .from("voice_notes")
        .insert({
          salon_id: salonId,
          client_id: note.client_id,
          staff_id: note.staff_id || null,
          appointment_id: note.appointment_id || null,
          audio_url: note.audio_url,
          duration_seconds: note.duration_seconds || null,
          transcript: note.transcript || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["voice-notes"] });
      toast.success("Notatka głosowa zapisana");
    },
    onError: () => toast.error("Błąd zapisu notatki"),
  });
}
