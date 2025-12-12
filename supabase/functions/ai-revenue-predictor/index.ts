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

    // Get transactions from last 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("amount, transaction_date, type")
      .eq("salon_id", salonId)
      .eq("type", "income")
      .gte("transaction_date", ninetyDaysAgo.toISOString())
      .order("transaction_date", { ascending: true });

    if (txError) {
      console.error("Error fetching transactions:", txError);
      throw txError;
    }

    // Get upcoming appointments
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const { data: upcomingAppointments, error: appError } = await supabase
      .from("appointments")
      .select("start_time, price, status")
      .eq("salon_id", salonId)
      .gte("start_time", today.toISOString())
      .lte("start_time", sevenDaysLater.toISOString())
      .neq("status", "cancelled");

    if (appError) {
      console.error("Error fetching appointments:", appError);
    }

    // Calculate historical averages by day of week
    const dailyAverages: Record<number, number[]> = { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    
    (transactions || []).forEach(tx => {
      const date = new Date(tx.transaction_date);
      const dayOfWeek = date.getDay();
      dailyAverages[dayOfWeek].push(tx.amount);
    });

    const avgByDayOfWeek: Record<number, number> = {};
    Object.entries(dailyAverages).forEach(([day, amounts]) => {
      avgByDayOfWeek[Number(day)] = amounts.length > 0 
        ? amounts.reduce((a, b) => a + b, 0) / amounts.length 
        : 0;
    });

    // Calculate predictions
    const todayDayOfWeek = today.getDay();
    
    // Today's prediction
    const todayPrediction = avgByDayOfWeek[todayDayOfWeek] || 0;
    
    // This week prediction (sum of averages for remaining days)
    let weekPrediction = 0;
    for (let i = 0; i < 7; i++) {
      const futureDay = new Date();
      futureDay.setDate(today.getDate() + i);
      weekPrediction += avgByDayOfWeek[futureDay.getDay()] || 0;
    }

    // Adjust with confirmed appointments
    const confirmedRevenue = (upcomingAppointments || [])
      .filter(a => a.status === "confirmed" || a.status === "booked")
      .reduce((sum, a) => sum + (a.price || 0), 0);

    // This month prediction
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - today.getDate();
    let monthPrediction = 0;
    for (let i = 0; i <= remainingDays; i++) {
      const futureDay = new Date();
      futureDay.setDate(today.getDate() + i);
      monthPrediction += avgByDayOfWeek[futureDay.getDay()] || 0;
    }

    // Calculate trends
    const lastMonthTransactions = (transactions || []).filter(tx => {
      const date = new Date(tx.transaction_date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= thirtyDaysAgo;
    });

    const previousMonthTransactions = (transactions || []).filter(tx => {
      const date = new Date(tx.transaction_date);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });

    const lastMonthTotal = lastMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const previousMonthTotal = previousMonthTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const trendPercentage = previousMonthTotal > 0 
      ? ((lastMonthTotal - previousMonthTotal) / previousMonthTotal) * 100 
      : 0;

    // Use AI for more sophisticated analysis if available
    let aiInsights = null;
    if (LOVABLE_API_KEY && transactions && transactions.length >= 10) {
      try {
        const weeklyData = [];
        for (let i = 0; i < 12; i++) {
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
          const weekEnd = new Date();
          weekEnd.setDate(weekEnd.getDate() - i * 7);
          
          const weekRevenue = transactions
            .filter(tx => {
              const date = new Date(tx.transaction_date);
              return date >= weekStart && date < weekEnd;
            })
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          weeklyData.push(weekRevenue);
        }

        const prompt = `Analyze this salon's revenue data and provide predictions:
Weekly revenues (last 12 weeks, most recent first): ${weeklyData.join(", ")} PLN
Current trend: ${trendPercentage > 0 ? "+" : ""}${trendPercentage.toFixed(1)}%
Upcoming confirmed bookings value: ${confirmedRevenue} PLN

Return JSON only:
{
  "weeklyGrowthRate": number,
  "confidenceLevel": "low" | "medium" | "high",
  "insights": ["insight 1", "insight 2"],
  "seasonalFactor": number (1.0 = normal),
  "bestDays": ["Monday", "Friday"]
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
              { role: "system", content: "You are a business analytics expert for beauty salons. Respond with valid JSON only." },
              { role: "user", content: prompt }
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const content = aiData.choices?.[0]?.message?.content || "";
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            aiInsights = JSON.parse(jsonMatch[0]);
          }
        }
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
      }
    }

    // Apply AI seasonal factor if available
    const seasonalFactor = aiInsights?.seasonalFactor || 1.0;
    
    const response = {
      predictions: {
        today: Math.round(todayPrediction * seasonalFactor),
        thisWeek: Math.round(weekPrediction * seasonalFactor),
        thisMonth: Math.round(monthPrediction * seasonalFactor),
        confirmedBookings: confirmedRevenue
      },
      trends: {
        monthOverMonth: Math.round(trendPercentage * 10) / 10,
        direction: trendPercentage > 5 ? "up" : trendPercentage < -5 ? "down" : "stable"
      },
      confidence: aiInsights?.confidenceLevel || (transactions && transactions.length >= 30 ? "high" : transactions && transactions.length >= 10 ? "medium" : "low"),
      insights: aiInsights?.insights || [],
      bestDays: aiInsights?.bestDays || [],
      dataPoints: transactions?.length || 0
    };

    console.log(`Revenue Prediction - Salon: ${salonId}, Week: ${response.predictions.thisWeek}, Confidence: ${response.confidence}`);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-revenue-predictor:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
