// Price Change Followup — gdy cena usługi rośnie, informuje klientki, które miały tę usługę w ostatnich 30 dniach.
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

  // services with price_changed_at in last 24h and new_price > old_price
  const since = new Date(Date.now() - 24*3600*1000).toISOString();
  const { data: changes } = await supabase.from("services")
    .select("id, name, price, previous_price, price_changed_at")
    .eq("salon_id", salonId)
    .gte("price_changed_at", since);

  let sent = 0;
  for (const s of changes ?? []) {
    const oldPrice = Number((s as any).previous_price ?? 0);
    const newPrice = Number((s as any).price);
    if (oldPrice <= 0 || newPrice <= oldPrice) continue;

    const from = new Date(Date.now() - 30*86400*1000).toISOString();
    const { data: appts } = await supabase.from("appointments")
      .select("client_id, clients!inner(id, first_name, phone)")
      .eq("salon_id", salonId).eq("service_id", (s as any).id)
      .gte("start_time", from).eq("status", "completed");

    const seen = new Set<string>();
    for (const a of appts ?? []) {
      const cl = (a as any).clients;
      if (!cl?.phone || seen.has(cl.id)) continue;
      seen.add(cl.id);
      const msg = `${cl.first_name}, informacja: cena "${(s as any).name}" zmieniła się z ${Math.round(oldPrice)} zł na ${Math.round(newPrice)} zł. Zarezerwuj jeszcze w tym tygodniu — utrzymamy starą cenę 💜`;
      try {
        await sendSms(supabase, { salonId, to: cl.phone, message: msg });
        sent++;
        await logAction(supabase, {
          salonId, moduleKey: "price_change_followup", type: "price_change_sms", channel: "sms",
          clientId: cl.id, status: "sent", payload: { service_id: (s as any).id, old: oldPrice, new: newPrice },
        });
      } catch (e) {
        await logAction(supabase, {
          salonId, moduleKey: "price_change_followup", type: "price_change_sms", channel: "sms",
          clientId: cl.id, status: "failed", result: { error: String(e) },
        });
      }
    }
  }
  return jsonResponse({ ok: true, sent });
});