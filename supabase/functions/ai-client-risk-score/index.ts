import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RiskFactors {
  noShowRate: number;
  lateCancellationRate: number;
  visitCount: number;
  avgBookingAdvance: number;
  lastVisitDaysAgo: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, salonId } = await req.json();
    
    if (!clientId || !salonId) {
      return new Response(
        JSON.stringify({ error: "Missing clientId or salonId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch client's appointment history
    const { data: appointments, error: appError } = await supabase
      .from("appointments")
      .select("*")
      .eq("client_id", clientId)
      .eq("salon_id", salonId)
      .order("start_time", { ascending: false });

    if (appError) {
      console.error("Error fetching appointments:", appError);
      throw appError;
    }

    // Calculate risk factors
    const totalAppointments = appointments?.length || 0;
    const noShows = appointments?.filter(a => a.status === "no_show").length || 0;
    const cancelled = appointments?.filter(a => a.status === "cancelled").length || 0;
    const completed = appointments?.filter(a => a.status === "completed").length || 0;

    const noShowRate = totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0;
    const cancellationRate = totalAppointments > 0 ? (cancelled / totalAppointments) * 100 : 0;

    // Calculate days since last visit
    const lastVisit = appointments?.find(a => a.status === "completed");
    const lastVisitDaysAgo = lastVisit 
      ? Math.floor((Date.now() - new Date(lastVisit.start_time).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const factors: RiskFactors = {
      noShowRate,
      lateCancellationRate: cancellationRate,
      visitCount: completed,
      avgBookingAdvance: 3, // placeholder
      lastVisitDaysAgo
    };

    // Use AI to analyze risk if API key available
    let aiAnalysis = null;
    if (LOVABLE_API_KEY && totalAppointments >= 2) {
      try {
        const prompt = `Analyze this salon client's booking behavior and determine risk level:
- Total appointments: ${totalAppointments}
- No-shows: ${noShows} (${noShowRate.toFixed(1)}%)
- Cancellations: ${cancelled} (${cancellationRate.toFixed(1)}%)
- Completed visits: ${completed}
- Days since last visit: ${lastVisitDaysAgo}

Return JSON only with this structure:
{
  "riskScore": 0-100,
  "riskLevel": "low" | "medium" | "high",
  "mainReason": "brief explanation",
  "recommendations": ["action 1", "action 2"]
}`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are an expert at analyzing customer behavior patterns for salon businesses. Always respond with valid JSON only." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiAnalysis = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // Calculate risk score (either from AI or manual calculation)
    let riskScore: number;
    let riskLevel: "low" | "medium" | "high";
    let recommendations: string[] = [];
    let mainReason = "";

    if (aiAnalysis) {
      riskScore = aiAnalysis.riskScore;
      riskLevel = aiAnalysis.riskLevel;
      recommendations = aiAnalysis.recommendations || [];
      mainReason = aiAnalysis.mainReason;
    } else {
      // Manual calculation
      riskScore = Math.min(100, Math.round(
        noShowRate * 2.5 +
        cancellationRate * 1.5 +
        (totalAppointments < 3 ? 20 : 0) +
        (lastVisitDaysAgo > 180 ? 15 : 0)
      ));

      riskLevel = riskScore > 60 ? "high" : riskScore > 30 ? "medium" : "low";
      
      if (noShowRate > 20) {
        recommendations.push("Wymagaj potwierdzenia SMS 24h przed wizytą");
        mainReason = "Wysoki wskaźnik nieobecności";
      }
      if (riskScore > 50) {
        recommendations.push("Rozważ pobranie przedpłaty");
      }
      if (totalAppointments < 3) {
        recommendations.push("Nowy klient - zaoferuj przypomnienie");
        if (!mainReason) mainReason = "Nowy klient, brak historii";
      }
    }

    // Upsert to cache table
    const { error: upsertError } = await supabase
      .from("client_risk_scores")
      .upsert({
        client_id: clientId,
        salon_id: salonId,
        risk_score: riskScore,
        risk_level: riskLevel,
        factors,
        recommendations,
        calculated_at: new Date().toISOString()
      }, { onConflict: "client_id" });

    if (upsertError) {
      console.error("Error upserting risk score:", upsertError);
    }

    console.log(`Client Risk Score - Client: ${clientId}, Score: ${riskScore}, Level: ${riskLevel}`);

    return new Response(
      JSON.stringify({
        riskScore,
        riskLevel,
        factors,
        recommendations,
        mainReason,
        appointmentStats: { total: totalAppointments, noShows, cancelled, completed }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-client-risk-score:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
