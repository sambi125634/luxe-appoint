// First Visit Sequence — 3-stopniowa seria po pierwszej wizycie: +6h (podziękowanie+opinia), +7 dni (pielęgnacja), +21 dni (powrót).
import {
  corsHeaders, createServiceClient, isDemoSalon, jsonResponse,
  logAction, sendSms,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let body: { salonId?: string } = {};
  try { body = await req.json(); } catch {}
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();
  if (await isDemoSalon(supabase, salonId)) return jsonResponse({ demo: true });

  const { data: salon } = await supabase.from("salons").select("name, google_review_url").eq("id", salonId).maybeSingle();

  // Find clients whose FIRST completed visit happened ~6h / ~7d / ~21d ago
  const now = Date.now();
  const stages = [
    { key: "first_thanks", offsetH: 6, windowH: 1, msg: (n: string) => `${n}, dziękujemy za dzisiejszą wizytę! Jeśli wszystko było ok, zostaw nam opinię ❤️ ${(salon as any)?.google_review_url ?? ""}`.trim() },
    { key: "first_care", offsetH: 24*7, windowH: 4, msg: (n: string) => `${n}, jak utrzymują się efekty po wizycie? Pamiętaj o domowej pielęgnacji — chętnie doradzimy. ${(salon as any)?.name ?? ""}` },
    { key: "first_return", offsetH: 24*21, windowH: 6, msg: (n: string) => `${n}, minęły 3 tygodnie od Twojej pierwszej wizyty. Czas na powrót? Mamy wolne terminy ✨` },
  ];

  let sent = 0;
  for (const stage of stages) {
    const targetTs = now - stage.offsetH * 3600 * 1000;
    const from = new Date(targetTs - stage.windowH * 3600 * 1000).toISOString();
    const to = new Date(targetTs + stage.windowH * 3600 * 1000).toISOString();

    // First visits in that window: pick appointment per client where it's the earliest completed
    const { data: appts } = await supabase.from("appointments")
      .select("client_id, start_time, clients!inner(id, first_name, phone)")
      .eq("salon_id", salonId).eq("status", "completed")
      .gte("start_time", from).lte("start_time", to);

    for (const a of appts ?? []) {
      const cl = (a as any).clients;
      if (!cl?.phone) continue;
      // verify this is the FIRST completed visit
      const { count } = await supabase.from("appointments")
        .select("id", { count: "exact", head: true })
        .eq("salon_id", salonId).eq("client_id", cl.id).eq("status", "completed")
        .lt("start_time", (a as any).start_time);
      if ((count ?? 0) > 0) continue;
      // already sent this stage?
      const { count: already } = await supabase.from("autopilot_actions")
        .select("id", { count: "exact", head: true })
        .eq("client_id", cl.id).eq("module_key", "first_visit_sequence").eq("type", stage.key);
      if ((already ?? 0) > 0) continue;

      try {
        await sendSms(supabase, { salonId, to: cl.phone, message: stage.msg(cl.first_name) });
        sent++;
        await logAction(supabase, {
          salonId, moduleKey: "first_visit_sequence", type: stage.key, channel: "sms",
          clientId: cl.id, status: "sent", payload: { stage: stage.key },
        });
      } catch (e) {
        await logAction(supabase, {
          salonId, moduleKey: "first_visit_sequence", type: stage.key, channel: "sms",
          clientId: cl.id, status: "failed", result: { error: String(e) },
        });
      }
    }
  }
  return jsonResponse({ ok: true, sent });
});