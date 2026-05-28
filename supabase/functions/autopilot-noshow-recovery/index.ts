// No-show Recovery — wykrywa wizyty przeterminowane bez statusu completed/cancelled,
// oznacza je no_show i wysyła SMS empatyczny + ofertę powrotu.

import {
  corsHeaders,
  createServiceClient,
  getRecentActionForClient,
  isDemoSalon,
  jsonResponse,
  logAction,
  sendSms,
  withinQuietHours,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: { salonId?: string; dry_run?: boolean } = {};
  try { body = await req.json(); } catch { /* */ }
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();

  if (await isDemoSalon(supabase, salonId)) {
    return jsonResponse({ demo: true });
  }

  const { data: cfg } = await supabase
    .from("autopilot_config")
    .select("noshow_followup_minutes, quiet_hours_start, quiet_hours_end")
    .eq("salon_id", salonId)
    .maybeSingle();

  const delayMin = ((cfg as { noshow_followup_minutes?: number } | null)?.noshow_followup_minutes) ?? 30;

  // Window: appointments that started ≥ delayMin minutes ago but ≤ 4h ago, still "scheduled/confirmed"
  const upper = new Date(Date.now() - delayMin * 60 * 1000).toISOString();
  const lower = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

  const { data: candidates } = await supabase
    .from("appointments")
    .select(`
      id, start_time, status, client_id, salon_id, service_id,
      clients!inner(id, first_name, phone),
      services!inner(name, price),
      salons!inner(name)
    `)
    .eq("salon_id", salonId)
    .gte("start_time", lower)
    .lte("start_time", upper)
    .in("status", ["scheduled", "confirmed"]);

  const list = candidates ?? [];
  if (list.length === 0) return jsonResponse({ processed: 0 });

  const localNow = new Date(Date.now() + 60 * 60 * 1000);
  if (withinQuietHours(localNow, (cfg as Record<string,string>|null)?.quiet_hours_start, (cfg as Record<string,string>|null)?.quiet_hours_end)) {
    return jsonResponse({ skipped: "quiet_hours", count: list.length });
  }

  let sent = 0, skipped = 0, failed = 0;

  for (const a of list) {
    const apt = a as Record<string, unknown>;
    const client = apt.clients as { id: string; first_name: string; phone: string };
    const service = apt.services as { name: string; price: number };
    const salonName = (apt.salons as { name: string }).name;

    // Mark as no_show
    await supabase.from("appointments").update({ status: "no_show" }).eq("id", apt.id as string);

    // Dedup: skip if client got an autopilot SMS in last 24h
    if (await getRecentActionForClient(supabase, client.id, 1)) {
      skipped++;
      await logAction(supabase, {
        salonId,
        moduleKey: "noshow_recovery",
        type: "noshow_followup",
        channel: "sms",
        clientId: client.id,
        status: "skipped",
        result: { reason: "recent_action_24h" },
      });
      continue;
    }

    if (!client.phone) {
      skipped++;
      continue;
    }

    const message = `Cześć ${client.first_name}! 🤍 Zauważyłyśmy, że nie udało Ci się dotrzeć dziś na ${service.name}. Czy wszystko OK? Daj znać, kiedy chciałabyś przełożyć — chętnie znajdziemy dla Ciebie nowy termin. ${salonName}`;

    if (body.dry_run) {
      sent++;
      continue;
    }

    try {
      await sendSms(supabase, { salonId, to: client.phone, message });
      await logAction(supabase, {
        salonId,
        moduleKey: "noshow_recovery",
        type: "noshow_followup",
        channel: "sms",
        clientId: client.id,
        status: "sent",
        payload: { to: client.phone, message, appointment_id: apt.id, lost_value: service.price },
        ctaLabel: "Przełóż wizytę",
        ctaAction: `/book?salon=${salonId}`,
      });
      sent++;
    } catch (e) {
      failed++;
      await logAction(supabase, {
        salonId,
        moduleKey: "noshow_recovery",
        type: "noshow_followup",
        channel: "sms",
        clientId: client.id,
        status: "failed",
        result: { error: String(e) },
      });
    }
  }

  return jsonResponse({ processed: list.length, sent, skipped, failed });
});