import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendSmsRequest {
  appointmentId: string;
  type: "confirmation" | "reminder";
}

async function sendSmsViaSmsapi(
  apiKey: string,
  senderName: string,
  to: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  // Format phone number for SMSAPI.pl (Polish format)
  let formattedPhone = to.replace(/\s+/g, "").replace(/[^0-9+]/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "48" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("+") && !formattedPhone.startsWith("48")) {
    formattedPhone = "48" + formattedPhone;
  }
  formattedPhone = formattedPhone.replace("+", "");

  console.log(`Sending SMS to ${formattedPhone} via SMSAPI.pl`);

  const response = await fetch("https://api.smsapi.pl/sms.do", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      to: formattedPhone,
      message: message,
      from: senderName || "Beauty",
      format: "json",
      encoding: "utf-8",
    }),
  });

  const result = await response.json();
  console.log("SMSAPI.pl response:", JSON.stringify(result));

  if (result.error) {
    return { success: false, error: result.message || result.error };
  }

  return { 
    success: true, 
    messageId: result.list?.[0]?.id || result.id 
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId, type }: SendSmsRequest = await req.json();
    console.log(`Processing SMS ${type} for appointment:`, appointmentId);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch appointment with related data
    const { data: appointment, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        *,
        clients!inner(first_name, last_name, email, phone),
        services!inner(name, duration, price),
        staff_members!inner(name),
        salons!inner(id, name, address, phone, settings)
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error("Appointment not found:", appointmentError);
      return new Response(
        JSON.stringify({ error: "Appointment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = appointment.clients;
    const service = appointment.services;
    const staff = appointment.staff_members;
    const salon = appointment.salons;
    const settings = salon.settings?.notifications || {};
    const smsapiSettings = salon.settings?.integrations?.smsapi || {};

    // Check if SMSAPI is configured
    if (!smsapiSettings.enabled || !smsapiSettings.apiKey) {
      console.log("SMSAPI.pl not configured for this salon");
      return new Response(
        JSON.stringify({ message: "SMSAPI.pl not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if SMS is enabled for this type
    const isConfirmation = type === "confirmation";
    if (isConfirmation && !settings.smsConfirmationEnabled) {
      console.log("SMS confirmation disabled for this salon");
      return new Response(
        JSON.stringify({ message: "SMS confirmation disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!isConfirmation && !settings.smsReminderEnabled) {
      console.log("SMS reminder disabled for this salon");
      return new Response(
        JSON.stringify({ message: "SMS reminder disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!client.phone) {
      console.log("Client has no phone number");
      return new Response(
        JSON.stringify({ message: "No client phone" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format date and time
    const startDate = new Date(appointment.start_time);
    const formattedDate = startDate.toLocaleDateString("pl-PL", {
      day: "numeric",
      month: "long",
    });
    const formattedTime = startDate.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Get template
    const template = isConfirmation 
      ? (settings.confirmationSmsTemplate || `{nazwa_salonu}: Wizyta potwierdzona na {data} o {godzina}. Usługa: {usluga}. Do zobaczenia!`)
      : (settings.reminderSmsTemplate || `{nazwa_salonu}: Przypomnienie - jutro o {godzina} masz wizytę ({usluga}). Odwołaj: {telefon}`);

    // Replace variables
    const smsMessage = template
      .replace(/{imie}/g, client.first_name ?? "")
      .replace(/{nazwisko}/g, client.last_name ?? "")
      .replace(/{data}/g, formattedDate ?? "")
      .replace(/{godzina}/g, formattedTime ?? "")
      .replace(/{usluga}/g, service?.name ?? "")
      .replace(/{specjalista}/g, staff?.name ?? "")
      .replace(/{adres}/g, salon.address ?? "")
      .replace(/{nazwa_salonu}/g, salon.name ?? "")
      .replace(/{telefon}/g, salon.phone ?? "")
      .replace(/{cena}/g, service?.price != null ? `${service.price} zł` : "")
      .replace(/{czas_trwania}/g, service?.duration != null ? `${service.duration} min` : "");

    // Send SMS via SMSAPI.pl
    const smsResult = await sendSmsViaSmsapi(
      smsapiSettings.apiKey,
      smsapiSettings.senderName || salon.name.substring(0, 11),
      client.phone,
      smsMessage
    );

    if (!smsResult.success) {
      console.error("SMS sending failed:", smsResult.error);
      return new Response(
        JSON.stringify({ error: smsResult.error }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("SMS sent successfully:", smsResult.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: smsResult.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-sms-smsapi:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
