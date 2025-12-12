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

    const { sessionId } = await req.json();

    if (!sessionId) {
      return new Response(
        JSON.stringify({ error: "Missing sessionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Verifying payment status for session:", sessionId);

    // Find appointment by session ID
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("id, payment_status, payment_amount, payment_paid_at, payment_method, start_time, services(name), staff_members(name)")
      .eq("payment_session_id", sessionId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Appointment not found for session:", sessionId);
      return new Response(
        JSON.stringify({ error: "Appointment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Payment status:", appointment.payment_status);

    return new Response(
      JSON.stringify({
        status: appointment.payment_status,
        amount: appointment.payment_amount,
        paidAt: appointment.payment_paid_at,
        method: appointment.payment_method,
        appointmentId: appointment.id,
        serviceName: (appointment.services as any)?.name,
        staffName: (appointment.staff_members as any)?.name,
        startTime: appointment.start_time,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
