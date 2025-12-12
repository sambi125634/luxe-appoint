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

    // Parse webhook data from P24
    const formData = await req.formData();
    const webhookData: Record<string, string> = {};
    formData.forEach((value, key) => {
      webhookData[key] = value.toString();
    });

    console.log("P24 webhook received:", webhookData);

    const sessionId = webhookData.sessionId || webhookData.p24_session_id;
    const orderId = webhookData.orderId || webhookData.p24_order_id;
    const amount = parseInt(webhookData.amount || webhookData.p24_amount || "0");
    const currency = webhookData.currency || webhookData.p24_currency || "PLN";
    const statement = webhookData.statement || webhookData.p24_statement;
    const methodId = webhookData.methodId || webhookData.p24_method;
    const sign = webhookData.sign || webhookData.p24_sign;

    if (!sessionId) {
      console.error("Missing sessionId in webhook");
      return new Response(
        JSON.stringify({ error: "Missing sessionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find appointment by session ID
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select("*, salons(settings)")
      .eq("payment_session_id", sessionId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Appointment not found for session:", sessionId);
      return new Response(
        JSON.stringify({ error: "Appointment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const salonSettings = appointment.salons?.settings as any;
    const p24Config = salonSettings?.integrations?.przelewy24;

    if (!p24Config) {
      console.error("P24 config not found for salon");
      return new Response(
        JSON.stringify({ error: "P24 config not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify transaction with P24
    const verifyUrl = p24Config.sandbox
      ? "https://sandbox.przelewy24.pl/api/v1/transaction/verify"
      : "https://secure.przelewy24.pl/api/v1/transaction/verify";

    const verifyData = {
      merchantId: parseInt(p24Config.merchantId),
      posId: parseInt(p24Config.posId || p24Config.merchantId),
      sessionId: sessionId,
      amount: amount,
      currency: currency,
      orderId: parseInt(orderId),
      sign: sign,
    };

    const authHeader = btoa(`${p24Config.merchantId}:${p24Config.apiKey}`);
    
    const verifyResponse = await fetch(verifyUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(verifyData),
    });

    const verifyResult = await verifyResponse.json();
    console.log("P24 verify response:", verifyResult);

    if (!verifyResponse.ok || verifyResult.error) {
      console.error("P24 verification failed:", verifyResult);
      
      // Update appointment as failed
      await supabase
        .from("appointments")
        .update({ payment_status: "failed" })
        .eq("id", appointment.id);

      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Determine payment method
    let paymentMethod = "transfer";
    if (methodId) {
      const methodIdNum = parseInt(methodId);
      if (methodIdNum === 154 || methodIdNum === 227) {
        paymentMethod = "blik";
      } else if (methodIdNum >= 1 && methodIdNum <= 50) {
        paymentMethod = "card";
      }
    }

    // Update appointment as paid
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        payment_status: "paid",
        payment_paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        status: "confirmed", // Auto-confirm after payment
      })
      .eq("id", appointment.id);

    if (updateError) {
      console.error("Failed to update appointment:", updateError);
    }

    console.log("Payment confirmed for appointment:", appointment.id, "method:", paymentMethod);

    // TODO: Send confirmation email about successful payment

    return new Response(
      JSON.stringify({ status: "ok" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in P24 webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
