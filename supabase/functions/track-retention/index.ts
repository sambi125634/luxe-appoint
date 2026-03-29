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
    const token = url.searchParams.get("t");
    const event = url.searchParams.get("e"); // "open" or "click"
    const redirect = url.searchParams.get("r");

    if (!token || !event) {
      return new Response("Invalid", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find message by tracking token
    const { data: message } = await supabase
      .from("retention_messages")
      .select("id, salon_id")
      .eq("tracking_token", token)
      .single();

    if (message) {
      // Record tracking event
      await supabase.from("retention_tracking").insert({
        message_id: message.id,
        event_type: event === "open" ? "opened" : "clicked",
        ip_address: req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip"),
        user_agent: req.headers.get("user-agent"),
        link_url: redirect,
      });

      // Update retention_messages timestamps
      const updateField = event === "open"
        ? { opened_at: new Date().toISOString() }
        : { clicked_at: new Date().toISOString() };

      await supabase
        .from("retention_messages")
        .update(updateField)
        .eq("id", message.id)
        .is(event === "open" ? "opened_at" : "clicked_at", null); // Only set first time
    }

    // For opens — return 1px transparent GIF
    if (event === "open") {
      return new Response(PIXEL, {
        headers: {
          "Content-Type": "image/gif",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          ...corsHeaders,
        },
      });
    }

    // For clicks — redirect
    return Response.redirect(
      redirect || "https://calendar.beauty-funnels.com",
      302
    );
  } catch (error) {
    console.error("Tracking error:", error);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
