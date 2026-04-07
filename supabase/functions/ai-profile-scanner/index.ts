import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const INACTIVE_SALON_MARKERS = [
  "ten biznes nie jest już dostępny",
  "this business is no longer available",
  "nie znaleziono",
  "strona nie istnieje",
  "404",
  "nie jest już dostępn",
];

async function scrapeUrl(url: string, firecrawlKey: string): Promise<{ markdown: string | null; isInactive: boolean }> {
  try {
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    console.log("Scraping:", formattedUrl);

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 5000,
      }),
    });

    if (!response.ok) {
      console.error("Firecrawl error for", formattedUrl, response.status);
      return { markdown: null, isInactive: false };
    }

    const data = await response.json();
    const markdown = data?.data?.markdown || data?.markdown || null;
    console.log("Scraped", formattedUrl, "- length:", markdown?.length || 0);

    // Check if the salon page indicates inactive/closed business
    if (markdown) {
      const lowerContent = markdown.toLowerCase();
      const isInactive = INACTIVE_SALON_MARKERS.some(marker => lowerContent.includes(marker));
      if (isInactive) {
        console.log("Detected inactive salon for", formattedUrl);
        return { markdown, isInactive: true };
      }
    }

    return { markdown, isInactive: false };
  } catch (error) {
    console.error("Scrape failed for", url, error);
    return { markdown: null, isInactive: false };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { urls, salon_type } = await req.json();

    const urlList: string[] = [];
    if (urls && Array.isArray(urls)) {
      urlList.push(...urls.filter((u: string) => u && u.trim()));
    }

    if (urlList.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "At least one URL is required" }),
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

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");

    let scrapedContent = "";
    let anyInactive = false;
    let allInactive = true;

    if (FIRECRAWL_API_KEY) {
      const scrapeResults = await Promise.all(
        urlList.map(url => scrapeUrl(url, FIRECRAWL_API_KEY))
      );

      scrapeResults.forEach((result, i) => {
        if (result.isInactive) {
          anyInactive = true;
        } else {
          allInactive = false;
        }
        if (result.markdown) {
          scrapedContent += `\n\n--- ŹRÓDŁO ${i + 1}: ${urlList[i]} ---\n\n${result.markdown}`;
        }
      });

      // If ALL URLs point to inactive salons, return specific error
      if (allInactive && anyInactive) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "inactive_salon",
            message: "Ten salon nie jest już dostępny na Booksy. Sprawdź czy link jest poprawny lub podaj inny adres.",
          }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const hasScrapedData = scrapedContent.trim().length > 100;
    const salonTypeHint = salon_type || "multi";

    const systemPrompt = hasScrapedData
      ? `Jesteś asystentem AI specjalizującym się w ekstrakcji danych salonów beauty w Polsce.
Otrzymasz PRAWDZIWĄ treść stron internetowych salonu. Twoim zadaniem jest WYODRĘBNIĆ dane, NIE generować wymyślonych.

ZASADY:
- Wyodrębnij MAKSYMALNIE 80 najważniejszych usług (jeśli jest ich więcej, wybierz najczęściej oferowane)
- Zachowaj DOKŁADNE nazwy usług jak na stronie
- Zachowaj DOKŁADNE ceny jak na stronie (w PLN)
- Jeśli czas trwania nie jest podany, oszacuj go na podstawie typu usługi
- Wyodrębnij adres fizyczny salonu jeśli jest podany
- Wyodrębnij numer telefonu salonu jeśli jest podany
- Wyodrębnij godziny otwarcia jeśli są podane
- Kategorie usług grupuj logicznie (np. "Paznokcie", "Brwi i rzęsy", "Twarz", "Ciało")
- Jeśli treść strony nie zawiera żadnych usług (strona zamknięta, błąd, brak danych) — zwróć PUSTĄ tablicę services
- NIE wymyślaj usług jeśli ich nie ma na stronie
- Odpowiedz używając tool call "extract_salon_data"`
      : `Jesteś asystentem AI specjalizującym się w analizie profili salonów beauty w Polsce.
Na podstawie podanych URL wygeneruj realistyczne dane salonu typu: ${salonTypeHint}.
Wygeneruj co najmniej 15-25 usług typowych dla tego typu salonu z realistycznymi cenami dla polskiego rynku.
Odpowiedz używając tool call "extract_salon_data".`;

    const userPrompt = hasScrapedData
      ? `Wyodrębnij usługi i dane z poniższej treści strony salonu beauty.
Maksymalnie 80 najważniejszych usług. Grupuj je w logiczne kategorie.
WAŻNE: Jeśli strona nie zawiera usług (np. salon zamknięty) — zwróć pustą tablicę services [].

TREŚĆ STRON:
${scrapedContent.slice(0, 30000)}`
      : `Wygeneruj dane dla salonu beauty typu "${salonTypeHint}" na podstawie tych URL: ${urlList.join(", ")}
Wygeneruj co najmniej 20 usług z cenami typowymi dla polskiego rynku.`;

    console.log("Sending to AI, scraped data:", hasScrapedData, "content length:", scrapedContent.length);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_salon_data",
              description: "Extract or generate salon data",
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
                  address: { type: "string", description: "Physical address of the salon if found" },
                  phone: { type: "string", description: "Phone number of the salon if found" },
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
    console.log("Extracted services count:", salonData.services?.length || 0);

    // If scraped data existed but AI found 0 services, it means the page had no service data
    if (hasScrapedData && (!salonData.services || salonData.services.length === 0)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "no_services_found",
          message: "Nie znaleziono usług na podanej stronie. Sprawdź czy link prowadzi do aktywnego profilu salonu.",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
