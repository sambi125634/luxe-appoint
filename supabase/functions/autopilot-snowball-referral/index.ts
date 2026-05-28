// Kula Śnieżna — po 3. wizycie wysyła SMS z linkiem polecającym.
import {
  corsHeaders, createServiceClient, isDemoSalon, jsonResponse,
  logAction, sendSms, getRecentActionForClient,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let body: { salonId?: string } = {};
  try { body = await req.json(); } catch {}
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();
  if (await isDemoSalon(supabase, salonId)) return jsonResponse({ demo: true });

  const { data: salon } = await supabase.from("salons").select("name, slug").eq("id", salonId).maybeSingle();

  // Clients with exactly 3 completed visits (just crossed threshold)
  const { data: completed } = await supabase.from("appointments")
    .select("client_id, clients!inner(id, first_name, phone)")
    .eq("salon_id", salonId).eq("status", "completed");

  const counts = new Map<string, { c: any; n: number }>();
  for (const a of completed ?? []) {
    const cl = (a as any).clients;
    if (!cl?.phone) continue;
    const cur = counts.get(cl.id) ?? { c: cl, n: 0 };
    cur.n++;
    counts.set(cl.id, cur);
  }

  const eligible = [...counts.values()].filter(v => v.n >= 3).slice(0, 20);
  let sent = 0;
  for (const { c } of eligible) {
    if (await getRecentActionForClient(supabase, c.id, 60)) continue;
    const link = `https://calendar.beauty-funnels.com/s/${(salon as any)?.slug ?? salonId}?ref=${c.id.slice(0,8)}`;
    const msg = `${c.first_name}, polecasz nas znajomej? Dasz jej 10% rabatu, my Tobie 50 pkt lojalnościowych 💜 ${link}`;
    try {
      await sendSms(supabase, { salonId, to: c.phone, message: msg });
      sent++;
      await logAction(supabase, {
        salonId, moduleKey: "snowball_referral", type: "referral_sms", channel: "sms",
        clientId: c.id, status: "sent", payload: { link },
      });
    } catch (e) {
      await logAction(supabase, {
        salonId, moduleKey: "snowball_referral", type: "referral_sms", channel: "sms",
        clientId: c.id, status: "failed", result: { error: String(e) },
      });
    }
  }
  return jsonResponse({ ok: true, sent });
});