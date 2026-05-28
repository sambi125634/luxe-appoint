// Loyalty Engine — automatycznie nalicza pieczątki (1 punkt = 10 zł) i informuje o nagrodach.
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

  // Completed appointments in last 24h not yet credited
  const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const { data: appts } = await supabase.from("appointments")
    .select(`id, client_id, services(price),
      clients!inner(id, first_name, phone, email)`)
    .eq("salon_id", salonId).eq("status", "completed")
    .gte("updated_at", since);

  let credited = 0;
  for (const a of appts ?? []) {
    const cl = (a as any).clients;
    if (!cl) continue;
    const price = Number((a as any).services?.price ?? 0);
    const points = Math.floor(price / 10);
    if (points <= 0) continue;

    // already credited?
    const { count: dup } = await supabase.from("loyalty_stamps")
      .select("id", { count: "exact", head: true })
      .eq("client_id", cl.id).eq("reason", `Wizyta #${(a as any).id}`);
    if ((dup ?? 0) > 0) continue;

    // get user_id from client_salon_links via email
    const { data: profile } = await supabase.from("profiles")
      .select("id").eq("email", cl.email ?? "").maybeSingle();
    const userId = (profile as any)?.id;
    if (!userId) continue;

    await supabase.from("loyalty_stamps").insert({
      user_id: userId, client_id: cl.id, salon_id: salonId,
      points, reason: `Wizyta #${(a as any).id}`,
    });
    credited++;

    if (cl.phone && points >= 10) {
      const msg = `${cl.first_name}, dopisaliśmy +${points} pkt do Twojej karty lojalnościowej 💜 Zbierz 100 pkt = 10 zł rabatu.`;
      try {
        await sendSms(supabase, { salonId, to: cl.phone, message: msg });
        await logAction(supabase, {
          salonId, moduleKey: "loyalty_engine", type: "loyalty_credit", channel: "sms",
          clientId: cl.id, status: "sent", payload: { points },
        });
      } catch {/* silent */}
    }
  }
  return jsonResponse({ ok: true, credited });
});