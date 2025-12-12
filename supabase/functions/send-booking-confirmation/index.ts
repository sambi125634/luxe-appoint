import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingConfirmationRequest {
  appointmentId: string;
}

async function sendEmail(to: string, from: string, subject: string, html: string) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${error}`);
  }
  
  return await response.json();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { appointmentId }: BookingConfirmationRequest = await req.json();
    console.log("Processing booking confirmation for appointment:", appointmentId);

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
        salons!inner(name, address, phone, settings)
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

    // Check if email already sent
    if (appointment.confirmation_email_sent) {
      console.log("Confirmation email already sent for this appointment");
      return new Response(
        JSON.stringify({ message: "Email already sent" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const client = appointment.clients;
    const service = appointment.services;
    const staff = appointment.staff_members;
    const salon = appointment.salons;
    const settings = salon.settings?.notifications || {};

    // Check if email confirmation is enabled
    if (!settings.emailConfirmationEnabled) {
      console.log("Email confirmation disabled for this salon");
      return new Response(
        JSON.stringify({ message: "Email confirmation disabled" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!client.email) {
      console.log("Client has no email address");
      return new Response(
        JSON.stringify({ message: "No client email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format date and time
    const startDate = new Date(appointment.start_time);
    const formattedDate = startDate.toLocaleDateString("pl-PL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const formattedTime = startDate.toLocaleTimeString("pl-PL", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Get template or use default
    const template = settings.emailConfirmationTemplate || 
      `Cześć {imie}!\n\nTwoja rezerwacja została potwierdzona.\n\n📅 Data: {data}\n⏰ Godzina: {godzina}\n💇 Usługa: {usluga}\n👤 Specjalista: {specjalista}\n📍 Adres: {adres}\n\nDo zobaczenia!\n{nazwa_salonu}`;

    // Replace variables in template
    const emailBody = template
      .replace(/{imie}/g, client.first_name)
      .replace(/{nazwisko}/g, client.last_name)
      .replace(/{data}/g, formattedDate)
      .replace(/{godzina}/g, formattedTime)
      .replace(/{usluga}/g, service.name)
      .replace(/{specjalista}/g, staff.name)
      .replace(/{adres}/g, salon.address || "")
      .replace(/{nazwa_salonu}/g, salon.name)
      .replace(/{cena}/g, `${service.price} zł`)
      .replace(/{czas_trwania}/g, `${service.duration} min`);

    // Convert newlines to HTML
    const htmlBody = emailBody.replace(/\n/g, "<br>");

    // Send email via Resend API
    const emailHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✨ Rezerwacja potwierdzona!</h1>
        </div>
        <div style="background: #faf5ff; padding: 30px; border-radius: 0 0 12px 12px;">
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">${htmlBody}</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">
            Wysłano przez Beauty Calendar | beautyfunnel.pl
          </p>
        </div>
      </div>
    `;

    const emailResponse = await sendEmail(
      client.email,
      `${salon.name} <notifications@beautyfunnel.pl>`,
      `Potwierdzenie rezerwacji - ${salon.name}`,
      emailHtml
    );

    console.log("Email sent successfully:", emailResponse);

    // Mark as sent
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        confirmation_email_sent: true,
        confirmation_email_sent_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Error updating appointment:", updateError);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-booking-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
