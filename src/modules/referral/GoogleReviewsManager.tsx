import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Star, Send, ExternalLink, Info, CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

const reviewTemplates = [
  {
    id: "warm",
    label: "💜 Ciepły i osobisty",
    preview: "Cześć {imię}! Dziękuję za dzisiejszą wizytę! Czy możesz poświęcić 30 sekund na opinię w Google? Bardzo mi to pomoże: {link} ❤️",
    recommended: true,
  },
  {
    id: "short",
    label: "⚡ Krótki i konkretny",
    preview: "Hej {imię}! Twoja opinia w Google bardzo nam pomaga. 20 sekund: {link} ⭐",
    recommended: false,
  },
  {
    id: "social",
    label: "🌸 Z elementem społecznym",
    preview: "Wiele kobiet szuka dobrego salonu przez Google. Twoja opinia pomoże im nas znaleźć! {link} 🌸",
    recommended: false,
  },
  {
    id: "gratitude",
    label: "🙏 Z podziękowaniem",
    preview: "Cześć {imię}! Dziękuję że jesteś z nami od {wizyt} wizyt. Twoja opinia w Google to najlepsza nagroda: {link} 💜",
    recommended: false,
  },
];

const mockReviewHistory = [
  { id: "1", clientName: "Kasia Wiśniewska", sentAt: "2h temu", status: "sent", channel: "sms" },
  { id: "2", clientName: "Ewa Jankowska", sentAt: "wczoraj", status: "clicked", channel: "email" },
  { id: "3", clientName: "Magda Dąbrowska", sentAt: "3 dni temu", status: "completed", channel: "sms" },
];

export function GoogleReviewsManager({ isDemo }: GoogleReviewsManagerProps) {
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("warm");
  const hasGoogleUrl = isDemo || !!googleReviewUrl;

  const silentFans = isDemo ? mockSilentFans : [];
  const reviewHistory = isDemo ? mockReviewHistory : [];
  const readyCount = silentFans.filter(f => f.status === "ready").length;

  const saveGoogleUrl = () => {
    toast.success("Link do opinii Google zapisany");
  };

  const sendReviewRequest = (fan: typeof mockSilentFans[0]) => {
    toast.success(`Prośba o opinię wysłana do ${fan.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Setup - Google Review URL */}
      {!hasGoogleUrl && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-2xl flex-shrink-0">⭐</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Najpierw ustaw link do opinii Google</h3>
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
                  value={googleReviewUrl}
                  onChange={e => setGoogleReviewUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveGoogleUrl} disabled={!googleReviewUrl}>Zapisz link</Button>
              </div>
              {googleReviewUrl && (
                <Button variant="outline" size="sm" className="mt-2 gap-2" onClick={() => window.open(googleReviewUrl, "_blank")}>
                  <ExternalLink className="w-3.5 h-3.5" /> Testuj link
                </Button>
              )}
            </div>
          </div>
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {reviewTemplates.map(tmpl => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`border-2 rounded-xl p-3 cursor-pointer transition-all relative ${
                  selectedTemplate === tmpl.id
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
                <p className="text-xs text-muted-foreground">{tmpl.preview}</p>
              </div>
            ))}
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
