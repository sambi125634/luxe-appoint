import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Calculating beauty rhythms...");

    // Call the database function
    const { data: patterns, error } = await supabase.rpc("calculate_visit_patterns");

    if (error) {
      console.error("Error calculating patterns:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${patterns?.length ?? 0} visit patterns`);

    let upserted = 0;

    for (const pattern of patterns ?? []) {
      if (!pattern.user_id || !pattern.salon_id || !pattern.service_id) continue;

      // next_reminder_date = last_visit + avg_interval - 3 days (remind early)
      const lastVisit = new Date(pattern.last_visit);
      const reminderDate = new Date(lastVisit);
      reminderDate.setDate(reminderDate.getDate() + pattern.avg_interval_days - 3);

      // If reminder date is in the past, set to today + a small buffer
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const finalReminderDate = reminderDate < today
        ? new Date(today.getTime() + 24 * 60 * 60 * 1000) // tomorrow
        : reminderDate;

      const { error: upsertError } = await supabase
        .from("beauty_rhythms")
        .upsert(
          {
            user_id: pattern.user_id,
            salon_id: pattern.salon_id,
            service_id: pattern.service_id,
            service_name: pattern.service_name,
            avg_interval_days: pattern.avg_interval_days,
            last_appointment_date: pattern.last_visit,
            next_reminder_date: finalReminderDate.toISOString().split("T")[0],
            auto_detected: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,salon_id,service_id" }
        );

      if (upsertError) {
        console.error("Upsert error:", upsertError);
      } else {
        upserted++;
      }
    }

    console.log(`Upserted ${upserted} beauty rhythms`);

    return new Response(
      JSON.stringify({ success: true, patternsFound: patterns?.length ?? 0, upserted }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in calculate-beauty-rhythms:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
