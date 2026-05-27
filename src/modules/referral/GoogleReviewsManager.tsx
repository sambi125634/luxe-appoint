import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Star, Send, ExternalLink, Info, CheckCircle2, Clock, Save, Pencil, Check } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useReferralConfig, useUpdateReferralConfig } from "@/hooks/useReferralConfig";

interface GoogleReviewsManagerProps {
  isDemo?: boolean;
}

const mockSilentFans = [
  { id: "1", name: "Anna Kowalska", nps: 10, visits: 8, lastVisit: "2 dni temu", status: "ready" as const },
  { id: "2", name: "Maria Nowak", nps: 9, visits: 5, lastVisit: "5 dni temu", status: "ready" as const },
  { id: "3", name: "Kasia Wiśniewska", nps: 10, visits: 12, lastVisit: "1 dzień temu", status: "sent" as const },
  { id: "4", name: "Ola Zielińska", nps: 9, visits: 4, lastVisit: "10 dni temu", status: "ready" as const },
  { id: "5", name: "Magda Dąbrowska", nps: 10, visits: 6, lastVisit: "3 dni temu", status: "completed" as const },
];

const REVIEW_TEMPLATES: Record<string, { label: string; body: string; recommended?: boolean }> = {
  warm: {
    label: "💜 Ciepły i osobisty",
    body: "Cześć {imię}! Dziękuję za dzisiejszą wizytę! Czy możesz poświęcić 30 sekund na opinię w Google? Bardzo mi to pomoże: {link} ❤️",
    recommended: true,
  },
  short: {
    label: "⚡ Krótki i konkretny",
    body: "Hej {imię}! Twoja opinia w Google bardzo nam pomaga. 20 sekund: {link} ⭐",
  },
  social: {
    label: "🌸 Z elementem społecznym",
    body: "Wiele kobiet szuka dobrego salonu przez Google. Twoja opinia pomoże im nas znaleźć! {link} 🌸",
  },
  gratitude: {
    label: "🙏 Z podziękowaniem",
    body: "Cześć {imię}! Dziękuję że jesteś z nami od {wizyt} wizyt. Twoja opinia w Google to najlepsza nagroda: {link} 💜",
  },
  custom: {
    label: "✏️ Własna treść",
    body: "",
  },
};

const mockReviewHistory = [
  { id: "1", clientName: "Kasia Wiśniewska", sentAt: "2h temu", status: "sent", channel: "sms" },
  { id: "2", clientName: "Ewa Jankowska", sentAt: "wczoraj", status: "clicked", channel: "email" },
  { id: "3", clientName: "Magda Dąbrowska", sentAt: "3 dni temu", status: "completed", channel: "sms" },
];

export function GoogleReviewsManager({ isDemo }: GoogleReviewsManagerProps) {
  const { data: config, isLoading } = useReferralConfig(isDemo);
  const updateConfig = useUpdateReferralConfig(isDemo);

  const [urlDraft, setUrlDraft] = useState("");
  const [editingUrl, setEditingUrl] = useState(false);
  const [templateDraft, setTemplateDraft] = useState("");
  const [presetDraft, setPresetDraft] = useState("warm");

  useEffect(() => {
    if (!config) return;
    setUrlDraft(config.google_review_url || "");
    setTemplateDraft(config.review_message_template);
    setPresetDraft(config.review_template_preset);
  }, [config]);

  const savedUrl = config?.google_review_url || "";
  const hasGoogleUrl = !!savedUrl;

  const silentFans = isDemo ? mockSilentFans : [];
  const reviewHistory = isDemo ? mockReviewHistory : [];
  const readyCount = silentFans.filter(f => f.status === "ready").length;

  const validateUrl = (url: string): string | null => {
    if (!url) return "Wklej link do opinii Google";
    try {
      const u = new URL(url);
      if (u.protocol !== "https:" && u.protocol !== "http:") return "Link musi zaczynać się od https://";
      return null;
    } catch {
      return "To nie jest poprawny link URL";
    }
  };

  const saveGoogleUrl = () => {
    const err = validateUrl(urlDraft);
    if (err) {
      toast.error(err);
      return;
    }
    updateConfig.mutate(
      { google_review_url: urlDraft.trim() },
      { onSuccess: () => setEditingUrl(false) }
    );
  };

  const isTemplateDirty =
    !!config &&
    (templateDraft !== config.review_message_template || presetDraft !== config.review_template_preset);

  const saveTemplate = () => {
    updateConfig.mutate({
      review_message_template: templateDraft,
      review_template_preset: presetDraft,
    });
  };

  const selectPreset = (id: string) => {
    setPresetDraft(id);
    if (id !== "custom") {
      setTemplateDraft(REVIEW_TEMPLATES[id].body);
    }
  };

  const onTemplateChange = (text: string) => {
    setTemplateDraft(text);
    // If user diverges from preset body, mark as custom
    if (presetDraft !== "custom" && REVIEW_TEMPLATES[presetDraft]?.body !== text) {
      setPresetDraft("custom");
    }
  };

  const sendReviewRequest = (fan: typeof mockSilentFans[0]) => {
    toast.success(`Prośba o opinię wysłana do ${fan.name}`);
  };

  if (isLoading || !config) {
    return <div className="p-8 text-center text-muted-foreground text-sm">Wczytywanie konfiguracji…</div>;
  }

  return (
    <div className="space-y-6">
      {/* Setup - Google Review URL — always visible */}
      {(!hasGoogleUrl || editingUrl) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl flex-shrink-0">⭐</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">{hasGoogleUrl ? "Edytuj link do opinii Google" : "Najpierw ustaw link do opinii Google"}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Potrzebujesz bezpośredniego linku który otwiera formularz wystawienia opinii —
                nie stronę Twojego salonu. Dzięki temu klientka jednym kliknięciem trafia prosto do miejsca gdzie może wpisać opinię.
              </p>

              <div className="bg-background rounded-xl p-4 mb-4 border border-border">
                <p className="text-sm font-semibold mb-3">📋 Jak znaleźć link do opinii Google?</p>
                <ol className="text-sm space-y-2 text-muted-foreground">
                  {[
                    "Wejdź na Google Maps i wyszukaj nazwę swojego salonu",
                    'Kliknij na swój salon → przewiń do sekcji "Opinie"',
                    '"Napisz opinię" → skopiuj URL z paska przeglądarki',
                    "Wklej poniżej — link zaczyna się od https://search.google.com/...",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 font-bold">
                        {i + 1}
                      </span>
                      <span dangerouslySetInnerHTML={{ __html: step.replace(/(".*?")/g, '<strong>$1</strong>') }} />
                    </li>
                  ))}
                </ol>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>
                    <strong>Dlaczego to ważne?</strong> Zwykły link do Twojego profilu Google wymaga od klientki kilku kliknięć.
                    Bezpośredni link otwiera od razu formularz — konwersja jest 3× wyższa.
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <Input
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={urlDraft}
                  onChange={e => setUrlDraft(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveGoogleUrl} disabled={!urlDraft || updateConfig.isPending}>
                  {updateConfig.isPending ? "Zapisywanie…" : "Zapisz link"}
                </Button>
                {hasGoogleUrl && (
                  <Button variant="ghost" onClick={() => { setUrlDraft(savedUrl); setEditingUrl(false); }}>
                    Anuluj
                  </Button>
                )}
              </div>
              {urlDraft && (
                <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => window.open(urlDraft, "_blank")}>
                  <ExternalLink className="w-3.5 h-3.5" /> Testuj link
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {hasGoogleUrl && !editingUrl && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check className="w-5 h-5 text-green-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-900">Link do opinii Google ustawiony</p>
            <p className="text-xs text-green-700/80 truncate font-mono">{savedUrl}</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.open(savedUrl, "_blank")}>
            <ExternalLink className="w-3.5 h-3.5" /> Testuj
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEditingUrl(true)}>
            <Pencil className="w-3.5 h-3.5" /> Edytuj
          </Button>
        </div>
      )}

      {/* Ciche Fanki */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold">💝 Ciche Fanki — gotowe do aktywacji</h3>
            <p className="text-sm text-muted-foreground">Klientki z NPS 9-10 które nie mają jeszcze opinii w Google</p>
          </div>
          <Button className="gap-2" disabled={readyCount === 0 || !hasGoogleUrl}>
            <Star className="w-4 h-4" />
            Wyślij do wszystkich ({readyCount})
          </Button>
        </div>

        <div className="space-y-2">
          {silentFans.map((fan, idx) => (
            <motion.div
              key={fan.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center font-bold text-yellow-700 text-sm">
                {fan.nps}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{fan.name}</p>
                <p className="text-xs text-muted-foreground">{fan.visits} wizyt · ostatnia: {fan.lastVisit}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${
                  fan.status === "ready" ? "bg-green-100 text-green-700 hover:bg-green-100" :
                  fan.status === "sent" ? "bg-blue-100 text-blue-700 hover:bg-blue-100" :
                  "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                }`}>
                  {fan.status === "ready" && "✓ Gotowa"}
                  {fan.status === "sent" && "⏳ Wysłano"}
                  {fan.status === "completed" && "⭐ Opinia"}
                </Badge>
                {fan.status === "ready" && (
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => sendReviewRequest(fan)}>
                    <Send className="w-3.5 h-3.5" /> Wyślij
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
          {silentFans.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm rounded-xl border border-border">
              Brak cichych fanek do aktywacji. System wykryje je automatycznie.
            </div>
          )}
        </div>
      </div>

      {/* Szablony wiadomości */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">✏️ Szablony wiadomości z prośbą o opinię</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {Object.entries(REVIEW_TEMPLATES).map(([id, tmpl]) => (
              <div
                key={id}
                onClick={() => selectPreset(id)}
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all relative ${
                  presetDraft === id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/40"
                }`}
              >
                {tmpl.recommended && (
                  <span className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                    Polecane
                  </span>
                )}
                <p className="font-semibold text-sm mb-1">{tmpl.label}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{tmpl.body || "Napisz własną treść poniżej…"}</p>
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-medium block mb-1">Treść wiadomości (edytuj swobodnie)</label>
            <Textarea
              value={templateDraft}
              onChange={(e) => onTemplateChange(e.target.value)}
              rows={5}
              className="font-mono text-xs"
              placeholder="Cześć {imię}! Twoja opinia bardzo nam pomoże: {link}"
            />
            <div className="mt-2 p-2 bg-blue-50 rounded-md text-[11px] text-blue-700 flex items-start gap-2">
              <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>
                Placeholdery: <code className="bg-white px-1 rounded">{"{imię}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{link}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{wizyt}"}</code>{" "}
                <code className="bg-white px-1 rounded">{"{salon}"}</code>
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveTemplate} disabled={!isTemplateDirty || updateConfig.isPending} className="gap-2">
              <Save className="w-4 h-4" />
              {updateConfig.isPending ? "Zapisywanie…" : "Zapisz szablon"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Historia wysłanych próśb */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Send className="w-4 h-4" />
            Historia wysłanych próśb
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {reviewHistory.map(req => (
              <div key={req.id} className="px-4 py-3 flex items-center gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium">{req.clientName}</p>
                  <p className="text-xs text-muted-foreground">{req.channel.toUpperCase()} · {req.sentAt}</p>
                </div>
                <Badge variant={req.status === "completed" ? "default" : "outline"} className="text-xs">
                  {req.status === "sent" && (<><Clock className="w-3 h-3 mr-1" />Wysłano</>)}
                  {req.status === "clicked" && (<><ExternalLink className="w-3 h-3 mr-1" />Kliknięto</>)}
                  {req.status === "completed" && (<><CheckCircle2 className="w-3 h-3 mr-1" />Opinia</>)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
