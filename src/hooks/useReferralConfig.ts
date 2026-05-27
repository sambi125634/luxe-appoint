import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "./useSalonId";
import { toast } from "sonner";

export interface ReferralProgramConfig {
  id: string;
  salon_id: string;
  is_active: boolean;
  activate_after_visits: number;
  referrer_reward_type: string;
  referrer_reward_value: number;
  referrer_reward_description: string;
  referee_reward_type: string;
  referee_reward_value: number;
  referee_reward_description: string;
  referral_message_template: string;
  referral_message_channel: string;
  reminder_after_days: number;
  code_validity_days: number;
  max_referrals_per_client: number | null;
  google_review_url: string | null;
  facebook_review_url: string | null;
  auto_send_review_request: boolean;
  review_request_delay_hours: number;
  review_request_channel: string;
  review_message_template: string;
  review_template_preset: string;
}

const DEMO_CONFIG: ReferralProgramConfig = {
  id: "demo",
  salon_id: "demo",
  is_active: true,
  activate_after_visits: 5,
  referrer_reward_type: "discount_pln",
  referrer_reward_value: 50,
  referrer_reward_description: "Rabat 50 zł na kolejną wizytę",
  referee_reward_type: "discount_pln",
  referee_reward_value: 30,
  referee_reward_description: "Rabat 30 zł na pierwszą wizytę",
  referral_message_template:
    "Cześć {imię}! 🌸\n\nJesteś jedną z naszych ulubionych klientek i chcemy Ci za to podziękować!\n\nStworzyłam dla Ciebie specjalny link — gdy znajoma zarezerwuje przez niego wizytę, Ty dostajesz {benefit_polecajacej}, a ona {benefit_nowej}.\n\nTwój link: {link}\n\nDziękuję za zaufanie! 💜",
  referral_message_channel: "sms",
  reminder_after_days: 14,
  code_validity_days: 90,
  max_referrals_per_client: null,
  google_review_url: "https://search.google.com/local/writereview?placeid=ChIJ...",
  facebook_review_url: null,
  auto_send_review_request: true,
  review_request_delay_hours: 2,
  review_request_channel: "sms",
  review_message_template:
    "Cześć {imię}! Dziękuję za dzisiejszą wizytę! Czy możesz poświęcić 30 sekund na opinię w Google? Bardzo mi to pomoże: {link} ❤️",
  review_template_preset: "warm",
};

export function useReferralConfig(isDemo?: boolean) {
  const { salonId } = useSalonId();

  return useQuery({
    queryKey: ["referral-config", isDemo ? "demo" : salonId],
    queryFn: async (): Promise<ReferralProgramConfig> => {
      if (isDemo) return DEMO_CONFIG;
      if (!salonId) throw new Error("No salon");

      const { data, error } = await supabase
        .from("referral_program_config" as never)
        .select("*")
        .eq("salon_id", salonId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: created, error: createErr } = await supabase
          .from("referral_program_config" as never)
          .insert({ salon_id: salonId } as never)
          .select()
          .single();
        if (createErr) throw createErr;
        return created as unknown as ReferralProgramConfig;
      }

      return data as unknown as ReferralProgramConfig;
    },
    enabled: isDemo || !!salonId,
  });
}

export function useUpdateReferralConfig(isDemo?: boolean) {
  const { salonId } = useSalonId();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<ReferralProgramConfig>) => {
      if (isDemo) return { ...DEMO_CONFIG, ...patch };
      if (!salonId) throw new Error("No salon");

      const { data, error } = await supabase
        .from("referral_program_config" as never)
        .update(patch as never)
        .eq("salon_id", salonId)
        .select()
        .single();

      if (error) throw error;
      return data as unknown as ReferralProgramConfig;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["referral-config"] });
      toast.success("Zapisano");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Nie udało się zapisać");
    },
  });
}

/** Generates a default description for a reward type+value, used for auto-fill. */
export function buildRewardDescription(
  type: string,
  value: number,
  audience: "referrer" | "referee"
): string {
  const target = audience === "referrer" ? "kolejną wizytę" : "pierwszą wizytę";
  switch (type) {
    case "discount_pln":
      return `Rabat ${value} zł na ${target}`;
    case "discount_percent":
      return `Rabat ${value}% na ${target}`;
    case "free_service":
      return "Darmowy zabieg do wyboru";
    case "points":
      return `${value} punktów lojalnościowych`;
    default:
      return "";
  }
}

/** Builds list of all auto-generated descriptions for a type, to detect manual edits. */
export function isAutoDescription(
  description: string,
  type: string,
  audience: "referrer" | "referee"
): boolean {
  if (!description) return true;
  // Check against any reasonable auto-generated for current type
  for (let v = 1; v <= 500; v++) {
    if (description === buildRewardDescription(type, v, audience)) return true;
  }
  // Also accept across all types
  for (const t of ["discount_pln", "discount_percent", "free_service", "points"]) {
    for (let v = 1; v <= 500; v++) {
      if (description === buildRewardDescription(t, v, audience)) return true;
    }
  }
  return false;
}