import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const REMINDER_MESSAGES = [
  (name: string, service: string, days: number) =>
    `Hej ${name}! Mija ${days} dni od Twojego ${service}. Czas zadbać o siebie? 💅`,
  (name: string, service: string, days: number) =>
    `${service} co ${days} dni — to Twój rytuał piękna ✨ Wolne terminy czekają!`,
  (_name: string, service: string, _days: number) =>
    `Twoje ${service} wygląda najlepiej świeżo po zabiegu 🌸 Zarezerwuj już dziś!`,
];

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const today = new Date().toISOString().split("T")[0];
    console.log("Sending rhythm reminders for:", today);

    // Find rhythms due today
    const { data: reminders, error } = await supabase
      .from("beauty_rhythms")
      .select("*, salons(name)")
      .eq("next_reminder_date", today)
      .eq("reminder_enabled", true);

    if (error) {
      console.error("Error fetching reminders:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${reminders?.length ?? 0} reminders to send`);

    let sent = 0;

    for (const r of reminders ?? []) {
      // Get user profile for name
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", r.user_id)
        .maybeSingle();

      const firstName = profile?.first_name ?? "Hej";
      const salonName = (r.salons as { name: string } | null)?.name ?? "salon";

      // Pick random message
      const msgFn = REMINDER_MESSAGES[Math.floor(Math.random() * REMINDER_MESSAGES.length)];
      const message = msgFn(firstName, r.service_name, r.avg_interval_days);

      // Create notification
      const { error: notifError } = await supabase.from("client_notifications").insert({
        user_id: r.user_id,
        salon_id: r.salon_id,
        type: "rhythm_reminder",
        title: "✨ Czas na Twój rytm beauty",
        description: message,
        action_url: `/app/salon/${r.salon_id}`,
      });

      if (notifError) {
        console.error("Notification error:", notifError);
        continue;
      }

      // Try push notification
      try {
        await supabase.functions.invoke("send-push-notification", {
          body: {
            userId: r.user_id,
            title: "✨ Czas na Twój rytm beauty",
            body: message,
            url: `/app/salon/${r.salon_id}`,
          },
        });
      } catch (pushErr) {
        console.error("Push notification failed:", pushErr);
      }

      // Move next_reminder_date forward
      const nextDate = new Date(today);
      nextDate.setDate(nextDate.getDate() + r.avg_interval_days);

      await supabase
        .from("beauty_rhythms")
        .update({ next_reminder_date: nextDate.toISOString().split("T")[0] })
        .eq("id", r.id);

      sent++;
    }

    console.log(`Sent ${sent} rhythm reminders`);

    return new Response(
      JSON.stringify({ success: true, sent }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in send-rhythm-reminders:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
