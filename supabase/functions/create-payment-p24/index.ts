import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  appointmentId: string;
  amount: number;
  clientEmail: string;
  clientName: string;
  description: string;
  salonId: string;
  methodRefId?: string;
}

const generateCRC = (data: string, crcKey: string): string => {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data + crcKey);
  let hash = 0;
  for (let i = 0; i < dataBytes.length; i++) {
    hash = ((hash << 5) - hash) + dataBytes[i];
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(32, '0');
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { appointmentId, amount, clientEmail, clientName, description, salonId, methodRefId }: PaymentRequest = await req.json();

    console.log("Creating P24 payment for appointment:", appointmentId, "amount:", amount);

    // Get auth user for payment_transactions
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      userId = user?.id ?? null;
    }

    // Fetch salon settings for P24 credentials
    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("settings, name, p24_merchant_id, p24_pos_id")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      console.error("Salon not found:", salonError);
      return new Response(
        JSON.stringify({ error: "Salon not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settings = salon.settings as Record<string, unknown> | null;
    const integrations = settings?.integrations as Record<string, unknown> | undefined;
    const p24Config = integrations?.przelewy24 as Record<string, string | boolean | undefined> | undefined;

    if (!p24Config?.enabled || !p24Config?.merchantId || !p24Config?.apiKey) {
      console.error("Przelewy24 not configured for salon:", salonId);
      return new Response(
        JSON.stringify({ error: "Przelewy24 not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionId = `BC_${appointmentId}_${Date.now()}`;
    const amountInGrosze = Math.round(amount * 100);
    
    const apiUrl = p24Config.sandbox 
      ? "https://sandbox.przelewy24.pl/api/v1/transaction/register"
      : "https://secure.przelewy24.pl/api/v1/transaction/register";

    const returnUrl = `${supabaseUrl.replace("supabase.co", "lovable.app")}/app/payment-success?session=${sessionId}`;
    const statusUrl = `${supabaseUrl}/functions/v1/webhook-p24-payment`;

    const transactionData: Record<string, unknown> = {
      merchantId: parseInt(p24Config.merchantId as string),
      posId: parseInt((p24Config.posId || p24Config.merchantId) as string),
      sessionId,
      amount: amountInGrosze,
      currency: "PLN",
      description: description || `Wizyta - ${salon.name}`,
      email: clientEmail,
      client: clientName,
      country: "PL",
      language: "pl",
      urlReturn: returnUrl,
      urlStatus: statusUrl,
      sign: "",
    };

    if (methodRefId) {
      transactionData.methodRefId = methodRefId;
    }

    const signData = `${sessionId}|${p24Config.merchantId}|${amountInGrosze}|PLN`;
    transactionData.sign = generateCRC(signData, p24Config.crcKey as string);

    console.log("Registering P24 transaction:", { sessionId, amount: amountInGrosze });

    const p24AuthHeader = btoa(`${p24Config.merchantId}:${p24Config.apiKey}`);
    
    const p24Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${p24AuthHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    const p24Result = await p24Response.json();
    console.log("P24 response:", p24Result);

    if (!p24Response.ok || p24Result.error) {
      console.error("P24 registration failed:", p24Result);
      return new Response(
        JSON.stringify({ error: "Payment registration failed", details: p24Result }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const trnToken = p24Result.data?.token;

    // Create payment_transaction record
    if (userId) {
      const { data: txn, error: txnError } = await supabase
        .from("payment_transactions")
        .insert({
          appointment_id: appointmentId,
          user_id: userId,
          salon_id: salonId,
          amount,
          currency: "PLN",
          p24_session_id: sessionId,
          p24_token: trnToken,
          status: "pending",
        })
        .select("id")
        .single();

      if (txnError) {
        console.error("Failed to create payment transaction:", txnError);
      } else if (txn) {
        // Link transaction to appointment
        await supabase
          .from("appointments")
          .update({
            payment_status: "pending",
            payment_amount: amount,
            payment_session_id: sessionId,
            payment_transaction_id: txn.id,
          })
          .eq("id", appointmentId);
      }
    } else {
      // Fallback: update appointment directly
      await supabase
        .from("appointments")
        .update({
          payment_status: "pending",
          payment_amount: amount,
          payment_session_id: sessionId,
        })
        .eq("id", appointmentId);
    }

    const paymentUrl = p24Config.sandbox
      ? `https://sandbox.przelewy24.pl/trnRequest/${trnToken}`
      : `https://secure.przelewy24.pl/trnRequest/${trnToken}`;

    console.log("Payment URL generated:", paymentUrl);

    return new Response(
      JSON.stringify({ paymentUrl, sessionId, token: trnToken }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error creating P24 payment:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
