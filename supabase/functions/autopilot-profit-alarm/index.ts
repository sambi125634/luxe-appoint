// Alarm zysku — wykrywa spadek przychodu >25% w stosunku do średniej z 8 tygodni i alarmuje właścicielkę.
import {
  corsHeaders, createServiceClient, isDemoSalon, jsonResponse,
  logAction, sendEmailQueued,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  let body: { salonId?: string } = {};
  try { body = await req.json(); } catch {}
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();
  if (await isDemoSalon(supabase, salonId)) return jsonResponse({ demo: true });

  const now = new Date();
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  const baselineFrom = new Date(now); baselineFrom.setDate(now.getDate() - 63);

  const { data: appts } = await supabase.from("appointments")
    .select("start_time, services(price)")
    .eq("salon_id", salonId).eq("status", "completed")
    .gte("start_time", baselineFrom.toISOString());

  let lastWeek = 0; let baseline = 0; let baselineCount = 0;
  for (const a of appts ?? []) {
    const t = new Date((a as any).start_time);
    const p = Number((a as any).services?.price ?? 0);
    if (t >= weekStart) lastWeek += p;
    else { baseline += p; baselineCount++; }
  }
  const avgWeek = baselineCount > 0 ? (baseline / 8) : 0;
  if (avgWeek === 0) return jsonResponse({ skipped: "no_baseline" });
  const drop = (avgWeek - lastWeek) / avgWeek;
  if (drop < 0.25) return jsonResponse({ ok: true, drop, no_alarm: true });

  const { data: salon } = await supabase.from("salons").select("name, owner_id").eq("id", salonId).maybeSingle();
  const { data: owner } = await supabase.from("profiles").select("email").eq("id", (salon as any).owner_id).maybeSingle();
  const email = (owner as any)?.email;
  if (!email) return jsonResponse({ skipped: "no_owner_email" });

  const html = `<div style="font-family:'Plus Jakarta Sans',Arial;max-width:600px;margin:0 auto;background:#F5F3FA;padding:24px">
    <div style="background:#D94F3D;padding:32px;border-radius:16px 16px 0 0;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Beauty Autopilot · Alarm zysku</p>
      <h1 style="margin:8px 0 0;font-size:24px">⚠️ Spadek przychodu ${Math.round(drop*100)}%</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px">
      <p style="font-size:16px;color:#1E1B2E">Ostatni tydzień: <strong>${Math.round(lastWeek)} zł</strong></p>
      <p style="font-size:16px;color:#1E1B2E">Średnia 8 tygodni: <strong>${Math.round(avgWeek)} zł</strong></p>
      <p style="margin-top:20px;color:#5A5770">Włącz Flash Ofertę lub Pogodowy Trigger, aby zapełnić kalendarz w tym tygodniu.</p>
    </div></div>`;

  await sendEmailQueued(supabase, {
    salonId, to: email, subject: `🚨 Alarm zysku: −${Math.round(drop*100)}%`,
    html, templateName: "autopilot-profit-alarm",
    idempotencyKey: `profit-alarm-${salonId}-${now.toISOString().slice(0,10)}`,
  });
  await logAction(supabase, {
    salonId, moduleKey: "profit_alarm", type: "profit_alarm", channel: "email",
    status: "sent", payload: { drop_pct: Math.round(drop*100), last_week: lastWeek, avg_week: avgWeek },
  });
  return jsonResponse({ ok: true, drop, last_week: lastWeek, avg_week: avgWeek });
});