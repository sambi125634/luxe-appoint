import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { salonId } = await req.json();
    
    if (!salonId) {
      return new Response(
        JSON.stringify({ error: "Missing salonId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointments from last 60 days
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const { data: appointments, error: appError } = await supabase
      .from("appointments")
      .select("start_time, end_time, status, service_id, price")
      .eq("salon_id", salonId)
      .gte("start_time", sixtyDaysAgo.toISOString())
      .order("start_time", { ascending: true });

    if (appError) {
      console.error("Error fetching appointments:", appError);
      throw appError;
    }

    // Get services for pricing info
    const { data: services } = await supabase
      .from("services")
      .select("id, name, price")
      .eq("salon_id", salonId)
      .eq("is_active", true);

    // Build occupancy heatmap (hour x day of week)
    const heatmap: Record<string, Record<number, { booked: number; total: number }>> = {};
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    // Initialize heatmap
    dayNames.forEach(day => {
      heatmap[day] = {};
      for (let hour = 9; hour <= 19; hour++) {
        heatmap[day][hour] = { booked: 0, total: 0 };
      }
    });

    // Count appointments per slot
    const completedOrConfirmed = (appointments || []).filter(
      a => a.status === "completed" || a.status === "confirmed" || a.status === "booked"
    );

    completedOrConfirmed.forEach(app => {
      const date = new Date(app.start_time);
      const day = dayNames[date.getDay()];
      const hour = date.getHours();
      
      if (hour >= 9 && hour <= 19 && heatmap[day][hour]) {
        heatmap[day][hour].booked++;
      }
    });

    // Calculate total possible slots per cell (based on weeks of data)
    const weeksOfData = Math.ceil((Date.now() - sixtyDaysAgo.getTime()) / (7 * 24 * 60 * 60 * 1000));
    dayNames.forEach(day => {
      for (let hour = 9; hour <= 19; hour++) {
        heatmap[day][hour].total = weeksOfData;
      }
    });

    // Calculate occupancy rates
    const occupancyRates: Record<string, Record<number, number>> = {};
    dayNames.forEach(day => {
      occupancyRates[day] = {};
      for (let hour = 9; hour <= 19; hour++) {
        const cell = heatmap[day][hour];
        occupancyRates[day][hour] = cell.total > 0 ? Math.round((cell.booked / cell.total) * 100) : 0;
      }
    });

    // Identify peak and off-peak periods
    const allRates: { day: string; hour: number; rate: number }[] = [];
    dayNames.forEach(day => {
      for (let hour = 9; hour <= 19; hour++) {
        allRates.push({ day, hour, rate: occupancyRates[day][hour] });
      }
    });

    const sortedByRate = [...allRates].sort((a, b) => b.rate - a.rate);
    const peakPeriods = sortedByRate.slice(0, 10).filter(p => p.rate > 60);
    const offPeakPeriods = sortedByRate.slice(-10).filter(p => p.rate < 30);

    // Generate pricing suggestions
    const suggestions: Array<{
      type: "increase" | "decrease" | "promo";
      period: string;
      suggestion: string;
      impact: string;
      percentage: number;
    }> = [];

    // Peak pricing suggestions
    peakPeriods.forEach(peak => {
      const dayPl = {
        monday: "poniedziałki",
        tuesday: "wtorki", 
        wednesday: "środy",
        thursday: "czwartki",
        friday: "piątki",
        saturday: "soboty",
        sunday: "niedziele"
      }[peak.day] || peak.day;

      suggestions.push({
        type: "increase",
        period: `${dayPl} ${peak.hour}:00-${peak.hour + 1}:00`,
        suggestion: `Podnieś ceny o 10-15% (obłożenie: ${peak.rate}%)`,
        impact: "Zwiększenie marży bez utraty klientów",
        percentage: 10
      });
    });

    // Off-peak promotional suggestions
    offPeakPeriods.slice(0, 5).forEach(offPeak => {
      const dayPl = {
        monday: "poniedziałki",
        tuesday: "wtorki",
        wednesday: "środy", 
        thursday: "czwartki",
        friday: "piątki",
        saturday: "soboty",
        sunday: "niedziele"
      }[offPeak.day] || offPeak.day;

      suggestions.push({
        type: "promo",
        period: `${dayPl} ${offPeak.hour}:00-${offPeak.hour + 1}:00`,
        suggestion: `Promocja -15% dla nowych klientów (obłożenie: ${offPeak.rate}%)`,
        impact: "Wypełnienie pustych terminów",
        percentage: -15
      });
    });

    // Use AI for more sophisticated analysis
    let aiSuggestions = null;
    if (LOVABLE_API_KEY && completedOrConfirmed.length >= 20) {
      try {
        const prompt = `Analyze this salon's occupancy data and suggest pricing strategy:

Peak periods (>60% occupancy):
${peakPeriods.map(p => `- ${p.day} ${p.hour}:00: ${p.rate}%`).join("\n")}

Off-peak periods (<30% occupancy):
${offPeakPeriods.map(p => `- ${p.day} ${p.hour}:00: ${p.rate}%`).join("\n")}

Total appointments analyzed: ${completedOrConfirmed.length}

Return JSON only:
{
  "strategyName": "string",
  "topRecommendation": "string",
  "estimatedRevenueIncrease": "X-Y%",
  "quickWins": ["action 1", "action 2", "action 3"]
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
              { role: "system", content: "You are a pricing strategy expert for beauty salons. Respond in Polish. Provide valid JSON only." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiSuggestions = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    const response = {
      heatmap: occupancyRates,
      peakPeriods: peakPeriods.slice(0, 5),
      offPeakPeriods: offPeakPeriods.slice(0, 5),
      suggestions: suggestions.slice(0, 6),
      aiStrategy: aiSuggestions,
      stats: {
        totalAppointments: completedOrConfirmed.length,
        avgOccupancy: Math.round(allRates.reduce((sum, r) => sum + r.rate, 0) / allRates.length),
        peakDay: sortedByRate[0]?.day || "friday",
        quietestDay: sortedByRate[sortedByRate.length - 1]?.day || "tuesday"
      },
      services: (services || []).map(s => ({
        id: s.id,
        name: s.name,
        currentPrice: s.price
      }))
    };

    console.log(`Pricing Optimizer - Salon: ${salonId}, Suggestions: ${suggestions.length}, Avg Occupancy: ${response.stats.avgOccupancy}%`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-pricing-optimizer:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
