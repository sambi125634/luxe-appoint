// Flash Oferta — wykrywa puste sloty w najbliższych 48h i wysyła SMS do najlepiej pasujących klientek.
import {
  corsHeaders, createServiceClient, isDemoSalon, jsonResponse,
  logAction, sendSms, withinQuietHours, getRecentActionForClient,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let body: { salonId?: string; dry_run?: boolean } = {};
  try { body = await req.json(); } catch {}
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();
  if (await isDemoSalon(supabase, salonId)) return jsonResponse({ demo: true });

  const { data: cfg } = await supabase.from("autopilot_config")
    .select("quiet_hours_start, quiet_hours_end, max_messages_per_client_days")
    .eq("salon_id", salonId).maybeSingle();
  const now = new Date();
  const local = new Date(now.getTime() + 60 * 60 * 1000);
  if (withinQuietHours(local, (cfg as any)?.quiet_hours_start, (cfg as any)?.quiet_hours_end))
    return jsonResponse({ skipped: "quiet_hours" });

  // Find next 48h appointments to estimate gaps
  const horizonStart = new Date(now.getTime() + 4 * 3600 * 1000); // earliest target = +4h
  const horizonEnd = new Date(now.getTime() + 48 * 3600 * 1000);
  const { data: appts } = await supabase.from("appointments")
    .select("start_time, end_time, status, staff_id")
    .eq("salon_id", salonId)
    .gte("start_time", horizonStart.toISOString())
    .lte("start_time", horizonEnd.toISOString())
    .neq("status", "cancelled");

  const { data: staff } = await supabase.from("staff_members")
    .select("id").eq("salon_id", salonId).eq("is_active", true);
  const staffCount = (staff ?? []).length || 1;

  // crude empty-slot detection: count appts per day; if < staffCount*3 → "dziury"
  const byDay = new Map<string, number>();
  for (const a of appts ?? []) {
    const day = (a as any).start_time.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  let emptyDays = 0;
  for (const [, n] of byDay) if (n < staffCount * 3) emptyDays++;
  // also if no appts at all
  if (byDay.size === 0) emptyDays = 2;
  if (emptyDays === 0) return jsonResponse({ skipped: "calendar_full" });

  // Target candidates: top regulars without upcoming visit
  const { data: clients } = await supabase.from("clients")
    .select("id, first_name, phone, last_visit_at")
    .eq("salon_id", salonId)
    .not("phone", "is", null)
    .order("last_visit_at", { ascending: false, nullsFirst: false })
    .limit(40);

  // exclude clients with upcoming appointments
  const { data: upcoming } = await supabase.from("appointments")
    .select("client_id")
    .eq("salon_id", salonId)
    .gte("start_time", now.toISOString())
    .neq("status", "cancelled");
  const busy = new Set((upcoming ?? []).map((u: any) => u.client_id));

  const candidates = (clients ?? []).filter((c: any) => !busy.has(c.id)).slice(0, 8);
  const sent: string[] = [];
  const failed: string[] = [];

  for (const c of candidates) {
    if (await getRecentActionForClient(supabase, (c as any).id, 7)) continue;
    const msg = `Cześć ${(c as any).first_name}! Mamy dla Ciebie ekspresowy termin w tym tygodniu — odpisz "tak" jeśli chcesz zarezerwować. Beauty Calendar`;
    if (body.dry_run) { sent.push((c as any).phone); continue; }
    try {
      await sendSms(supabase, { salonId, to: (c as any).phone, message: msg });
      sent.push((c as any).phone);
      await logAction(supabase, {
        salonId, moduleKey: "flash_offer", type: "flash_offer_sms", channel: "sms",
        clientId: (c as any).id, status: "sent",
        payload: { phone: (c as any).phone, message: msg },
      });
    } catch (e) {
      failed.push((c as any).phone);
      await logAction(supabase, {
        salonId, moduleKey: "flash_offer", type: "flash_offer_sms", channel: "sms",
        clientId: (c as any).id, status: "failed", result: { error: String(e) },
      });
    }
  }

  return jsonResponse({ ok: true, empty_days: emptyDays, sent: sent.length, failed: failed.length });
});