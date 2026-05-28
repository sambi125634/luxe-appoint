// Martwe godziny — analizuje historyczną obłożoność i wysyła brief do właścicielki + edukacyjne SMS-y.
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

  // Past 60 days appointments → heatmap by (dow, hour)
  const from = new Date(Date.now() - 60 * 86400 * 1000).toISOString();
  const { data: appts } = await supabase.from("appointments")
    .select("start_time, status").eq("salon_id", salonId).gte("start_time", from);

  const heat = new Map<string, number>();
  for (const a of appts ?? []) {
    const d = new Date((a as any).start_time);
    const k = `${d.getDay()}_${d.getHours()}`;
    heat.set(k, (heat.get(k) ?? 0) + 1);
  }

  // Build list of business-hour slots (Mon–Sat 9–19) sorted by emptiness ASC
  const dead: { dow: number; hour: number; count: number }[] = [];
  for (let dow = 1; dow <= 6; dow++) {
    for (let h = 9; h <= 19; h++) {
      dead.push({ dow, hour: h, count: heat.get(`${dow}_${h}`) ?? 0 });
    }
  }
  dead.sort((a, b) => a.count - b.count);
  const worst = dead.slice(0, 5);

  const { data: salon } = await supabase.from("salons")
    .select("name, owner_id").eq("id", salonId).maybeSingle();
  const { data: owner } = await supabase.from("profiles")
    .select("email").eq("id", (salon as any).owner_id).maybeSingle();
  const email = (owner as any)?.email;
  if (!email) return jsonResponse({ skipped: "no_owner_email" });

  const dowNames = ["Niedz", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];
  const rows = worst.map(w => `<tr><td style="padding:8px 12px;font-weight:600">${dowNames[w.dow]} ${w.hour}:00</td><td style="padding:8px 12px;color:#5A5770">${w.count} wizyt / 60 dni</td></tr>`).join("");

  const html = `<div style="font-family:'Plus Jakarta Sans',Arial;max-width:600px;margin:0 auto;background:#F5F3FA;padding:24px">
    <div style="background:linear-gradient(135deg,#3D2066,#6B3FA0);padding:32px;border-radius:16px 16px 0 0;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Beauty Autopilot · Martwe godziny</p>
      <h1 style="margin:8px 0 0;font-size:24px">Twoje 5 najsłabszych godzin</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="margin-top:20px;color:#5A5770;font-size:14px">Rozważ włączenie dla tych godzin Flash Oferty lub okazjonalnego rabatu –10%, żeby zapełnić kalendarz.</p>
    </div></div>`;

  try {
    await sendEmailQueued(supabase, {
      salonId, to: email,
      subject: "📅 Twoje martwe godziny — raport tygodniowy",
      html, templateName: "autopilot-dead-hours",
      idempotencyKey: `dead-hours-${salonId}-${new Date().toISOString().slice(0,10)}`,
    });
    await logAction(supabase, {
      salonId, moduleKey: "dead_hours", type: "dead_hours_brief", channel: "email",
      status: "sent", payload: { worst }, result: {},
    });
    return jsonResponse({ ok: true, worst });
  } catch (e) {
    return jsonResponse({ error: String(e) }, 500);
  }
});