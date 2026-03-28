import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const existingProducts = formData.get("existing_products") as string;

    if (!file) {
      return new Response(JSON.stringify({ error: "Brak pliku" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const bytes = await file.arrayBuffer();
    const uint8 = new Uint8Array(bytes);
    let base64 = "";
    const chunk = 8192;
    for (let i = 0; i < uint8.length; i += chunk) {
      base64 += String.fromCharCode(...uint8.slice(i, i + chunk));
    }
    base64 = btoa(base64);

    const isImage = file.type.startsWith("image/");
    const mediaType = file.type;

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Brak klucza API" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageContent = isImage
      ? {
          type: "image_url" as const,
          image_url: {
            url: `data:${mediaType};base64,${base64}`,
          },
        }
      : {
          type: "image_url" as const,
          image_url: {
            url: `data:${mediaType};base64,${base64}`,
          },
        };

    const textPrompt = `Przeanalizuj tę fakturę zakupową / paragon / potwierdzenie zamówienia i wyodrębnij wszystkie zakupione produkty.

Dla każdego produktu zwróć dane w formacie JSON:
{
  "items": [
    {
      "name": "pełna nazwa produktu",
      "brand": "marka jeśli widoczna",
      "quantity": liczba_sztuk,
      "unit_price_net": cena_netto_za_sztuke,
      "vat_rate": stawka_VAT_w_procentach,
      "unit_price_gross": cena_brutto_za_sztuke,
      "ean": "kod EAN jeśli widoczny lub null",
      "matched_product_id": "id dopasowanego produktu lub null"
    }
  ],
  "invoice_number": "numer faktury lub null",
  "invoice_date": "data faktury YYYY-MM-DD lub null",
  "supplier_name": "nazwa dostawcy/sklepu",
  "total_net": suma_netto,
  "total_gross": suma_brutto
}

Istniejące produkty w systemie (dopasuj po nazwie/marce/EAN gdy możliwe i wypełnij matched_product_id):
${existingProducts}

WAŻNE:
- Jeśli nie widzisz ceny netto, oblicz ją: netto = brutto / (1 + VAT/100)
- Domyślna stawka VAT to 23% jeśli nie jest podana
- Odpowiedz TYLKO czystym JSON bez żadnego dodatkowego tekstu
- Jeśli dopasowanie jest niepewne (poniżej 70% pewności), ustaw matched_product_id na null`;

    const response = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              imageContent,
              { type: "text", text: textPrompt },
            ],
          },
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI API error:", errText);
      return new Response(JSON.stringify({ error: "Błąd analizy AI", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "{}";

    // Clean markdown code blocks if present
    const clean = content
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/gi, "")
      .trim();

    // Validate JSON
    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      console.error("Failed to parse AI response:", clean);
      return new Response(JSON.stringify({ 
        error: "AI nie zwróciło poprawnego JSON", 
        raw: clean.substring(0, 500) 
      }), {
        status: 422,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("parse-invoice-ai error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
