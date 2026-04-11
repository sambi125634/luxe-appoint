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
    const methodId = webhookData.methodId || webhookData.p24_method;
    const sign = webhookData.sign || webhookData.p24_sign;

    if (!sessionId) {
      console.error("Missing sessionId in webhook");
      return new Response(
        JSON.stringify({ error: "Missing sessionId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try payment_transactions first, fallback to appointments
    const { data: txn } = await supabase
      .from("payment_transactions")
      .select("*, appointments(*, salons(settings))")
      .eq("p24_session_id", sessionId)
      .maybeSingle();

    let appointment: Record<string, unknown> | null = null;
    let salonSettings: Record<string, unknown> | null = null;

    if (txn?.appointments) {
      appointment = txn.appointments as Record<string, unknown>;
      const salons = (appointment as Record<string, unknown>).salons as Record<string, unknown> | undefined;
      salonSettings = salons?.settings as Record<string, unknown> | null;
    } else {
      // Fallback: find by appointments.payment_session_id
      const { data: appt, error: apptError } = await supabase
        .from("appointments")
        .select("*, salons(settings)")
        .eq("payment_session_id", sessionId)
        .single();

      if (apptError || !appt) {
        console.error("Transaction/appointment not found for session:", sessionId);
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      appointment = appt;
      const salons = (appt as Record<string, unknown>).salons as Record<string, unknown> | undefined;
      salonSettings = salons?.settings as Record<string, unknown> | null;
    }

    const integrations = salonSettings?.integrations as Record<string, unknown> | undefined;
    const p24Config = integrations?.przelewy24 as Record<string, string | boolean | undefined> | undefined;

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
      merchantId: parseInt(p24Config.merchantId as string),
      posId: parseInt((p24Config.posId || p24Config.merchantId) as string),
      sessionId,
      amount,
      currency,
      orderId: parseInt(orderId),
      sign,
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

    const appointmentId = (appointment as Record<string, unknown>).id as string;

    if (!verifyResponse.ok || verifyResult.error) {
      console.error("P24 verification failed:", verifyResult);

      // Update payment_transaction as failed
      if (txn) {
        await supabase
          .from("payment_transactions")
          .update({ status: "failed", error_message: JSON.stringify(verifyResult) })
          .eq("id", txn.id);
      }

      await supabase
        .from("appointments")
        .update({ payment_status: "failed" })
        .eq("id", appointmentId);

      return new Response(
        JSON.stringify({ error: "Payment verification failed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update payment_transaction as completed
    if (txn) {
      await supabase
        .from("payment_transactions")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          p24_order_id: orderId,
          payment_method: paymentMethod,
        })
        .eq("id", txn.id);
    }

    // Update appointment as paid
    await supabase
      .from("appointments")
      .update({
        payment_status: "paid",
        payment_paid_at: new Date().toISOString(),
        payment_method: paymentMethod,
        status: "confirmed",
      })
      .eq("id", appointmentId);

    console.log("Payment confirmed for appointment:", appointmentId, "method:", paymentMethod);

    // Send notification to client
    const userId = txn?.user_id;
    const salonId = (appointment as Record<string, unknown>).salon_id as string;
    if (userId && salonId) {
      await supabase.from("client_notifications").insert({
        user_id: userId,
        salon_id: salonId,
        type: "payment",
        title: "Płatność potwierdzona ✓",
        description: "Twoja wizyta została opłacona. Do zobaczenia!",
      });
    }

    return new Response(
      JSON.stringify({ status: "ok" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in P24 webhook:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
