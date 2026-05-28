// Upsell przed wizytą — dzień przed wizytą proponuje dodatkową usługę.
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

  // Tomorrow's appointments
  const start = new Date(); start.setDate(start.getDate() + 1); start.setHours(0,0,0,0);
  const end = new Date(start); end.setHours(23,59,59,999);

  const { data: appts } = await supabase.from("appointments")
    .select(`id, start_time, client_id, service_id,
      clients!inner(id, first_name, phone),
      services!inner(id, name, category_id)`)
    .eq("salon_id", salonId)
    .gte("start_time", start.toISOString())
    .lte("start_time", end.toISOString())
    .neq("status", "cancelled");

  const { data: allServices } = await supabase.from("services")
    .select("id, name, price, category_id, duration_minutes")
    .eq("salon_id", salonId).eq("is_active", true);

  let sent = 0;
  for (const a of appts ?? []) {
    const client = (a as any).clients;
    if (!client?.phone) continue;
    if (await getRecentActionForClient(supabase, client.id, 3)) continue;

    // Pick a complementary cheap service (<100zł, <30min, different category)
    const baseCat = (a as any).services?.category_id;
    const candidate = (allServices ?? []).find((s: any) =>
      s.category_id !== baseCat && s.duration_minutes <= 30 && Number(s.price) <= 100
    );
    if (!candidate) continue;

    const msg = `${client.first_name}, jutro masz wizytę u nas — chcesz dodać "${(candidate as any).name}" (${Math.round(Number((candidate as any).price))} zł, ${(candidate as any).duration_minutes} min)? Odpisz "tak", dopiszemy do rezerwacji.`;
    try {
      await sendSms(supabase, { salonId, to: client.phone, message: msg });
      sent++;
      await logAction(supabase, {
        salonId, moduleKey: "upsell_pre_visit", type: "upsell_sms", channel: "sms",
        clientId: client.id, status: "sent",
        payload: { appointment_id: (a as any).id, suggested_service: (candidate as any).id, price: (candidate as any).price },
      });
    } catch (e) {
      await logAction(supabase, {
        salonId, moduleKey: "upsell_pre_visit", type: "upsell_sms", channel: "sms",
        clientId: client.id, status: "failed", result: { error: String(e) },
      });
    }
  }
  return jsonResponse({ ok: true, sent });
});