// Pogodowy Trigger — gdy prognoza wskazuje deszcz/zimno, wysyła SMS-y zachęcające do rezerwacji.
import {
  corsHeaders, createServiceClient, isDemoSalon, jsonResponse,
  logAction, sendSms, getRecentActionForClient,
} from "../_shared/autopilot-dispatch.ts";

async function fetchWeather(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=precipitation_probability_max,temperature_2m_max,weathercode&timezone=Europe%2FWarsaw&forecast_days=3`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("weather fetch failed");
  return await r.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let body: { salonId?: string; dry_run?: boolean } = {};
  try { body = await req.json(); } catch {}
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();
  if (await isDemoSalon(supabase, salonId)) return jsonResponse({ demo: true });

  const { data: salon } = await supabase.from("salons")
    .select("name, latitude, longitude, city").eq("id", salonId).maybeSingle();
  const lat = Number((salon as any)?.latitude ?? 52.2297);
  const lon = Number((salon as any)?.longitude ?? 21.0122);

  let forecast: any;
  try { forecast = await fetchWeather(lat, lon); }
  catch (e) { return jsonResponse({ error: String(e) }, 502); }

  const days = forecast?.daily?.precipitation_probability_max ?? [];
  const rainyIdx = days.findIndex((p: number) => p >= 60);
  if (rainyIdx < 0) return jsonResponse({ skipped: "no_rain_forecast" });

  // Throttle: max 1 weather campaign per 7 days
  const since = new Date(Date.now() - 7 * 86400 * 1000).toISOString();
  const { count: recent } = await supabase.from("autopilot_actions")
    .select("id", { count: "exact", head: true })
    .eq("salon_id", salonId).eq("module_key", "weather_trigger")
    .gte("executed_at", since);
  if ((recent ?? 0) > 0) return jsonResponse({ skipped: "throttled_weekly" });

  const targetDay = forecast.daily.time[rainyIdx];
  const { data: clients } = await supabase.from("clients")
    .select("id, first_name, phone")
    .eq("salon_id", salonId)
    .not("phone", "is", null)
    .limit(40);

  const { data: upcoming } = await supabase.from("appointments")
    .select("client_id").eq("salon_id", salonId)
    .gte("start_time", new Date().toISOString()).neq("status", "cancelled");
  const busy = new Set((upcoming ?? []).map((u: any) => u.client_id));

  const targets = (clients ?? []).filter((c: any) => !busy.has(c.id)).slice(0, 35);
  let sent = 0;
  for (const c of targets) {
    if (await getRecentActionForClient(supabase, (c as any).id, 14)) continue;
    const msg = `${(c as any).first_name}, deszczowa pogoda na ${targetDay}? Idealnie na wizytę u nas ☔ Mamy wolne terminy. Odpisz "tak" — zarezerwujemy. ${(salon as any)?.name ?? "Beauty Calendar"}`;
    if (body.dry_run) { sent++; continue; }
    try {
      await sendSms(supabase, { salonId, to: (c as any).phone, message: msg });
      sent++;
      await logAction(supabase, {
        salonId, moduleKey: "weather_trigger", type: "weather_sms", channel: "sms",
        clientId: (c as any).id, status: "sent",
        payload: { phone: (c as any).phone, target_day: targetDay, rain_prob: days[rainyIdx] },
      });
    } catch (e) {
      await logAction(supabase, {
        salonId, moduleKey: "weather_trigger", type: "weather_sms", channel: "sms",
        clientId: (c as any).id, status: "failed", result: { error: String(e) },
      });
    }
  }
  return jsonResponse({ ok: true, target_day: targetDay, rain_probability: days[rainyIdx], sent });
});