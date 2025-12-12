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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting scheduled reminders job...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all salons with their notification settings
    const { data: salons, error: salonsError } = await supabase
      .from("salons")
      .select("id, name, address, phone, settings")
      .eq("is_active", true);

    if (salonsError) {
      console.error("Error fetching salons:", salonsError);
      throw salonsError;
    }

    let totalSent = 0;
    let totalErrors = 0;

    for (const salon of salons || []) {
      const settings = salon.settings?.notifications || {};
      
      // Skip if email reminders disabled
      if (!settings.emailReminderEnabled) {
        console.log(`Email reminders disabled for salon ${salon.id}`);
        continue;
      }

      const reminderHours = settings.emailReminderHoursBefore || 24;
      const now = new Date();
      const reminderWindowStart = new Date(now.getTime() + (reminderHours * 60 - 5) * 60 * 1000);
      const reminderWindowEnd = new Date(now.getTime() + (reminderHours * 60 + 5) * 60 * 1000);

      console.log(`Checking appointments for salon ${salon.id} between ${reminderWindowStart.toISOString()} and ${reminderWindowEnd.toISOString()}`);

      // Fetch appointments that need reminders
      const { data: appointments, error: appointmentsError } = await supabase
        .from("appointments")
        .select(`
          *,
          clients!inner(first_name, last_name, email, phone),
          services!inner(name, duration, price),
          staff_members!inner(name)
        `)
        .eq("salon_id", salon.id)
        .eq("reminder_email_sent", false)
        .neq("status", "cancelled")
        .gte("start_time", reminderWindowStart.toISOString())
        .lte("start_time", reminderWindowEnd.toISOString());

      if (appointmentsError) {
        console.error(`Error fetching appointments for salon ${salon.id}:`, appointmentsError);
        continue;
      }

      console.log(`Found ${appointments?.length || 0} appointments needing reminders for salon ${salon.id}`);

      for (const appointment of appointments || []) {
        const client = appointment.clients;
        const service = appointment.services;
        const staff = appointment.staff_members;

        if (!client.email) {
          console.log(`No email for client in appointment ${appointment.id}`);
          continue;
        }

        try {
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
          const template = settings.emailReminderTemplate || 
            `Cześć {imie}!\n\nPrzypominamy o jutrzejszej wizycie.\n\n📅 Data: {data}\n⏰ Godzina: {godzina}\n💇 Usługa: {usluga}\n👤 Specjalista: {specjalista}\n📍 Adres: {adres}\n\nDo zobaczenia!\n{nazwa_salonu}`;

          // Replace variables
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

          const htmlBody = emailBody.replace(/\n/g, "<br>");

          const emailHtml = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Przypomnienie o wizycie</h1>
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
            `Przypomnienie o wizycie - ${salon.name}`,
            emailHtml
          );

          console.log(`Reminder email sent for appointment ${appointment.id}:`, emailResponse.id);

          // Mark as sent
          await supabase
            .from("appointments")
            .update({
              reminder_email_sent: true,
              reminder_email_sent_at: new Date().toISOString(),
            })
            .eq("id", appointment.id);

          totalSent++;
        } catch (emailError: any) {
          console.error(`Error sending reminder for appointment ${appointment.id}:`, emailError);
          totalErrors++;
        }
      }
    }

    console.log(`Scheduled reminders job completed. Sent: ${totalSent}, Errors: ${totalErrors}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: totalSent, 
        errors: totalErrors 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in send-scheduled-reminders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
