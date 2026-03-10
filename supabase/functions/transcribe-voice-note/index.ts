import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { transcript: rawTranscript, voiceNoteId, salonId } = await req.json();

    if (!rawTranscript || !voiceNoteId || !salonId) {
      return new Response(
        JSON.stringify({ error: "Missing transcript, voiceNoteId or salonId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `Jesteś asystentem AI w salonie beauty. Analizujesz notatki głosowe pracowników salonu i wyciągasz z nich strukturalne dane.
Zawsze odpowiadaj po polsku. Bądź precyzyjny.`;

    const userPrompt = `Przeanalizuj tę transkrypcję notatki głosowej z salonu beauty i wyciągnij dane:

"${rawTranscript}"

Wyciągnij:
1. Użyte produkty (nazwy)
2. Tagi do dodania dla klientki (np. uczulenia, preferencje)
3. Sugestia następnej wizyty (za ile dni, jaka usługa)
4. Notatki/obserwacje dotyczące klientki`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              name: "extract_voice_note_data",
              description: "Extracts structured data from a beauty salon voice note transcript",
              parameters: {
                type: "object",
                properties: {
                  products: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of product names used during the treatment",
                  },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                    description: "Tags to add to client profile (allergies, preferences, warnings)",
                  },
                  nextVisit: {
                    type: "object",
                    properties: {
                      daysFromNow: { type: "number", description: "Suggested days until next visit" },
                      service: { type: "string", description: "Suggested service name" },
                    },
                    required: ["daysFromNow", "service"],
                    additionalProperties: false,
                  },
                  notes: {
                    type: "string",
                    description: "Additional observations about the client",
                  },
                },
                required: ["products", "tags", "notes"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "extract_voice_note_data" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      const text = await aiResponse.text();
      console.error("AI gateway error:", status, text);

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Zbyt wiele zapytań, spróbuj ponownie za chwilę" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Brak środków na koncie AI" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    let extracted = { products: [], tags: [], notes: "" };

    try {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        extracted = JSON.parse(toolCall.function.arguments);
      }
    } catch (e) {
      console.error("Failed to parse AI response:", e);
    }

    // Update voice note with extracted data
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await serviceClient
      .from("voice_notes")
      .update({ ai_extracted: extracted })
      .eq("id", voiceNoteId)
      .eq("salon_id", salonId);

    return new Response(JSON.stringify({ extracted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe-voice-note error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
