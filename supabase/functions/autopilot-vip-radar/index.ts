// Radar VIP — codziennie 8:00, wykrywa klientki VIP zagrożone odejściem (no_visit > 1.5x avg interval).
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

  const { data: clients } = await supabase.from("clients")
    .select("id, first_name, last_name, is_vip, last_visit_at")
    .eq("salon_id", salonId)
    .or("is_vip.eq.true,last_visit_at.not.is.null")
    .limit(500);

  const cIds = (clients ?? []).map((c: any) => c.id);
  const { data: hist } = await supabase.from("appointments")
    .select("client_id, start_time, services(price)")
    .in("client_id", cIds.length ? cIds : ["00000000-0000-0000-0000-000000000000"])
    .eq("status", "completed").order("start_time");

  const byClient = new Map<string, { dates: Date[]; ltv: number }>();
  for (const h of hist ?? []) {
    const cid = (h as any).client_id;
    const cur = byClient.get(cid) ?? { dates: [], ltv: 0 };
    cur.dates.push(new Date((h as any).start_time));
    cur.ltv += Number((h as any).services?.price ?? 0);
    byClient.set(cid, cur);
  }

  const now = Date.now();
  const atRisk: any[] = [];
  for (const c of clients ?? []) {
    const stats = byClient.get((c as any).id);
    if (!stats || stats.dates.length < 2) continue;
    const intervals: number[] = [];
    for (let i = 1; i < stats.dates.length; i++) intervals.push(stats.dates[i].getTime() - stats.dates[i-1].getTime());
    const avg = intervals.reduce((a,b)=>a+b,0)/intervals.length;
    const last = stats.dates[stats.dates.length-1].getTime();
    const since = now - last;
    const isVip = (c as any).is_vip || stats.ltv >= 1500 || stats.dates.length >= 10;
    if (isVip && since > avg * 1.5) {
      atRisk.push({ client: c, daysSince: Math.round(since/86400000), avgDays: Math.round(avg/86400000), ltv: Math.round(stats.ltv) });
    }
  }
  if (atRisk.length === 0) return jsonResponse({ skipped: "no_vip_at_risk" });

  const { data: salon } = await supabase.from("salons")
    .select("name, owner_id").eq("id", salonId).maybeSingle();
  const { data: owner } = await supabase.from("profiles")
    .select("email").eq("id", (salon as any).owner_id).maybeSingle();
  const email = (owner as any)?.email;
  if (!email) return jsonResponse({ skipped: "no_owner_email" });

  const rows = atRisk.slice(0, 10).map(r => `<tr><td style="padding:8px 12px;font-weight:600">${r.client.first_name} ${r.client.last_name}</td><td style="padding:8px 12px;color:#D94F3D">${r.daysSince} dni temu</td><td style="padding:8px 12px;color:#5A5770">${r.ltv} zł LTV</td></tr>`).join("");

  const html = `<div style="font-family:'Plus Jakarta Sans',Arial;max-width:600px;margin:0 auto;background:#F5F3FA;padding:24px">
    <div style="background:linear-gradient(135deg,#3D2066,#6B3FA0);padding:32px;border-radius:16px 16px 0 0;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Beauty Autopilot · Radar VIP</p>
      <h1 style="margin:8px 0 0;font-size:24px">${atRisk.length} VIP-ek zagrożonych odejściem</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="margin-top:20px;color:#5A5770;font-size:14px">Rozważ osobistą wiadomość lub specjalną ofertę powrotu.</p>
    </div></div>`;

  await sendEmailQueued(supabase, {
    salonId, to: email,
    subject: `🚨 Radar VIP: ${atRisk.length} klientek do odzyskania`,
    html, templateName: "autopilot-vip-radar",
    idempotencyKey: `vip-radar-${salonId}-${new Date().toISOString().slice(0,10)}`,
  });
  await logAction(supabase, {
    salonId, moduleKey: "vip_radar", type: "vip_radar_brief", channel: "email",
    status: "sent", payload: { count: atRisk.length },
  });
  return jsonResponse({ ok: true, at_risk: atRisk.length });
});