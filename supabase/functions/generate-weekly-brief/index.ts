import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { salon_id, week_start } = await req.json();
    if (!salon_id) throw new Error("salon_id is required");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, serviceKey);

    // Calculate week range
    const now = new Date();
    const ws = week_start ? new Date(week_start) : (() => {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay() - 6); // last Monday
      d.setHours(0, 0, 0, 0);
      return d;
    })();
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    we.setHours(23, 59, 59, 999);

    const weekStartStr = ws.toISOString();
    const weekEndStr = we.toISOString();
    const weekStartDate = ws.toISOString().split("T")[0];

    // Previous week
    const pws = new Date(ws);
    pws.setDate(pws.getDate() - 7);
    const pwe = new Date(we);
    pwe.setDate(pwe.getDate() - 7);

    // Get salon info
    const { data: salon } = await supabase
      .from("salons")
      .select("name, owner_id, email")
      .eq("id", salon_id)
      .single();

    if (!salon) throw new Error("Salon not found");

    // Get owner profile
    const { data: ownerProfile } = await supabase
      .from("profiles")
      .select("first_name, email")
      .eq("id", salon.owner_id)
      .single();

    // Current week appointments
    const { data: currentAppts } = await supabase
      .from("appointments")
      .select("id, status, price")
      .eq("salon_id", salon_id)
      .gte("start_time", weekStartStr)
      .lte("start_time", weekEndStr);

    // Previous week appointments
    const { data: prevAppts } = await supabase
      .from("appointments")
      .select("id, status, price")
      .eq("salon_id", salon_id)
      .gte("start_time", pws.toISOString())
      .lte("start_time", pwe.toISOString());

    // Current week revenue
    const { data: currentTx } = await supabase
      .from("transactions")
      .select("amount")
      .eq("salon_id", salon_id)
      .eq("type", "income")
      .gte("transaction_date", weekStartStr)
      .lte("transaction_date", weekEndStr);

    // Previous week revenue
    const { data: prevTx } = await supabase
      .from("transactions")
      .select("amount")
      .eq("salon_id", salon_id)
      .eq("type", "income")
      .gte("transaction_date", pws.toISOString())
      .lte("transaction_date", pwe.toISOString());

    // Autopilot actions this week
    const { data: autopilotActions } = await supabase
      .from("autopilot_actions")
      .select("type, status, ai_explanation, executed_at, metadata")
      .eq("salon_id", salon_id)
      .gte("created_at", weekStartStr)
      .lte("created_at", weekEndStr)
      .eq("status", "executed")
      .order("created_at", { ascending: false })
      .limit(10);

    // Compute stats
    const allAppts = currentAppts ?? [];
    const activeAppts = allAppts.filter(a => a.status !== "cancelled");
    const appointmentsCount = activeAppts.length;
    const noshowCount = allAppts.filter(a => a.status === "no_show").length;
    const noshowPct = appointmentsCount > 0 ? Math.round((noshowCount / appointmentsCount) * 100) : 0;

    const revenue = (currentTx ?? []).reduce((s, t) => s + Number(t.amount), 0);
    const prevRevenue = (prevTx ?? []).reduce((s, t) => s + Number(t.amount), 0);
    const prevApptsCount = (prevAppts ?? []).filter(a => a.status !== "cancelled").length;

    const revenueChangePct = prevRevenue > 0 ? Math.round(((revenue - prevRevenue) / prevRevenue) * 100) : 0;
    const appointmentsChangePct = prevApptsCount > 0 ? Math.round(((appointmentsCount - prevApptsCount) / prevApptsCount) * 100) : 0;

    // Staff count for occupancy
    const { count: staffCount } = await supabase
      .from("staff_members")
      .select("*", { count: "exact", head: true })
      .eq("salon_id", salon_id)
      .eq("is_active", true);

    const maxSlots = (staffCount ?? 1) * 8 * 6; // 8h * 6 days
    const occupancyPct = maxSlots > 0 ? Math.round((appointmentsCount / maxSlots) * 100) : 0;

    // Format autopilot actions for AI
    const autopilotSummary = (autopilotActions ?? []).map(a => ({
      type: a.type,
      explanation: a.ai_explanation,
    }));

    // Call AI for narrative
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Jesteś asystentem AI dla polskiego salonu beauty "${salon.name}". Generujesz tygodniowy brief CEO. 
Pisz po polsku, ciepło i profesjonalnie. Zwracaj się do właścicielki po imieniu: ${ownerProfile?.first_name ?? "Szefowo"}.
Używaj emoji sparingly. Bądź konkretna i akcyjna.`,
          },
          {
            role: "user",
            content: `Wygeneruj tygodniowy brief na podstawie danych:
- Wizyty: ${appointmentsCount} (zmiana: ${appointmentsChangePct}% vs poprzedni tydzień)
- Przychód: ${revenue} zł (zmiana: ${revenueChangePct}% vs poprzedni tydzień)
- Obłożenie: ${occupancyPct}%
- No-show: ${noshowCount} (${noshowPct}%)
- Akcje autopilota: ${JSON.stringify(autopilotSummary)}

Użyj narzędzia generate_brief.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_brief",
              description: "Generate the weekly brief content",
              parameters: {
                type: "object",
                properties: {
                  ai_narrative: {
                    type: "string",
                    description: "2-3 sentence summary of the week in Polish, warm tone",
                  },
                  ai_top_action: {
                    type: "object",
                    properties: {
                      title: { type: "string", description: "Action title in Polish" },
                      description: { type: "string", description: "Action description in Polish" },
                      cta_label: { type: "string", description: "CTA button label in Polish" },
                      cta_action: { type: "string", description: "Action type: flash_offer | enable_deposit | view_calendar" },
                    },
                    required: ["title", "description", "cta_label", "cta_action"],
                  },
                  ai_warning: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      description: { type: "string" },
                      severity: { type: "string", enum: ["low", "medium", "high"] },
                      cta_label: { type: "string" },
                      cta_action: { type: "string" },
                    },
                    required: ["title", "description", "severity"],
                  },
                },
                required: ["ai_narrative", "ai_top_action"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_brief" } },
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    let briefContent = { ai_narrative: "", ai_top_action: null, ai_warning: null };

    if (toolCall?.function?.arguments) {
      try {
        briefContent = JSON.parse(toolCall.function.arguments);
      } catch {
        console.error("Failed to parse AI response");
      }
    }

    // Save brief
    const briefData = {
      salon_id,
      week_start: weekStartDate,
      appointments_count: appointmentsCount,
      revenue,
      occupancy_pct: occupancyPct,
      noshow_count: noshowCount,
      noshow_pct: noshowPct,
      revenue_change_pct: revenueChangePct,
      appointments_change_pct: appointmentsChangePct,
      autopilot_actions: autopilotSummary,
      ai_narrative: briefContent.ai_narrative,
      ai_top_action: briefContent.ai_top_action,
      ai_warning: briefContent.ai_warning,
    };

    const { data: brief, error: upsertError } = await supabase
      .from("weekly_briefs")
      .upsert(briefData, { onConflict: "salon_id,week_start" })
      .select()
      .single();

    if (upsertError) throw upsertError;

    // Send email if Resend configured
    if (resendKey && ownerProfile?.email) {
      const emailHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body{margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif}
.container{max-width:480px;margin:0 auto;padding:24px 16px}
.header{text-align:center;padding:20px 0;border-bottom:1px solid #eee}
.kpi{display:flex;justify-content:space-around;padding:20px 0;text-align:center}
.kpi-item .value{font-size:28px;font-weight:700;color:#7c3aed}
.kpi-item .label{font-size:12px;color:#666;margin-top:4px}
.section{padding:16px 0;border-top:1px solid #f0f0f0}
.section h3{font-size:14px;color:#333;margin:0 0 12px}
.action-card{background:#f8f5ff;border:1px solid #e9e0ff;border-radius:12px;padding:16px;margin:12px 0}
.warning-card{background:#fff8f0;border:1px solid #ffe0b2;border-radius:12px;padding:16px;margin:12px 0}
.bullet{padding:6px 0;font-size:14px;color:#444}
.cta-btn{display:inline-block;background:#7c3aed;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
.trend-up{color:#16a34a}.trend-down{color:#dc2626}
</style></head><body>
<div class="container">
<div class="header">
<div style="font-size:20px;font-weight:700">☀️ ${salon.name}</div>
<div style="font-size:13px;color:#888;margin-top:4px">Twój tydzień: ${weekStartDate}</div>
</div>
<div class="kpi">
<div class="kpi-item"><div class="value">${appointmentsCount}</div><div class="label">wizyt</div><div class="${appointmentsChangePct >= 0 ? 'trend-up' : 'trend-down'}" style="font-size:12px">${appointmentsChangePct >= 0 ? '↑' : '↓'}${Math.abs(appointmentsChangePct)}%</div></div>
<div class="kpi-item"><div class="value">${revenue}</div><div class="label">przychód (zł)</div><div class="${revenueChangePct >= 0 ? 'trend-up' : 'trend-down'}" style="font-size:12px">${revenueChangePct >= 0 ? '↑' : '↓'}${Math.abs(revenueChangePct)}%</div></div>
<div class="kpi-item"><div class="value">${occupancyPct}%</div><div class="label">obłożenie</div></div>
</div>
${autopilotSummary.length > 0 ? `
<div class="section">
<h3>🤖 Autopilot zadziałał</h3>
${autopilotSummary.map(a => `<div class="bullet">✓ ${a.explanation}</div>`).join('')}
</div>` : ''}
${briefContent.ai_narrative ? `
<div class="section">
<h3>📊 Podsumowanie</h3>
<p style="font-size:14px;color:#444;line-height:1.6">${briefContent.ai_narrative}</p>
</div>` : ''}
${briefContent.ai_top_action ? `
<div class="action-card">
<h3 style="margin:0 0 8px">💡 ${(briefContent.ai_top_action as any).title}</h3>
<p style="font-size:13px;color:#555;margin:0 0 12px">${(briefContent.ai_top_action as any).description}</p>
</div>` : ''}
${briefContent.ai_warning ? `
<div class="warning-card">
<h3 style="margin:0 0 8px">⚠️ ${(briefContent.ai_warning as any).title}</h3>
<p style="font-size:13px;color:#555;margin:0">${(briefContent.ai_warning as any).description}</p>
</div>` : ''}
</div></body></html>`;

      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `${salon.name} <notifications@beautyfunnel.pl>`,
            to: [ownerProfile.email],
            subject: `☀️ ${salon.name} — Twój tydzień: ${weekStartDate}`,
            html: emailHtml,
          }),
        });

        await supabase
          .from("weekly_briefs")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("id", brief.id);
      } catch (emailErr) {
        console.error("Email send error:", emailErr);
      }
    }

    return new Response(JSON.stringify({ success: true, brief }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-weekly-brief error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
