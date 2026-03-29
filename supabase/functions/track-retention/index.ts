import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 1x1 transparent GIF
const PIXEL = new Uint8Array([
  0x47, 0x49, 0x46, 0x38, 0x39, 0x61,
  0x01, 0x00, 0x01, 0x00, 0x80, 0x00,
  0x00, 0xff, 0xff, 0xff, 0x00, 0x00,
  0x00, 0x21, 0xf9, 0x04, 0x00, 0x00,
  0x00, 0x00, 0x00, 0x2c, 0x00, 0x00,
  0x00, 0x00, 0x01, 0x00, 0x01, 0x00,
  0x00, 0x02, 0x02, 0x44, 0x01, 0x00,
  0x3b,
]);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const event = url.searchParams.get("e"); // "open" or "click"
    const messageId = url.searchParams.get("m"); // message_id (unique per email)
    const salonId = url.searchParams.get("s");
    const clientId = url.searchParams.get("c");
    const sequenceName = url.searchParams.get("seq");
    const redirect = url.searchParams.get("r");

    if (!event || !messageId || !salonId) {
      // For open pixels, still return the GIF even on bad params
      if (event === "open") {
        return new Response(PIXEL, {
          headers: { "Content-Type": "image/gif", "Cache-Control": "no-cache, no-store" },
        });
      }
      return new Response("Missing params", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Insert tracking event
    const eventType = event === "open" ? "open" : "click";
    await supabase.from("email_tracking_events").insert({
      salon_id: salonId,
      client_id: clientId || null,
      message_id: messageId,
      sequence_name: sequenceName || null,
      event_type: eventType,
      link_url: redirect || null,
      metadata: {
        ip: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        ua: req.headers.get("user-agent"),
      },
    });

    // For opens — return 1px transparent GIF
    if (event === "open") {
      return new Response(PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
        },
      });
    }

    // For clicks — redirect to target URL
    const targetUrl = redirect || "https://beautyfunnel.pl";
    return new Response(null, {
      status: 302,
      headers: { "Location": targetUrl, ...corsHeaders },
    });
  } catch (error) {
    console.error("Tracking error:", error);
    // Always return something useful — don't break the email experience
    return new Response(PIXEL, {
      headers: { "Content-Type": "image/gif", "Cache-Control": "no-cache" },
    });
  }
});
