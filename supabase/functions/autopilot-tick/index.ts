// Master orchestrator. Runs every 15 min via pg_cron.
// Iterates active salons and decides which module executors to fire based on local hour.

import { createServiceClient, corsHeaders, jsonResponse } from "../_shared/autopilot-dispatch.ts";

interface ModuleSchedule {
  key: string;
  configFlag: string;
  functionName: string;
  // run window expressed as cron-like predicates evaluated in salon-local time (assumed Europe/Warsaw for now)
  shouldRun: (now: Date) => boolean;
}

const MODULES: ModuleSchedule[] = [
  {
    key: "vip_tomorrow",
    configFlag: "vip_tomorrow_enabled",
    functionName: "autopilot-vip-tomorrow",
    shouldRun: (n) => n.getHours() === 19 && n.getMinutes() < 30,
  },
  {
    key: "smart_reminder",
    configFlag: "smart_reminder_enabled",
    functionName: "autopilot-smart-reminder",
    // Fire every tick; executor itself filters appointments by reminder window.
    shouldRun: () => true,
  },
  {
    key: "noshow_recovery",
    configFlag: "noshow_recovery_enabled",
    functionName: "autopilot-noshow-recovery",
    shouldRun: () => true, // every 15min via tick
  },
];

// Phase 2-4 modules
MODULES.push(
  { key: "flash_offer", configFlag: "flash_offer_enabled", functionName: "autopilot-flash-offer",
    shouldRun: (n) => n.getHours() >= 15 && n.getHours() < 19 && n.getMinutes() < 15 },
  { key: "weather_trigger", configFlag: "weather_trigger_enabled", functionName: "autopilot-weather-trigger",
    shouldRun: (n) => n.getHours() === 7 && n.getMinutes() < 30 },
  { key: "dead_hours", configFlag: "dead_hours_enabled", functionName: "autopilot-dead-hours",
    shouldRun: (n) => n.getDay() === 1 && n.getHours() === 9 && n.getMinutes() < 30 },
  { key: "upsell_pre_visit", configFlag: "upsell_pre_visit_enabled", functionName: "autopilot-upsell-pre-visit",
    shouldRun: (n) => n.getHours() === 19 && n.getMinutes() < 30 },
  { key: "vip_radar", configFlag: "vip_radar_enabled", functionName: "autopilot-vip-radar",
    shouldRun: (n) => n.getHours() === 8 && n.getMinutes() < 30 },
  { key: "silent_ambassador", configFlag: "silent_ambassador_enabled", functionName: "autopilot-silent-ambassador",
    shouldRun: (n) => n.getDay() === 0 && n.getHours() === 11 && n.getMinutes() < 30 },
  { key: "snowball_referral", configFlag: "snowball_referral_enabled", functionName: "autopilot-snowball-referral",
    shouldRun: (n) => n.getHours() === 18 && n.getMinutes() < 30 },
  { key: "first_visit_sequence", configFlag: "first_visit_sequence_enabled", functionName: "autopilot-first-visit-sequence",
    shouldRun: () => true },
  { key: "loyalty_engine", configFlag: "loyalty_engine_enabled", functionName: "autopilot-loyalty-engine",
    shouldRun: () => true },
  { key: "review_guard", configFlag: "review_guard_enabled", functionName: "autopilot-review-guard",
    shouldRun: (n) => n.getHours() === 10 && n.getMinutes() < 30 },
  { key: "price_change_followup", configFlag: "price_change_followup_enabled", functionName: "autopilot-price-change-followup",
    shouldRun: (n) => n.getHours() === 12 && n.getMinutes() < 30 },
  { key: "profit_alarm", configFlag: "profit_alarm_enabled", functionName: "autopilot-profit-alarm",
    shouldRun: (n) => n.getDay() === 1 && n.getHours() === 9 && n.getMinutes() < 30 },
  { key: "abandoned_booking", configFlag: "abandoned_booking_enabled", functionName: "autopilot-abandoned-booking",
    shouldRun: () => true },
);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createServiceClient();

  const { data: configs, error } = await supabase
    .from("autopilot_config")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error("[tick] fetch configs error", error);
    return jsonResponse({ error: error.message }, 500);
  }

  // Use server time (UTC); shift to Europe/Warsaw (UTC+1/+2). Approximate as UTC+1.
  const nowUtc = new Date();
  const localNow = new Date(nowUtc.getTime() + 60 * 60 * 1000);

  const dispatches: Array<{ salon_id: string; module: string; status: string; error?: string }> = [];

  for (const cfg of configs ?? []) {
    const salonId = (cfg as Record<string, unknown>).salon_id as string;
    const pausedUntil = (cfg as Record<string, unknown>).paused_until as string | null;
    if (pausedUntil && new Date(pausedUntil) > nowUtc) continue;

    for (const m of MODULES) {
      const enabled = (cfg as Record<string, unknown>)[m.configFlag] === true;
      if (!enabled) continue;
      if (!m.shouldRun(localNow)) continue;

      try {
        const { error: invokeErr } = await supabase.functions.invoke(m.functionName, {
          body: { salonId },
        });
        if (invokeErr) {
          dispatches.push({ salon_id: salonId, module: m.key, status: "error", error: invokeErr.message });
        } else {
          dispatches.push({ salon_id: salonId, module: m.key, status: "dispatched" });
        }
      } catch (e) {
        dispatches.push({ salon_id: salonId, module: m.key, status: "error", error: String(e) });
      }
    }
  }

  console.log("[autopilot-tick] dispatches:", JSON.stringify(dispatches));
  return jsonResponse({ ok: true, count: dispatches.length, dispatches });
});