import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Send, Info, Save, TestTube } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { RetentionSequence } from "./types";

interface SequenceEditorProps {
  sequences: RetentionSequence[];
  readOnly?: boolean;
  onNavigate?: (tab: string) => void;
}

const SEQUENCE_TEMPLATES: Record<string, { label: string; templates: { name: string; content: string }[] }> = {
  proactive: {
    label: "Zanim odejdzie",
    templates: [
      { name: "Ciepły", content: "Cześć {imię}! Minęło trochę czasu od Twojej wizyty. Mamy kilka wolnych terminów w tym tygodniu. Zarezerwuj teraz: {link}" },
      { name: "Profesjonalny", content: "Dzień dobry {imię}, przypominamy o regularnej wizycie w {salon}. Zapraszamy: {link}" },
    ],
  },
  "45day": {
    label: "45 dni — łagodna",
    templates: [
      { name: "Ciepły i osobisty", content: "Cześć {imię}! Tęsknimy za Tobą 🌸 Minęło już {dni} dni od ostatniej wizyty. Masz już plan na kolejną? Zarezerwuj teraz — zostało kilka wolnych miejsc w tym tygodniu: {link}" },
      { name: "Profesjonalny", content: "Dzień dobry {imię}, chcieliśmy przypomnieć o Twojej regularnej wizycie w {salon}. Zapraszamy do rezerwacji: {link} Pozdrawiamy, zespół {salon}" },
      { name: "Z humorem", content: "Hej {imię}! Twoje {ostatnia_usługa} pewnie już tęskni za naszymi rękami 😄 Wpadnij po odnowę! {link}" },
    ],
  },
  "60day": {
    label: "60 dni — z wartością",
    templates: [
      { name: "Edukacyjny + rezerwacja", content: "Cześć {imię}! Wskazówka od nas: aby efekt {ostatnia_usługa} trwał jak najdłużej warto powtarzać zabieg co 6-8 tygodni. Twoja ostatnia wizyta była {dni} dni temu — to dobry moment! {link}" },
      { name: "Pytanie + oferta", content: "Cześć {imię}! Jak efekty po {ostatnia_usługa}? Jeśli chcesz je odświeżyć — czekamy! Wolne terminy: {link}" },
      { name: "Storytelling", content: "Twoje {ostatnia_usługa} u nas to już {dni} dni temu ✨ Czas na odnowę! Zarezerwuj ulubiony termin: {link}" },
    ],
  },
  "75day": {
    label: "75 dni — z incentive",
    templates: [
      { name: "Oferta limitowana", content: "Specjalnie dla Ciebie {imię}: -15% na {ostatnia_usługa} tylko do {data_wygasniecia} 🎁 Zarezerwuj teraz: {link} Oferta dla stałych klientek." },
      { name: "VIP", content: "Hej {imię}! Jako nasza stała klientka masz dostęp do specjalnej oferty powrotu. Szczegóły po rezerwacji: {link} Oferta ważna 48h ⏰" },
      { name: "Ostatnia chwila", content: "Jeszcze tylko 48h! Zarezerwuj {ostatnia_usługa} z rabatem powitalnym. {link} ⏰" },
    ],
  },
  "90day": {
    label: "90 dni — ostatnia szansa",
    templates: [
      { name: "Troskliwy", content: "Cześć {imię}, dawno Cię nie widzieliśmy i chcieliśmy się upewnić że wszystko u Ciebie dobrze 💙 Jeśli będziesz miała ochotę wrócić — zawsze jesteśmy tu dla Ciebie: {link}" },
      { name: "Pytanie o feedback", content: "Cześć {imię}! Minęło 3 miesiące od Twojej ostatniej wizyty. Czy jest coś co moglibyśmy poprawić? Twoja opinia jest dla nas ważna. Tęsknimy! 💜 {link}" },
      { name: "Ostatnia szansa", content: "Hej {imię}! To nasza ostatnia wiadomość żeby nie zawracać Ci głowy. Jeśli kiedyś będziesz chciała wrócić — zawsze będziemy tu: {link} 🌸" },
    ],
  },
};

const SEQUENCE_EXPLANATIONS: Record<string, string> = {
  proactive: "To jedyna sekwencja która NIE działa na podstawie dni nieaktywności — AI uczy się indywidualnego rytmu każdej klientki. Jeśli klientka zwykle przychodzi co 3 tygodnie — wiadomość wyśle się po ~4 tygodniach. Najwyższy wskaźnik konwersji ze wszystkich sekwencji.",
  "45day": "Łagodne przypomnienie dla klientek nieaktywnych 45 dni. Ton: ciepły, nienatarczywy. Cel: sprawić żeby klientka sama przypomniała sobie że planowała wizytę. Zawiera przycisk rezerwacji 1-klik z automatycznie wybranym ulubionym terminem klientki.",
  "60day": "Wartość edukacyjna — mini-artykuł lub wskazówka związana z ostatnią usługą klientki. Przykład: jeśli klientka robiła laminację rzęs — wiadomość zawiera '3 sposoby na przedłużenie efektu laminacji'. Buduje ekspertyzę salonu i delikatnie przypomina o wizycie.",
  "75day": "Ekskluzywna oferta powrotu ważna tylko 48 godzin. Zawiera licznik czasu w emailu lub informację 'oferta ważna do środy 23:59' w SMS. Najwyższy wskaźnik kliknięć ze wszystkich sekwencji.",
  "90day": "Ostatni kontakt przed dezaktywacją. Wiadomość ma ton 'troskliwy, nie sprzedażowy' — pytamy czy wszystko w porządku, nie czy chce wrócić. Po wysłaniu: auto-tag 'reaktywuj kampanią' → auto-sync do Meta Custom Audience.",
};

const SEQUENCE_ICONS: Record<string, string> = {
  proactive: "🔮", "45day": "🌸", "60day": "📚", "75day": "🎁", "90day": "🚨",
};

const VARIABLES = ["{imię}", "{salon}", "{ostatnia_usługa}", "{link}", "{telefon}", "{pracownik}", "{dni}", "{data_wygasniecia}"];

export function SequenceEditor({ sequences, readOnly = false, onNavigate }: SequenceEditorProps) {
  const { t } = useTranslation();
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [globalChannel, setGlobalChannel] = useState<string>("email");
  const [editedTemplates, setEditedTemplates] = useState<Record<string, string>>({});

  const channels = [
    { id: "email", icon: "📧", label: "Email", desc: "Wyższy wskaźnik otwarć.\nMożliwość dodania zdjęć.", recommended: true },
    { id: "sms", icon: "📱", label: "SMS", desc: "Szybszy odczyt.\n160 znaków limit.", recommended: false },
    { id: "both", icon: "🔀", label: "Email + SMS", desc: "Najskuteczniejsze.\nEmail + SMS po 24h bez otwarcia.", recommended: false },
  ];

  const getTemplate = (seqKey: string, original: string) => editedTemplates[seqKey] ?? original;

  const handleApplyTemplate = (seqKey: string, content: string) => {
    setEditedTemplates(prev => ({ ...prev, [seqKey]: content }));
  };

  const handleSave = (seqKey: string) => {
    toast.success(`Zapisano zmiany w sekwencji "${SEQUENCE_TEMPLATES[seqKey]?.label || seqKey}"`);
  };

  const handleTestSend = (seqKey: string) => {
    toast.success("Wiadomość testowa wysłana na Twój email/telefon");
  };

  const renderPreview = (template: string) => {
    return template
      .replace(/\{imię\}/g, "Anna")
      .replace(/\{salon\}/g, "Studio Urody")
      .replace(/\{ostatnia_usługa\}/g, "Manicure hybrydowy")
      .replace(/\{link\}/g, "[link rezerwacji]")
      .replace(/\{telefon\}/g, "+48 500 123 456")
      .replace(/\{pracownik\}/g, "Maria")
      .replace(/\{dni\}/g, "47")
      .replace(/\{data_wygasniecia\}/g, "środa 23:59");
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h3 className="font-serif font-bold text-xl">Sekwencje reaktywacyjne</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Skonfiguruj kiedy i co system wysyła do nieaktywnych klientek. Każda sekwencja ma inny ton i cel — razem tworzą kompletny lejek reaktywacji.
        </p>
      </div>

      {/* Global channel config */}
      <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <Send className="w-4 h-4 text-primary" />
          Skąd wysyłamy wiadomości?
        </h4>
        <div className="grid grid-cols-3 gap-3">
          {channels.map(channel => (
            <div
              key={channel.id}
              onClick={() => !readOnly && setGlobalChannel(channel.id)}
              className={cn(
                "border-2 rounded-xl p-3 transition-all relative",
                readOnly ? "cursor-default" : "cursor-pointer",
                globalChannel === channel.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              {channel.recommended && (
                <span className="absolute -top-2 -right-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-medium">
                  Polecane
                </span>
              )}
              <span className="text-2xl block mb-1">{channel.icon}</span>
              <p className="font-semibold text-sm">{channel.label}</p>
              <p className="text-xs text-muted-foreground whitespace-pre-line mt-1">{channel.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Używamy emaila i numeru telefonu skonfigurowanego w Ustawieniach → Komunikacja
          {onNavigate && (
            <button onClick={() => onNavigate("settings")} className="text-primary underline ml-1">
              Skonfiguruj teraz →
            </button>
          )}
        </div>
      </div>

      {/* Sequence cards */}
      <div className="space-y-3">
        {sequences.map((seq) => {
          const seqKey = seq.sequence_key as string;
          const icon = SEQUENCE_ICONS[seqKey] || "📋";
          const label = SEQUENCE_TEMPLATES[seqKey]?.label || seqKey;
          const explanation = SEQUENCE_EXPLANATIONS[seqKey] || "";
          const templates = SEQUENCE_TEMPLATES[seqKey]?.templates || [];
          const isExpanded = expandedKey === seqKey;
          const currentTemplate = getTemplate(seqKey, seq.message_template);

          return (
            <Collapsible key={seqKey} open={isExpanded} onOpenChange={() => setExpandedKey(isExpanded ? null : seqKey)}>
              <div className={cn(
                "rounded-xl border transition-colors",
                seq.is_active ? "border-primary/20 bg-primary/5" : "border-border"
              )}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-xl">{icon}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{label}</span>
                        {seq.trigger_days > 0 && (
                          <Badge variant="outline" className="text-xs">{seq.trigger_days} dni</Badge>
                        )}
                        {seq.include_incentive && (
                          <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">+ incentive</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={seq.is_active ? "default" : "secondary"} className="text-xs">
                      {seq.is_active ? "● Aktywna" : "○ Nieaktywna"}
                    </Badge>
                    <Switch checked={seq.is_active} disabled={readOnly} />
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </CollapsibleTrigger>
                  </div>
                </div>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4">
                    {/* Explanation */}
                    {explanation && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-1.5 mb-1">
                          <Info className="w-3.5 h-3.5" /> O tej sekwencji
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">{explanation}</p>
                      </div>
                    )}

                    {/* Template selector */}
                    {templates.length > 0 && (
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Gotowe szablony</label>
                        <Select onValueChange={(v) => handleApplyTemplate(seqKey, templates[parseInt(v)].content)}>
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Wybierz gotowy szablon..." />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map((t, i) => (
                              <SelectItem key={i} value={String(i)}>{t.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Template editor */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Szablon wiadomości</label>
                      <Textarea
                        value={currentTemplate}
                        onChange={(e) => !readOnly && setEditedTemplates(prev => ({ ...prev, [seqKey]: e.target.value }))}
                        rows={4}
                        readOnly={readOnly}
                        className="text-sm"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {VARIABLES.map(v => (
                          <Badge key={v} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10"
                            onClick={() => {
                              if (readOnly) return;
                              setEditedTemplates(prev => ({ ...prev, [seqKey]: (prev[seqKey] || seq.message_template) + ` ${v}` }));
                            }}>
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Podgląd wiadomości</label>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm border border-border italic">
                        {renderPreview(currentTemplate)}
                      </div>
                    </div>

                    {/* Info row */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Ton: <strong className="text-foreground">{seq.tone}</strong></span>
                      {seq.countdown_hours && (
                        <span>Countdown: <strong className="text-foreground">{seq.countdown_hours}h</strong></span>
                      )}
                      <span>Kanał: <strong className="text-foreground">{globalChannel === "both" ? "Email + SMS" : globalChannel === "sms" ? "SMS" : "Email"}</strong></span>
                    </div>

                    {/* Actions */}
                    {!readOnly && (
                      <div className="flex items-center gap-2 pt-2">
                        <Button size="sm" className="gap-1.5" onClick={() => handleSave(seqKey)}>
                          <Save className="w-3.5 h-3.5" /> Zapisz zmiany
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleTestSend(seqKey)}>
                          <TestTube className="w-3.5 h-3.5" /> Wyślij testową
                        </Button>
                      </div>
                    )}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
}
