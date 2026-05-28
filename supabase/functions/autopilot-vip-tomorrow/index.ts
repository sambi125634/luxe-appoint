// VIP na jutro — codzienny brief 19:00 dla właścicielki o jutrzejszych klientkach VIP.

import {
  corsHeaders,
  createServiceClient,
  isDemoSalon,
  jsonResponse,
  logAction,
  sendEmailQueued,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: { salonId?: string; dry_run?: boolean } = {};
  try { body = await req.json(); } catch { /* GET ok */ }
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();

  if (await isDemoSalon(supabase, salonId)) {
    return jsonResponse({ demo: true, message: "Skipped for demo salon" });
  }

  // Fetch tomorrow's appointments + owner email
  const tomorrowStart = new Date();
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);
  tomorrowStart.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrowStart);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const { data: salon } = await supabase
    .from("salons")
    .select("id, name, owner_id")
    .eq("id", salonId)
    .maybeSingle();
  if (!salon) return jsonResponse({ error: "salon not found" }, 404);

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("email, first_name")
    .eq("id", (salon as { owner_id: string }).owner_id)
    .maybeSingle();

  const ownerEmail = (ownerProfile as { email?: string } | null)?.email;
  if (!ownerEmail) {
    return jsonResponse({ skipped: "no_owner_email" });
  }

  const { data: appointments } = await supabase
    .from("appointments")
    .select(`
      id, start_time, status,
      clients!inner(id, first_name, last_name, is_vip, last_visit_at, notes),
      services!inner(name, price),
      staff_members(name)
    `)
    .eq("salon_id", salonId)
    .gte("start_time", tomorrowStart.toISOString())
    .lte("start_time", tomorrowEnd.toISOString())
    .neq("status", "cancelled")
    .order("start_time");

  const apps = appointments ?? [];
  if (apps.length === 0) {
    return jsonResponse({ skipped: "no_appointments_tomorrow" });
  }

  // Enrich: lifetime visits & spend per client
  const clientIds = Array.from(new Set(apps.map((a: Record<string, unknown>) => (a.clients as { id: string }).id)));
  const { data: history } = await supabase
    .from("appointments")
    .select("client_id, services(price)")
    .in("client_id", clientIds)
    .eq("status", "completed");

  const stats = new Map<string, { visits: number; ltv: number }>();
  for (const h of history ?? []) {
    const cid = (h as { client_id: string }).client_id;
    const price = Number(((h as { services?: { price?: number } | null }).services?.price) ?? 0);
    const cur = stats.get(cid) ?? { visits: 0, ltv: 0 };
    cur.visits++;
    cur.ltv += price;
    stats.set(cid, cur);
  }

  const rows = apps.map((a: Record<string, unknown>) => {
    const client = a.clients as { id: string; first_name: string; last_name: string; is_vip: boolean; last_visit_at: string | null };
    const service = a.services as { name: string; price: number };
    const staff = a.staff_members as { name: string } | null;
    const time = new Date(a.start_time as string).toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
    const st = stats.get(client.id) ?? { visits: 0, ltv: 0 };
    return { client, service, staff, time, ...st };
  });

  // Mark VIPs (is_vip OR ltv>=1500 OR visits>=10) and rank
  const ranked = rows
    .map((r) => ({
      ...r,
      isVip: r.client.is_vip || r.ltv >= 1500 || r.visits >= 10,
    }))
    .sort((a, b) => Number(b.isVip) - Number(a.isVip) || b.ltv - a.ltv);

  const top = ranked.slice(0, 5);

  const itemsHtml = top
    .map((r) => `
      <tr>
        <td style="padding:8px 12px;font-weight:600;color:#3D2066">${r.time}</td>
        <td style="padding:8px 12px">${r.client.first_name} ${r.client.last_name}${r.isVip ? ' <span style="background:#fef3c7;color:#92400e;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:600">VIP</span>' : ''}</td>
        <td style="padding:8px 12px;color:#5A5770">${r.service.name}</td>
        <td style="padding:8px 12px;color:#5A5770;text-align:right">${r.visits} wiz. · ${Math.round(r.ltv)} zł</td>
      </tr>`)
    .join("");

  const html = `
  <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#F5F3FA;padding:24px">
    <div style="background:linear-gradient(135deg,#3D2066,#6B3FA0);padding:32px;border-radius:16px 16px 0 0;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Beauty Autopilot · VIP na jutro</p>
      <h1 style="margin:8px 0 0;font-size:28px;font-weight:700">Twoje TOP klientki jutro</h1>
      <p style="margin:8px 0 0;opacity:0.9">${apps.length} wizyt zaplanowanych · ${top.filter(r=>r.isVip).length} VIP-ek do specjalnej obsługi</p>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        ${itemsHtml}
      </table>
      <p style="margin-top:24px;color:#9896A8;font-size:12px">Wygenerowano automatycznie przez Beauty Autopilot · ${(salon as {name:string}).name}</p>
    </div>
  </div>`;

  const idempotencyKey = `vip-tomorrow-${salonId}-${tomorrowStart.toISOString().split("T")[0]}`;

  if (body.dry_run) {
    return jsonResponse({ dry_run: true, recipient: ownerEmail, count: top.length, idempotencyKey });
  }

  try {
    await sendEmailQueued(supabase, {
      salonId,
      to: ownerEmail,
      subject: `⭐ VIP na jutro — ${top.length} klientek do specjalnej obsługi`,
      html,
      templateName: "autopilot-vip-tomorrow",
      idempotencyKey,
    });
    await logAction(supabase, {
      salonId,
      moduleKey: "vip_tomorrow",
      type: "vip_tomorrow_brief",
      channel: "email",
      status: "sent",
      payload: { recipient: ownerEmail, top_count: top.length, total: apps.length },
      result: { vip_count: top.filter((r) => r.isVip).length },
    });
    return jsonResponse({ ok: true, sent_to: ownerEmail, top: top.length });
  } catch (e) {
    await logAction(supabase, {
      salonId,
      moduleKey: "vip_tomorrow",
      type: "vip_tomorrow_brief",
      channel: "email",
      status: "failed",
      result: { error: String(e) },
    });
    return jsonResponse({ error: String(e) }, 500);
  }
});