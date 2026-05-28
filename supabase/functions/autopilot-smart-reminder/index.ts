// Smart Reminder — spersonalizowane przypomnienia 24h i 2h przed wizytą,
// używając kolejki maili Lovable Cloud + SMS przez SMSAPI.
// Personalizacja: ostatnia usługa, notatki klienta (uczulenia, preferencje).

import {
  corsHeaders,
  createServiceClient,
  isDemoSalon,
  jsonResponse,
  logAction,
  sendEmailQueued,
  sendSms,
} from "../_shared/autopilot-dispatch.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: { salonId?: string; dry_run?: boolean } = {};
  try { body = await req.json(); } catch { /* */ }
  const salonId = body.salonId;
  if (!salonId) return jsonResponse({ error: "salonId required" }, 400);

  const supabase = createServiceClient();
  if (await isDemoSalon(supabase, salonId)) return jsonResponse({ demo: true });

  const { data: cfg } = await supabase
    .from("autopilot_config")
    .select("reminder_hours_before")
    .eq("salon_id", salonId)
    .maybeSingle();

  const hoursList: number[] = ((cfg as { reminder_hours_before?: number[] } | null)?.reminder_hours_before) ?? [24, 2];

  let totalSent = 0;

  for (const hoursBefore of hoursList) {
    const target = new Date(Date.now() + hoursBefore * 60 * 60 * 1000);
    // ±10min window so we don't miss with 15min cron
    const lo = new Date(target.getTime() - 10 * 60 * 1000).toISOString();
    const hi = new Date(target.getTime() + 10 * 60 * 1000).toISOString();

    const { data: appts } = await supabase
      .from("appointments")
      .select(`
        id, start_time, status,
        clients!inner(id, first_name, last_name, email, phone, notes),
        services!inner(name, price, duration),
        staff_members(name),
        salons!inner(name, address, phone)
      `)
      .eq("salon_id", salonId)
      .gte("start_time", lo)
      .lte("start_time", hi)
      .in("status", ["scheduled", "confirmed"]);

    for (const a of appts ?? []) {
      const apt = a as Record<string, unknown>;
      const client = apt.clients as { id: string; first_name: string; email?: string; phone?: string; notes?: string };
      const service = apt.services as { name: string; price: number; duration: number };
      const staff = apt.staff_members as { name: string } | null;
      const salon = apt.salons as { name: string; address?: string; phone?: string };

      // Find last completed visit for this client to enrich
      const { data: last } = await supabase
        .from("appointments")
        .select("services(name)")
        .eq("client_id", client.id)
        .eq("status", "completed")
        .lt("start_time", apt.start_time as string)
        .order("start_time", { ascending: false })
        .limit(1)
        .maybeSingle();

      const lastService = (last as { services?: { name: string } } | null)?.services?.name;
      const startDate = new Date(apt.start_time as string);
      const fmtDate = startDate.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
      const fmtTime = startDate.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });

      const notesHint = client.notes
        ? `Pamiętamy: ${client.notes.slice(0, 80)}${client.notes.length > 80 ? "…" : ""}\n\n`
        : "";
      const lastHint = lastService ? `Ostatnio u nas: ${lastService}. ` : "";

      const intro = hoursBefore >= 12
        ? `Cześć ${client.first_name}! Przypominamy o jutrzejszej wizycie 💜`
        : `Cześć ${client.first_name}! Widzimy się za chwilę — ${fmtTime} ⏰`;

      const smsMessage =
        `${intro}\n${service.name} · ${fmtDate} ${fmtTime}` +
        (staff ? ` · ${staff.name}` : "") +
        `\n${lastHint}Adres: ${salon.address ?? salon.name}`;

      const html = `
      <div style="font-family:'Plus Jakarta Sans',Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff">
        <div style="background:linear-gradient(135deg,#3D2066,#6B3FA0);padding:32px;color:#fff;text-align:center">
          <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;opacity:0.8">Przypomnienie o wizycie</p>
          <h1 style="margin:8px 0 0;font-size:24px;font-weight:700">${intro}</h1>
        </div>
        <div style="padding:32px">
          <p style="font-size:18px;color:#1E1B2E;margin:0"><strong>${service.name}</strong></p>
          <p style="color:#5A5770;margin:4px 0 0">${fmtDate} · ${fmtTime}${staff ? ` · ${staff.name}` : ""}</p>
          ${lastService ? `<p style="margin-top:24px;color:#5A5770">Pamiętamy że ostatnio u nas: <strong>${lastService}</strong>. Już szykujemy wszystko.</p>` : ""}
          ${notesHint ? `<div style="background:#F5F3FA;border-radius:12px;padding:16px;margin-top:16px;color:#5A5770;font-size:14px">${notesHint}</div>` : ""}
          <div style="margin-top:32px;padding:16px;background:#F5F3FA;border-radius:12px;color:#5A5770;font-size:14px">📍 ${salon.address ?? salon.name}${salon.phone ? `<br>📞 ${salon.phone}` : ""}</div>
        </div>
      </div>`;

      // Idempotency: per appointment + hours-before slot
      const idemKey = `reminder-${apt.id}-${hoursBefore}h`;
      const { data: existing } = await supabase
        .from("autopilot_actions")
        .select("id")
        .eq("salon_id", salonId)
        .eq("module_key", "smart_reminder")
        .contains("payload", { idempotency_key: idemKey } as Record<string, unknown>)
        .maybeSingle();
      if (existing) continue;

      if (body.dry_run) { totalSent++; continue; }

      let channel: "sms" | "email" = "sms";
      try {
        if (client.phone) {
          await sendSms(supabase, { salonId, to: client.phone, message: smsMessage });
          channel = "sms";
        } else if (client.email) {
          await sendEmailQueued(supabase, {
            salonId, to: client.email,
            subject: `Przypomnienie o wizycie — ${fmtDate}`,
            html, templateName: "autopilot-smart-reminder", idempotencyKey: idemKey,
          });
          channel = "email";
        } else {
          continue;
        }
        await logAction(supabase, {
          salonId,
          moduleKey: "smart_reminder",
          type: `reminder_${hoursBefore}h`,
          channel,
          clientId: client.id,
          status: "sent",
          payload: { idempotency_key: idemKey, appointment_id: apt.id, hours_before: hoursBefore },
        });
        totalSent++;
      } catch (e) {
        await logAction(supabase, {
          salonId,
          moduleKey: "smart_reminder",
          type: `reminder_${hoursBefore}h`,
          channel,
          clientId: client.id,
          status: "failed",
          payload: { idempotency_key: idemKey, appointment_id: apt.id },
          result: { error: String(e) },
        });
      }
    }
  }

  return jsonResponse({ sent: totalSent });
});