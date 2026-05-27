import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import { useToast } from "@/hooks/use-toast";

export type SequenceVariant = "default" | "ads";
export type SequenceStage =
  | "before_1"
  | "after_1"
  | "between_1_2"
  | "after_2"
  | "between_2_3"
  | "between_3_4"
  | "between_4_5"
  | "after_5";
export type SequenceChannel = "sms" | "email" | "push";

export interface PipelineSequence {
  id: string;
  salon_id: string;
  variant: SequenceVariant;
  stage: SequenceStage;
  delay_hours: number;
  channel: SequenceChannel;
  subject: string | null;
  body: string;
  is_active: boolean;
  tag_filter: string | null;
  sort_order: number;
}

export const STAGE_DEFINITIONS: Array<{
  stage: SequenceStage;
  label: string;
  description: string;
  defaultDelay: number;
  defaultBody: string;
}> = [
  { stage: "before_1", label: "Przed 1. wizytą", description: "Przypomnienie + tipy 24h wcześniej", defaultDelay: -24, defaultBody: "Cześć {first_name}! Jutro o {time} czekamy na Ciebie w {salon}. Do zobaczenia 💕" },
  { stage: "after_1", label: "Po 1. wizycie", description: "Podziękowanie + prośba o opinię (2h po)", defaultDelay: 2, defaultBody: "{first_name}, dziękujemy za wizytę! Jak Ci się podobało? Zostaw opinię: {review_link}" },
  { stage: "between_1_2", label: "Między 1 a 2", description: "Zaproszenie na drugą wizytę (14 dni)", defaultDelay: 14 * 24, defaultBody: "{first_name}, czas na kolejną pielęgnację! Zarezerwuj termin: {booking_link}" },
  { stage: "after_2", label: "Po 2. wizycie", description: "Budowanie nawyku, edukacja", defaultDelay: 24, defaultBody: "{first_name}, świetnie że wracasz! Pamiętaj o pielęgnacji domowej — szczegóły w wiadomości." },
  { stage: "between_2_3", label: "Między 2 a 3", description: "Utrwalanie cyklu", defaultDelay: 21 * 24, defaultBody: "{first_name}, Twój kolejny termin już wkrótce. Zarezerwuj: {booking_link}" },
  { stage: "between_3_4", label: "Między 3 a 4", description: "Lojalność rośnie", defaultDelay: 28 * 24, defaultBody: "{first_name}, jesteś z nami już 3 wizyty 🌟 Czas na kolejną?" },
  { stage: "between_4_5", label: "Między 4 a 5", description: "Przygotowanie do statusu stałej klientki", defaultDelay: 28 * 24, defaultBody: "{first_name}, jeszcze jedna wizyta i zostajesz w gronie VIP!" },
  { stage: "after_5", label: "Po 5. wizycie — VIP", description: "Status VIP, ekskluzywne oferty", defaultDelay: 7 * 24, defaultBody: "{first_name}, witamy w gronie VIP {salon}! Twoje korzyści: {vip_perks}" },
];

export function usePipelineSequences(variant: SequenceVariant) {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["pipeline-sequences", salonId, variant],
    enabled: !!salonId,
    queryFn: async (): Promise<PipelineSequence[]> => {
      const { data, error } = await supabase
        .from("autopilot_pipeline_sequences" as never)
        .select("*")
        .eq("salon_id", salonId!)
        .eq("variant", variant)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as PipelineSequence[];
    },
  });
}

export function useUpsertPipelineSequence() {
  const qc = useQueryClient();
  const { salonId } = useSalonId();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (seq: Partial<PipelineSequence> & { stage: SequenceStage; variant: SequenceVariant }) => {
      if (!salonId) throw new Error("No salon");
      const payload = {
        salon_id: salonId,
        variant: seq.variant,
        stage: seq.stage,
        delay_hours: seq.delay_hours ?? 24,
        channel: seq.channel ?? "sms",
        subject: seq.subject ?? null,
        body: seq.body ?? "",
        is_active: seq.is_active ?? true,
        tag_filter: seq.variant === "ads" ? (seq.tag_filter ?? "ads") : null,
        sort_order: seq.sort_order ?? 0,
        ...(seq.id ? { id: seq.id } : {}),
      };
      const { error } = await (supabase as any)
        .from("autopilot_pipeline_sequences")
        .upsert(payload, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pipeline-sequences"] });
      toast({ title: "Zapisano" });
    },
    onError: () => toast({ title: "Nie udało się zapisać", variant: "destructive" }),
  });
}
