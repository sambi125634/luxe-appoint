import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function scrapeWithExpansion(url: string, firecrawlKey: string): Promise<string> {
  let formattedUrl = url.trim();
  if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
    formattedUrl = `https://${formattedUrl}`;
  }

  // Try Firecrawl v2 with actions that click every "more info" accordion on Booksy
  const expandSelectors = [
    'button[data-testid*="more" i]',
    'button[aria-label*="więcej" i]',
    'button[aria-label*="more info" i]',
    'button:has-text("Więcej info")',
    'button:has-text("więcej")',
    'button:has-text("More info")',
    'div[role="button"]:has-text("Więcej")',
  ];

  const actions: Array<Record<string, unknown>> = [
    { type: "wait", milliseconds: 3000 },
    { type: "scroll", direction: "down" },
    { type: "wait", milliseconds: 1500 },
    { type: "scroll", direction: "down" },
    { type: "wait", milliseconds: 1500 },
  ];

  for (const selector of expandSelectors) {
    actions.push({ type: "click", selector, all: true });
    actions.push({ type: "wait", milliseconds: 500 });
  }

  actions.push({ type: "wait", milliseconds: 1500 });

  console.log("Deep scraping:", formattedUrl);

  // First try v2 with actions
  let response = await fetch("https://api.firecrawl.dev/v2/scrape", {
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
      actions,
    }),
  });

  if (!response.ok) {
    console.warn("v2 with actions failed, falling back to v1 plain scrape:", response.status);
    response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: formattedUrl,
        formats: ["markdown"],
        onlyMainContent: true,
        waitFor: 8000,
      }),
    });
  }

  if (!response.ok) {
    throw new Error(`Firecrawl returned ${response.status}`);
  }

  const data = await response.json();
  const markdown: string = data?.data?.markdown || data?.markdown || "";
  console.log("Markdown length:", markdown.length);
  return markdown;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, services } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "URL jest wymagany" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!Array.isArray(services) || services.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Brak usług do wzbogacenia" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!FIRECRAWL_API_KEY || !LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: "Brak konfiguracji AI/Firecrawl" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const markdown = await scrapeWithExpansion(url, FIRECRAWL_API_KEY);

    if (!markdown || markdown.length < 100) {
      return new Response(
        JSON.stringify({ success: false, error: "Nie udało się pobrać treści ze strony" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const serviceList = services
      .map((s: { id: string; name: string }, i: number) => `${i + 1}. [${s.id}] ${s.name}`)
      .join("\n");

    const systemPrompt = `Jesteś ekspertem ds. salonów beauty w Polsce. Otrzymasz treść strony salonu (np. Booksy) i listę usług w systemie.
Twoim zadaniem jest dopasować każdą usługę z listy do treści strony i wyodrębnić DOKŁADNY opis (jeśli istnieje).

ZASADY:
- Dopasuj usługę po nazwie (fuzzy match — drobne różnice słownictwa są OK).
- Wyodrębnij opis usługi DOSŁOWNIE ze strony, jeśli istnieje (max 400 znaków, bez emoji).
- Jeśli na stronie jest tylko nazwa bez opisu — zwróć description: "" (pusty string).
- NIE wymyślaj opisów. Lepiej zwrócić pusty niż wygenerowany.
- Dodatkowo wyodrębnij 2-4 krótkie korzyści (benefits) jeśli wynikają z opisu (np. "Głębokie nawilżenie", "Bezbolesny zabieg"). Jeśli brak — pusta tablica.
- Zwróć WYŁĄCZNIE usługi, które udało Ci się znaleźć na stronie. Pomiń te, których brak.`;

    const userPrompt = `LISTA USŁUG W SYSTEMIE (id w nawiasach kwadratowych):
${serviceList}

TREŚĆ STRONY SALONU:
${markdown.slice(0, 35000)}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
              name: "return_enriched_services",
              description: "Zwróć dopasowane opisy usług",
              parameters: {
                type: "object",
                properties: {
                  matches: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "string", description: "ID usługi z systemu" },
                        description: { type: "string", description: "Opis usługi ze strony (max 400 znaków)" },
                        benefits: {
                          type: "array",
                          items: { type: "string" },
                          description: "2-4 krótkie korzyści jeśli wynikają z opisu",
                        },
                      },
                      required: ["id", "description", "benefits"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["matches"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_enriched_services" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: "Zbyt wiele zapytań, spróbuj za chwilę" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: "Brak środków AI" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: "Błąd AI" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ success: false, error: "AI nie zwróciło wyników" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const matches = (parsed.matches || []).filter(
      (m: { id: string; description: string }) => m.id && m.description && m.description.trim().length > 0
    );

    console.log("Returning matches:", matches.length, "/", services.length);

    return new Response(
      JSON.stringify({ success: true, matches }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("enrich-service-descriptions error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});