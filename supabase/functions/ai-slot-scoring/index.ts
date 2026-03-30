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
    const { salonId, date, serviceId, staffId, serviceDuration } = await req.json();
    
    if (!salonId || !date) {
      return new Response(
        JSON.stringify({ error: "Missing salonId or date" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get service duration if serviceId provided but no explicit duration
    let duration = serviceDuration || 60;
    if (serviceId && !serviceDuration) {
      const { data: service } = await supabase
        .from("services")
        .select("duration")
        .eq("id", serviceId)
        .maybeSingle();
      if (service?.duration) duration = service.duration;
    }

    // Get appointments for the date
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    let query = supabase
      .from("appointments")
      .select("start_time, end_time, staff_id")
      .eq("salon_id", salonId)
      .gte("start_time", startOfDay.toISOString())
      .lte("start_time", endOfDay.toISOString())
      .neq("status", "cancelled");

    // Filter by staff if specified
    if (staffId) {
      query = query.eq("staff_id", staffId);
    }

    const { data: appointments, error: appError } = await query;

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
      const slotEnd = slotMinutes + duration;
      let score = 0;
      let reason = "";
      let type = "standard";

      // Check if slot overlaps with any booked range
      const isBlocked = bookedRanges.some(r => 
        (slotMinutes >= r.start && slotMinutes < r.end) ||
        (slotEnd > r.start && slotEnd <= r.end) ||
        (slotMinutes <= r.start && slotEnd >= r.end)
      );

      if (isBlocked) {
        slotScores[slot] = { score: -1, reason: "Zajęty", type: "blocked" };
        return;
      }

      // Gap-filling analysis
      for (let i = 0; i < bookedRanges.length; i++) {
        const current = bookedRanges[i];
        const next = bookedRanges[i + 1];

        // Slot fits perfectly after an existing appointment
        if (current.end === slotMinutes) {
          score += 40;
          reason = "Bezpośrednio po poprzedniej wizycie";
          type = "recommended";
        }

        // Slot ends right before next appointment — perfect gap fill
        if (next && slotEnd === next.start) {
          score += 40;
          reason = "Wypełnia lukę przed następną wizytą";
          type = "recommended";
        }

        // Slot fills a gap between two appointments completely
        if (next && current.end <= slotMinutes && slotEnd <= next.start) {
          const gapSize = next.start - current.end;
          if (gapSize <= duration + 30) {
            score += 60;
            reason = "Idealnie wypełnia lukę w grafiku";
            type = "recommended";
          } else if (gapSize <= duration + 60) {
            score += 30;
            reason = "Redukuje lukę w grafiku";
            type = "recommended";
          }
        }
      }

      // Back-to-back bonus: slot starts right after last appointment
      if (bookedRanges.length > 0) {
        const lastEnd = bookedRanges[bookedRanges.length - 1].end;
        if (slotMinutes === lastEnd) {
          score += 25;
          if (!reason) {
            reason = "Kontynuacja po ostatniej wizycie";
            type = "recommended";
          }
        }
      }

      // Popularity bonus for after-work slots
      if (hours >= 17 && hours <= 18) {
        score += 20;
        if (!reason) {
          reason = "Popularna pora po pracy";
          type = "popular";
        }
      }

      // Morning preference
      if (hours >= 10 && hours <= 11) {
        score += 15;
        if (!reason) {
          reason = "Optymalna pora poranna";
        }
      }

      // Penalize slots that create small unusable gaps
      if (bookedRanges.length > 0) {
        // Check if this slot would create a gap too small for any service
        const prevEnd = bookedRanges.find(r => r.end <= slotMinutes);
        if (prevEnd) {
          const gapBefore = slotMinutes - prevEnd.end;
          if (gapBefore > 0 && gapBefore < 30) {
            score -= 20;
            reason = "Tworzy małą lukę";
          }
        }
        const nextStart = bookedRanges.find(r => r.start >= slotEnd);
        if (nextStart) {
          const gapAfter = nextStart.start - slotEnd;
          if (gapAfter > 0 && gapAfter < 30) {
            score -= 20;
            reason = "Tworzy małą lukę po wizycie";
          }
        }
      }

      slotScores[slot] = { score, reason, type };
    });

    // Sort and get top recommended slots
    const sortedSlots = Object.entries(slotScores)
      .filter(([_, data]) => data.score > 0)
      .sort((a, b) => b[1].score - a[1].score);

    const recommendedSlots = sortedSlots
      .filter(([_, data]) => data.type === "recommended")
      .slice(0, 5)
      .map(([slot]) => slot);

    const popularSlots = sortedSlots
      .filter(([_, data]) => data.type === "popular")
      .slice(0, 4)
      .map(([slot]) => slot);

    console.log(`AI Slot Scoring - Salon: ${salonId}, Date: ${date}, Duration: ${duration}min, Recommended: ${recommendedSlots.length}, Popular: ${popularSlots.length}`);

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
