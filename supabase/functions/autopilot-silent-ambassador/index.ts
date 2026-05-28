// Cichy Ambasador — niedziele 11:00, prosi zadowolonych stałych klientów o opinię Google.
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

  const { data: salon } = await supabase.from("salons")
    .select("name, google_review_url").eq("id", salonId).maybeSingle();
  const reviewUrl = (salon as any)?.google_review_url;
  if (!reviewUrl) return jsonResponse({ skipped: "no_google_review_url" });

  // Clients with 3+ completed visits & no review request in last 90 days
  const { data: completed } = await supabase.from("appointments")
    .select("client_id, clients!inner(id, first_name, phone)")
    .eq("salon_id", salonId).eq("status", "completed");

  const counts = new Map<string, { c: any; n: number }>();
  for (const a of completed ?? []) {
    const cl = (a as any).clients;
    if (!cl?.phone) continue;
    const cur = counts.get(cl.id) ?? { c: cl, n: 0 };
    cur.n++;
    counts.set(cl.id, cur);
  }

  const ambassadors = [...counts.values()].filter(v => v.n >= 3).slice(0, 10);
  let sent = 0;
  for (const { c } of ambassadors) {
    if (await getRecentActionForClient(supabase, c.id, 90)) continue;
    const msg = `${c.first_name}, dziękujemy że jesteś z nami! Jeśli podoba Ci się nasza praca — zostawisz krótką opinię? ${reviewUrl} ❤️ ${(salon as any)?.name ?? ""}`;
    try {
      await sendSms(supabase, { salonId, to: c.phone, message: msg });
      sent++;
      await logAction(supabase, {
        salonId, moduleKey: "silent_ambassador", type: "review_request", channel: "sms",
        clientId: c.id, status: "sent", payload: { url: reviewUrl },
      });
    } catch (e) {
      await logAction(supabase, {
        salonId, moduleKey: "silent_ambassador", type: "review_request", channel: "sms",
        clientId: c.id, status: "failed", result: { error: String(e) },
      });
    }
  }
  return jsonResponse({ ok: true, sent });
});