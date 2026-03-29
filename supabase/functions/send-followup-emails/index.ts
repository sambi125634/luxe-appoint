import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

function buildTrackingUrl(
  baseUrl: string,
  event: "open" | "click",
  params: { messageId: string; salonId: string; clientId: string; sequenceName?: string; redirect?: string }
) {
  const url = new URL(`${baseUrl}/functions/v1/track-retention`);
  url.searchParams.set("e", event);
  url.searchParams.set("m", params.messageId);
  url.searchParams.set("s", params.salonId);
  url.searchParams.set("c", params.clientId);
  if (params.sequenceName) url.searchParams.set("seq", params.sequenceName);
  if (params.redirect) url.searchParams.set("r", params.redirect);
  return url.toString();
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting follow-up emails job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all salons with follow-up enabled
    const { data: salons, error: salonsError } = await supabase
      .from("salons")
      .select("id, name, slug, address, phone, settings")
      .eq("is_active", true);

    if (salonsError) {
      console.error("Error fetching salons:", salonsError);
      throw salonsError;
    }

    let totalSent = 0;
    let totalErrors = 0;

    for (const salon of salons || []) {
      const settings = salon.settings?.notifications || {};
      
      if (!settings.emailFollowupEnabled) {
        console.log(`Follow-up emails disabled for salon ${salon.id}`);
        continue;
      }

      const followupHours = settings.emailFollowupHoursAfter || 24;
      const now = new Date();
      const followupWindowStart = new Date(now.getTime() - (followupHours * 60 + 60) * 60 * 1000);
      const followupWindowEnd = new Date(now.getTime() - (followupHours * 60 - 60) * 60 * 1000);

      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          clients!inner(id, first_name, last_name, email, phone),
          services!inner(name, duration, price),
          staff_members!inner(name)
        `)
        .eq("salon_id", salon.id)
        .eq("followup_email_sent", false)
        .eq("status", "completed")
        .gte("end_time", followupWindowStart.toISOString())
        .lte("end_time", followupWindowEnd.toISOString());

      if (appointmentsError) {
        console.error(`Error fetching appointments for salon ${salon.id}:`, appointmentsError);
        continue;
      }

      console.log(`Found ${appointments?.length || 0} appointments needing follow-up for salon ${salon.id}`);

      for (const appointment of appointments || []) {
        const client = appointment.clients;
        const service = appointment.services;
        const staff = appointment.staff_members;

        if (!client.email) {
          console.log(`No email for client in appointment ${appointment.id}`);
          continue;
        }

        try {
          // Generate unique message ID for tracking
          const messageId = `followup-${appointment.id}`;
          
          // Build tracking URLs
          const bookingUrl = `https://beautyfunnel.pl/booking/${salon.slug || salon.id}`;
          
          const trackingPixelUrl = buildTrackingUrl(supabaseUrl, "open", {
            messageId,
            salonId: salon.id,
            clientId: client.id,
            sequenceName: "followup",
          });
          
          const trackedBookingUrl = buildTrackingUrl(supabaseUrl, "click", {
            messageId,
            salonId: salon.id,
            clientId: client.id,
            sequenceName: "followup",
            redirect: bookingUrl,
          });

          // Get template or use default
          const template = settings.emailFollowupTemplate || 
            `Cześć {imie}!\n\nDziękujemy za wizytę w {nazwa_salonu}!\n\nMamy nadzieję, że jesteś zadowolona z usługi "{usluga}".\n\nBędzie nam miło, jeśli podzielisz się swoją opinią lub umówisz się na kolejną wizytę.\n\nDo zobaczenia!\n{nazwa_salonu}`;

          const visitDate = new Date(appointment.start_time);
          const formattedDate = visitDate.toLocaleDateString("pl-PL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          });

          const emailBody = template
            .replace(/{imie}/g, client.first_name)
            .replace(/{nazwisko}/g, client.last_name)
            .replace(/{data_wizyty}/g, formattedDate)
            .replace(/{usluga}/g, service.name)
            .replace(/{specjalista}/g, staff.name)
            .replace(/{adres}/g, salon.address || "")
            .replace(/{nazwa_salonu}/g, salon.name);

          const htmlBody = emailBody.replace(/\n/g, "<br>");

          const emailHtml = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">💜 Dziękujemy za wizytę!</h1>
              </div>
              <div style="background: #faf5ff; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="font-size: 16px; line-height: 1.6; color: #374151;">${htmlBody}</p>
                <div style="text-align: center; margin-top: 20px;">
                  <a href="${trackedBookingUrl}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Umów kolejną wizytę
                  </a>
                </div>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280; text-align: center;">
                  Wysłano przez Beauty Calendar | beautyfunnel.pl
                </p>
              </div>
              <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
            </div>
          `;

          const emailResponse = await sendEmail(
            client.email,
            `${salon.name} <notifications@beautyfunnel.pl>`,
            `Dziękujemy za wizytę! - ${salon.name}`,
            emailHtml
          );

          console.log(`Follow-up email sent for appointment ${appointment.id}:`, emailResponse.id);

          // Record "sent" tracking event
          await supabase.from("email_tracking_events").insert({
            salon_id: salon.id,
            client_id: client.id,
            message_id: messageId,
            sequence_name: "followup",
            event_type: "sent",
            metadata: { resend_id: emailResponse.id, service: service.name },
          });

          // Mark appointment as sent
          await supabase
            .from("appointments")
            .update({
              followup_email_sent: true,
              followup_email_sent_at: new Date().toISOString(),
            })
            .eq("id", appointment.id);

          totalSent++;
        } catch (emailError: any) {
          console.error(`Error sending follow-up for appointment ${appointment.id}:`, emailError);
          totalErrors++;
        }
      }
    }

    console.log(`Follow-up emails job completed. Sent: ${totalSent}, Errors: ${totalErrors}`);

    return new Response(
      JSON.stringify({ success: true, sent: totalSent, errors: totalErrors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-followup-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
