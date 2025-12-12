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
    const { salonId, date, serviceId, staffId } = await req.json();
    
    if (!salonId || !date) {
      return new Response(
        JSON.stringify({ error: "Missing salonId or date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const { data: appointments, error: appError } = await supabase
      .from("appointments")
      .select("start_time, end_time, staff_id")
      .eq("salon_id", salonId)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .neq("status", "cancelled");

    if (appError) {
      console.error("Error fetching appointments:", appError);
      throw appError;
    }

    // Generate all possible time slots
    const allSlots: string[] = [];
    for (let hour = 9; hour <= 19; hour++) {
      allSlots.push(`${hour.toString().padStart(2, "0")}:00`);
      if (hour < 19) {
        allSlots.push(`${hour.toString().padStart(2, "0")}:30`);
      }
    }

    // Calculate gap scores for each slot
    const slotScores: Record<string, { score: number; reason: string; type: string }> = {};
    
    // Convert appointments to time ranges
    const bookedRanges = (appointments || []).map(app => ({
      start: new Date(app.start_time).getHours() * 60 + new Date(app.start_time).getMinutes(),
      end: new Date(app.end_time).getHours() * 60 + new Date(app.end_time).getMinutes()
    })).sort((a, b) => a.start - b.start);

    allSlots.forEach(slot => {
      const [hours, mins] = slot.split(":").map(Number);
      const slotMinutes = hours * 60 + mins;
      let score = 0;
      let reason = "";
      let type = "standard";

      // Check if slot fills a gap
      for (let i = 0; i < bookedRanges.length; i++) {
        const current = bookedRanges[i];
        const next = bookedRanges[i + 1];

        // Check if slot is right after an existing appointment
        if (current.end === slotMinutes) {
          score += 40;
          reason = "Fills gap after previous appointment";
          type = "recommended";
        }

        // Check if slot is right before an existing appointment
        if (next && slotMinutes + 60 === next.start) {
          score += 40;
          reason = "Fills gap before next appointment";
          type = "recommended";
        }

        // Check if slot would fill a small gap between appointments
        if (next && current.end <= slotMinutes && slotMinutes + 60 <= next.start) {
          const gapSize = next.start - current.end;
          if (gapSize <= 90) {
            score += 50;
            reason = "Perfect gap filler";
            type = "recommended";
          }
        }
      }

      // Popularity bonus for after-work slots
      if (hours >= 17 && hours <= 18) {
        score += 20;
        if (!reason) {
          reason = "Popular after-work time";
          type = "popular";
        }
      }

      // Morning preference for some services
      if (hours >= 10 && hours <= 11) {
        score += 15;
        if (!reason) {
          reason = "Optimal morning slot";
        }
      }

      slotScores[slot] = { score, reason, type };
    });

    // Sort and get top recommended slots
    const sortedSlots = Object.entries(slotScores)
      .sort((a, b) => b[1].score - a[1].score)
      .slice(0, 5)
      .filter(([_, data]) => data.score > 0);

    const recommendedSlots = sortedSlots
      .filter(([_, data]) => data.type === "recommended")
      .map(([slot]) => slot);

    const popularSlots = sortedSlots
      .filter(([_, data]) => data.type === "popular")
      .map(([slot]) => slot);

    console.log(`AI Slot Scoring - Salon: ${salonId}, Date: ${date}, Recommended: ${recommendedSlots.length}, Popular: ${popularSlots.length}`);

    return new Response(
      JSON.stringify({
        recommendedSlots,
        popularSlots,
        allScores: slotScores,
        appointmentCount: appointments?.length || 0
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in ai-slot-scoring:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
