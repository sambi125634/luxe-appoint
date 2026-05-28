// Abandoned Booking — wykrywa rozpoczęte i nieukończone rezerwacje (booking_attempts) i przypomina SMS po 30 min.
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

  const { data: salon } = await supabase.from("salons").select("name, slug").eq("id", salonId).maybeSingle();

  const from = new Date(Date.now() - 90 * 60 * 1000).toISOString(); // last 90 min
  const upper = new Date(Date.now() - 30 * 60 * 1000).toISOString(); // >30 min ago

  const { data: attempts } = await supabase.from("booking_attempts")
    .select("id, phone, first_name, service_id, started_at, completed_at, reminded_at")
    .eq("salon_id", salonId)
    .is("completed_at", null)
    .is("reminded_at", null)
    .gte("started_at", from)
    .lte("started_at", upper);

  let sent = 0;
  for (const att of attempts ?? []) {
    if (!(att as any).phone) continue;
    const link = `https://calendar.beauty-funnels.com/s/${(salon as any)?.slug ?? salonId}`;
    const msg = `${(att as any).first_name ?? "Cześć"}, widzimy że zaczęłaś rezerwację u nas — dokończ ją tutaj: ${link} ✨ ${(salon as any)?.name ?? ""}`;
    try {
      await sendSms(supabase, { salonId, to: (att as any).phone, message: msg });
      sent++;
      await supabase.from("booking_attempts").update({ reminded_at: new Date().toISOString() }).eq("id", (att as any).id);
      await logAction(supabase, {
        salonId, moduleKey: "abandoned_booking", type: "abandoned_sms", channel: "sms",
        status: "sent", payload: { attempt_id: (att as any).id, phone: (att as any).phone },
      });
    } catch (e) {
      await logAction(supabase, {
        salonId, moduleKey: "abandoned_booking", type: "abandoned_sms", channel: "sms",
        status: "failed", result: { error: String(e) },
      });
    }
  }
  return jsonResponse({ ok: true, sent });
});