import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { salonId, staffId, startTime, endTime, excludeId } = await req.json();

    if (!salonId || !staffId || !startTime || !endTime) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: salonId, staffId, startTime, endTime" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase
      .from("appointments")
      .select("id, start_time, end_time, status, service_id, services(name)")
      .eq("salon_id", salonId)
      .eq("staff_id", staffId)
      .not("status", "eq", "cancelled")
      .lt("start_time", endTime)
      .gt("end_time", startTime)
      .limit(1);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Conflict check error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const conflict = data && data.length > 0;
    const conflictingAppointment = conflict ? data[0] : null;

    return new Response(
      JSON.stringify({ conflict, conflictingAppointment }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
