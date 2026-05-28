// Review Guard — alarmuje właścicielkę o spadku Google rating lub negatywnej opinii.
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

  // Look at reviews table (if exists) for last 7d with rating <= 3
  const since = new Date(Date.now() - 7*86400*1000).toISOString();
  const { data: bad } = await supabase.from("reviews")
    .select("rating, comment, author_name, created_at")
    .eq("salon_id", salonId).lte("rating", 3).gte("created_at", since)
    .order("created_at", { ascending: false });

  if (!bad || bad.length === 0) return jsonResponse({ skipped: "no_bad_reviews" });

  const { data: salon } = await supabase.from("salons").select("name, owner_id").eq("id", salonId).maybeSingle();
  const { data: owner } = await supabase.from("profiles").select("email").eq("id", (salon as any).owner_id).maybeSingle();
  const email = (owner as any)?.email;
  if (!email) return jsonResponse({ skipped: "no_owner_email" });

  const rows = bad.map((r: any) => `<tr><td style="padding:8px 12px"><strong>${r.rating}★</strong> ${r.author_name ?? "Klientka"}</td><td style="padding:8px 12px;color:#5A5770">${(r.comment ?? "").slice(0,140)}</td></tr>`).join("");
  const html = `<div style="font-family:'Plus Jakarta Sans',Arial;max-width:600px;margin:0 auto;background:#F5F3FA;padding:24px">
    <div style="background:#D94F3D;padding:32px;border-radius:16px 16px 0 0;color:#fff">
      <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Beauty Autopilot · Review Guard</p>
      <h1 style="margin:8px 0 0;font-size:24px">⚠️ ${bad.length} negatywne opinie</h1>
    </div>
    <div style="background:#fff;padding:24px;border-radius:0 0 16px 16px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}</table>
      <p style="margin-top:20px;color:#5A5770;font-size:14px">Odpowiedz na nie w ciągu 24h — to ma największy wpływ na konwersję nowych klientek.</p>
    </div></div>`;

  await sendEmailQueued(supabase, {
    salonId, to: email, subject: `⚠️ Review Guard: ${bad.length} negatywnych opinii`,
    html, templateName: "autopilot-review-guard",
    idempotencyKey: `review-guard-${salonId}-${new Date().toISOString().slice(0,10)}`,
  });
  await logAction(supabase, {
    salonId, moduleKey: "review_guard", type: "review_alert", channel: "email",
    status: "sent", payload: { count: bad.length },
  });
  return jsonResponse({ ok: true, alerts: bad.length });
});