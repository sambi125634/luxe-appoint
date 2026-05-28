// Shared helpers for Autopilot executors.
// Exposed: createServiceClient, isDemoSalon, logAction, sendSms, sendEmailQueued, withinQuietHours.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export function createServiceClient(): SupabaseClient {
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Demo salons should never trigger real sends. Detect via salons.is_demo or specific seed UUIDs.
export async function isDemoSalon(supabase: SupabaseClient, salonId: string): Promise<boolean> {
  const { data } = await supabase
    .from("salons")
    .select("slug")
    .eq("id", salonId)
    .maybeSingle();
  if (!data) return false;
  const slug = (data as { slug?: string }).slug ?? "";
  return slug.startsWith("demo-") || slug === "demo-salon";
}

export interface LogActionInput {
  salonId: string;
  moduleKey: string;
  type: string;
  channel: "sms" | "email" | "push" | "internal";
  clientId?: string | null;
  status: "pending" | "sent" | "skipped" | "failed";
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  ctaLabel?: string | null;
  ctaAction?: string | null;
  triggeredBy?: string;
  scheduledAt?: string;
}

export async function logAction(supabase: SupabaseClient, input: LogActionInput) {
  const now = new Date().toISOString();
  const executedAt = input.status === "sent" || input.status === "failed" || input.status === "skipped" ? now : null;
  const { data, error } = await supabase.from("autopilot_actions").insert({
    salon_id: input.salonId,
    module_key: input.moduleKey,
    type: input.type,
    triggered_by: input.triggeredBy ?? "autopilot",
    client_id: input.clientId ?? null,
    channel: input.channel,
    status: input.status,
    payload: input.payload ?? {},
    result: input.result ?? {},
    cta_label: input.ctaLabel ?? null,
    cta_action: input.ctaAction ?? null,
    scheduled_at: input.scheduledAt ?? now,
    executed_at: executedAt,
    ai_explanation: "",
  }).select("id").maybeSingle();
  if (error) console.error("[autopilot] logAction error", error);
  return data?.id ?? null;
}

export async function sendSms(supabase: SupabaseClient, opts: { salonId: string; to: string; message: string }) {
  // Reuse existing send-sms-smsapi function.
  const { data, error } = await supabase.functions.invoke("send-sms-smsapi", {
    body: { salonId: opts.salonId, to: opts.to, message: opts.message },
  });
  if (error) throw new Error(`SMS failed: ${error.message}`);
  return data;
}

export async function sendEmailQueued(
  supabase: SupabaseClient,
  opts: {
    salonId: string;
    to: string;
    subject: string;
    html: string;
    text?: string;
    templateName: string;
    idempotencyKey: string;
  },
) {
  const senderDomain = Deno.env.get("AUTOPILOT_SENDER_DOMAIN") ?? "notify.calendar.beauty-funnels.com";
  // Suppression check
  const { data: sup } = await supabase
    .from("suppressed_emails")
    .select("email")
    .eq("email", opts.to.toLowerCase())
    .maybeSingle();
  if (sup) {
    return { skipped: true, reason: "suppressed" };
  }

  const payload = {
    to: opts.to,
    from: `Beauty Calendar <noreply@${senderDomain}>`,
    subject: opts.subject,
    html: opts.html,
    text: opts.text ?? opts.html.replace(/<[^>]+>/g, ""),
    template_name: opts.templateName,
    idempotency_key: opts.idempotencyKey,
    salon_id: opts.salonId,
  };

  const { error } = await supabase.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload,
  });
  if (error) throw new Error(`enqueue_email failed: ${error.message}`);
  return { queued: true };
}

export function withinQuietHours(
  date: Date,
  start: string | null | undefined,
  end: string | null | undefined,
): boolean {
  if (!start || !end) return false;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const cur = date.getHours() * 60 + date.getMinutes();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  // overnight (e.g. 20:00 → 08:00)
  if (s > e) return cur >= s || cur < e;
  return cur >= s && cur < e;
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function getRecentActionForClient(
  supabase: SupabaseClient,
  clientId: string,
  withinDays: number,
): Promise<boolean> {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("autopilot_actions")
    .select("id", { count: "exact", head: true })
    .eq("client_id", clientId)
    .gte("executed_at", since)
    .in("status", ["sent", "executed", "completed", "converted"]);
  return (count ?? 0) > 0;
}