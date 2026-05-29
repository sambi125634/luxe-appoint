import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const DEFAULT_FROM = "Beauty Calendar <notifications@notify.calendar.beauty-funnels.com>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function sendEmail(from: string, to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, body: text };
}

function shell(title: string, accent: string, bodyHtml: string) {
  return `
    <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <div style="background:linear-gradient(135deg,#3D2066 0%,#6B3FA0 100%);padding:30px;border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">${accent} ${title}</h1>
      </div>
      <div style="background:#faf5ff;padding:30px;border-radius:0 0 12px 12px;color:#374151;font-size:16px;line-height:1.6;">
        ${bodyHtml}
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0;">
        <p style="font-size:12px;color:#6b7280;text-align:center;margin:0;">
          Wiadomość testowa — Beauty Calendar | beautyfunnel.pl
        </p>
      </div>
    </div>`;
}

const samples: { key: string; subject: string; html: string }[] = [
  {
    key: "booking-confirmation",
    subject: "[TEST 1/6] Potwierdzenie rezerwacji — Salon Demo",
    html: shell(
      "Rezerwacja potwierdzona!",
      "✨",
      `Cześć Anna!<br><br>Twoja rezerwacja została potwierdzona.<br><br>📅 Data: poniedziałek, 2 czerwca 2026<br>⏰ Godzina: 14:30<br>💇 Usługa: Manicure hybrydowy<br>👤 Specjalista: Kasia<br>📍 Adres: ul. Piękna 12, Warszawa<br><br>Do zobaczenia!<br>Salon Demo`,
    ),
  },
  {
    key: "reminder",
    subject: "[TEST 2/6] Przypomnienie o wizycie — Salon Demo",
    html: shell(
      "Przypomnienie o wizycie",
      "⏰",
      `Cześć Anna!<br><br>Przypominamy o jutrzejszej wizycie.<br><br>📅 Data: wtorek, 3 czerwca 2026<br>⏰ Godzina: 14:30<br>💇 Usługa: Manicure hybrydowy<br>👤 Specjalista: Kasia<br>📍 Adres: ul. Piękna 12, Warszawa<br><br>Do zobaczenia!<br>Salon Demo`,
    ),
  },
  {
    key: "followup",
    subject: "[TEST 3/6] Dziękujemy za wizytę! — Salon Demo",
    html: shell(
      "Dziękujemy za wizytę!",
      "💜",
      `Cześć Anna!<br><br>Dziękujemy za wizytę w Salonie Demo!<br><br>Mamy nadzieję, że jesteś zadowolona z usługi "Manicure hybrydowy".<br><br>Będzie nam miło, jeśli umówisz się na kolejną wizytę.<br><br><div style="text-align:center;margin-top:20px;"><a href="https://calendar.beauty-funnels.com/s/demo-salon" style="display:inline-block;background:linear-gradient(135deg,#3D2066,#6B3FA0);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Umów kolejną wizytę</a></div>`,
    ),
  },
  {
    key: "staff-invitation",
    subject: "[TEST 4/6] Zaproszenie do zespołu — Salon Demo",
    html: shell(
      "Zostałaś zaproszona do zespołu",
      "👋",
      `Cześć Kasia!<br><br><strong>Anna Kowalska</strong> zaprasza Cię do zespołu salonu <strong>Salon Demo</strong>.<br><br>Twoja rola: <strong>Specjalistka</strong><br>Uprawnienia: kalendarz, klientki, własny grafik<br><br><div style="text-align:center;margin-top:20px;"><a href="https://admin.beauty-funnels.com/auth?invite=staff" style="display:inline-block;background:linear-gradient(135deg,#3D2066,#6B3FA0);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Aktywuj konto</a></div>`,
    ),
  },
  {
    key: "retention-winback",
    subject: "[TEST 5/6] Tęsknimy za Tobą — oferta powrotu",
    html: shell(
      "Tęsknimy za Tobą",
      "🌸",
      `Anna, minęło 75 dni od Twojej ostatniej wizyty.<br><br>Przygotowałyśmy specjalną ofertę powrotu — <strong>−20% na następny zabieg</strong>, ważną przez 48 godzin.<br><br><div style="text-align:center;margin-top:20px;"><a href="https://calendar.beauty-funnels.com/s/demo-salon" style="display:inline-block;background:linear-gradient(135deg,#3D2066,#6B3FA0);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Zarezerwuj z rabatem</a></div>`,
    ),
  },
  {
    key: "rhythm-reminder",
    subject: "[TEST 6/6] Czas na Twój rytm beauty ✨",
    html: shell(
      "Czas na Twój rytm beauty",
      "✨",
      `Hej Anna! Mija 28 dni od Twojego manicure hybrydowego.<br><br>To Twój zwykły rytm — wolne terminy w tym tygodniu czekają.<br><br><div style="text-align:center;margin-top:20px;"><a href="https://calendar.beauty-funnels.com/s/demo-salon" style="display:inline-block;background:linear-gradient(135deg,#3D2066,#6B3FA0);color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Zarezerwuj termin</a></div>`,
    ),
  },
];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { to, from } = await req.json();
    const FROM = from || DEFAULT_FROM;
    if (!to) throw new Error("Missing 'to'");
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set");

    const results = [];
    for (const s of samples) {
      const r = await sendEmail(FROM, to, s.subject, s.html);
      results.push({ template: s.key, ...r });
      await new Promise((r) => setTimeout(r, 300));
      console.log(`[test-email-blast] ${s.key} → ${r.status} ${r.ok ? "OK" : "FAIL"} ${r.body.slice(0, 200)}`);
    }
    return new Response(JSON.stringify({ from: FROM, to, results }, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});