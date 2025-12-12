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
}

const generateCRC = (data: string, crcKey: string): string => {
  // Simple CRC implementation for P24
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

    const { appointmentId, amount, clientEmail, clientName, description, salonId }: PaymentRequest = await req.json();

    console.log("Creating P24 payment for appointment:", appointmentId, "amount:", amount);

    // Fetch salon settings for P24 credentials
    const { data: salon, error: salonError } = await supabase
      .from("salons")
      .select("settings, name")
      .eq("id", salonId)
      .single();

    if (salonError || !salon) {
      console.error("Salon not found:", salonError);
      return new Response(
        JSON.stringify({ error: "Salon not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const settings = salon.settings as any;
    const p24Config = settings?.integrations?.przelewy24;

    if (!p24Config?.enabled || !p24Config?.merchantId || !p24Config?.apiKey) {
      console.error("Przelewy24 not configured for salon:", salonId);
      return new Response(
        JSON.stringify({ error: "Przelewy24 not configured" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionId = `BC_${appointmentId}_${Date.now()}`;
    const amountInGrosze = Math.round(amount * 100);
    
    // Determine API URL based on sandbox mode
    const apiUrl = p24Config.sandbox 
      ? "https://sandbox.przelewy24.pl/api/v1/transaction/register"
      : "https://secure.przelewy24.pl/api/v1/transaction/register";

    // Build return URLs
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace("supabase.co", "lovable.app") || "";
    const returnUrl = `${baseUrl}/payment/success?session=${sessionId}`;
    const statusUrl = `${supabaseUrl}/functions/v1/webhook-p24-payment`;

    // P24 transaction data
    const transactionData = {
      merchantId: parseInt(p24Config.merchantId),
      posId: parseInt(p24Config.posId || p24Config.merchantId),
      sessionId: sessionId,
      amount: amountInGrosze,
      currency: "PLN",
      description: description || `Zaliczka - ${salon.name}`,
      email: clientEmail,
      client: clientName,
      country: "PL",
      language: "pl",
      urlReturn: returnUrl,
      urlStatus: statusUrl,
      sign: "", // Will be calculated
    };

    // Calculate CRC sign
    const signData = `${sessionId}|${p24Config.merchantId}|${amountInGrosze}|PLN`;
    transactionData.sign = generateCRC(signData, p24Config.crcKey);

    console.log("Registering P24 transaction:", { sessionId, amount: amountInGrosze });

    // Register transaction with P24
    const authHeader = btoa(`${p24Config.merchantId}:${p24Config.apiKey}`);
    
    const p24Response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${authHeader}`,
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

    // Update appointment with payment session
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        payment_status: "pending",
        payment_amount: amount,
        payment_session_id: sessionId,
      })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Failed to update appointment:", updateError);
    }

    // Generate payment URL
    const trnToken = p24Result.data?.token;
    const paymentUrl = p24Config.sandbox
      ? `https://sandbox.przelewy24.pl/trnRequest/${trnToken}`
      : `https://secure.przelewy24.pl/trnRequest/${trnToken}`;

    console.log("Payment URL generated:", paymentUrl);

    return new Response(
      JSON.stringify({ 
        paymentUrl, 
        sessionId,
        token: trnToken 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error creating P24 payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
