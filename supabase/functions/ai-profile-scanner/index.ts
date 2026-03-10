import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, salon_type } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ success: false, error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "AI not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const salonTypeHint = salon_type || "multi";

    const systemPrompt = `Jesteś asystentem AI specjalizującym się w analizie profili salonów beauty w Polsce.
Na podstawie podanego URL profilu (Instagram lub Google Maps) wygeneruj realistyczne dane salonu.
Typ salonu: ${salonTypeHint}.

WAŻNE: Odpowiedz używając tool call "extract_salon_data" z wynikami.`;

    const userPrompt = `Przeanalizuj ten profil salonu beauty i wyodrębnij dane: ${url}

Na podstawie URL i typu salonu (${salonTypeHint}), wygeneruj realistyczne dane:
- Lista usług z cenami typowymi dla polskiego rynku beauty
- Godziny otwarcia
- Krótki opis salonu
- Szacunkowa ocena i liczba opinii`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_salon_data",
              description: "Extract salon data from the profile URL analysis",
              parameters: {
                type: "object",
                properties: {
                  services: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        price: { type: "number" },
                        duration: { type: "number" },
                        category: { type: "string" },
                      },
                      required: ["name", "price", "duration", "category"],
                      additionalProperties: false,
                    },
                  },
                  opening_hours: {
                    type: "object",
                    properties: {
                      monday: { type: "string" },
                      tuesday: { type: "string" },
                      wednesday: { type: "string" },
                      thursday: { type: "string" },
                      friday: { type: "string" },
                      saturday: { type: "string" },
                      sunday: { type: "string" },
                    },
                    required: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
                    additionalProperties: false,
                  },
                  description: { type: "string" },
                  avg_rating: { type: "number" },
                  existing_reviews_count: { type: "number" },
                },
                required: ["services", "opening_hours", "description", "avg_rating", "existing_reviews_count"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_salon_data" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Zbyt wiele zapytań, spróbuj za chwilę" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Brak środków na konto AI" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Błąd skanowania profilu" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      return new Response(
        JSON.stringify({ success: false, error: "AI nie zwróciło wyników" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const salonData = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ success: true, data: salonData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-profile-scanner error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
