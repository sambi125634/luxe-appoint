import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Clock,
  MessageSquare,
  Eye,
  SlidersHorizontal,
  Save,
  Sparkles,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useRef } from "react";
import { toast } from "sonner";

interface SpecificSetting {
  label: string;
  description: string;
  type: "toggle" | "number";
  default: boolean | number;
}

export interface FunctionConfig {
  name: string;
  defaultTime: string | null;
  defaultFreq: string;
  defaultChannels: string[];
  defaultMessage: string;
  previewMessage: string;
  specificSettings?: SpecificSetting[];
}

interface AutopilotConfigSheetProps {
  isOpen: boolean;
  onClose: () => void;
  functionId: string | null;
  config: FunctionConfig | null;
  enabled: boolean;
  iconBg: string;
  iconColor: string;
  icon: React.ElementType | null;
}

export const FUNCTION_CONFIGS: Record<string, FunctionConfig> = {
  vip: {
    name: "Klientka VIP na jutro",
    defaultTime: "20:00",
    defaultFreq: "daily",
    defaultChannels: ["Push", "Email"],
    defaultMessage:
      "Cześć! Jutro masz {imię} o {godzina}. To wyjątkowa klientka — {powód}. Przygotuj coś specjalnego 💜",
    previewMessage:
      "Cześć! Jutro masz Joannę o 11:00. To wyjątkowa klientka — jutro jej urodziny! Przygotuj coś specjalnego 💜",
    specificSettings: [
      { label: "Urodziny", description: "Powiadamiaj o urodzinach klientek", type: "toggle", default: true },
      { label: "Jubileusze wizyt", description: "Powiadamiaj co N wizyt", type: "toggle", default: true },
      { label: "Próg nieobecności (dni)", description: "Klientka zagrożona po X dniach", type: "number", default: 60 },
    ],
  },
  slots: {
    name: "Martwe godziny",
    defaultTime: "08:00",
    defaultFreq: "weekly",
    defaultChannels: ["SMS"],
    defaultMessage:
      "Cześć {imię}! Mamy specjalną ofertę — {usługa} w {data} o {godzina} z rabatem -20%! Zarezerwuj teraz 💜",
    previewMessage:
      "Cześć Kasiu! Mamy specjalną ofertę — manicure hybrydowy w czwartek o 14:00 z rabatem -20%! Zarezerwuj teraz 💜",
    specificSettings: [
      { label: "Min. pustych tygodni", description: "Ile tygodni slot musi być pusty", type: "number", default: 3 },
      { label: "Rabat (%)", description: "Domyślny rabat w ofercie flash", type: "number", default: 20 },
    ],
  },
  reminder: {
    name: "Pamięta zabieg",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["Push"],
    defaultMessage:
      "Cześć {imię}! Jutro o {godzina} czeka {usługa} 💅 Ostatnio: {ostatni_kolor} — mamy gotowy!",
    previewMessage:
      "Cześć Aniu! Jutro o 11:00 czeka manicure hybrydowy 💅 Ostatnio: Dusty Rose — mamy gotowy!",
    specificSettings: [
      { label: "Godziny przed wizytą", description: "Ile godzin przed wizytą wysłać", type: "number", default: 24 },
      { label: "Pokaż notatki klientki", description: "Dołącz uwagi i alergie", type: "toggle", default: true },
    ],
  },
  radar: {
    name: "Radar wartości",
    defaultTime: "08:00",
    defaultFreq: "weekly",
    defaultChannels: ["Push", "Email"],
    defaultMessage:
      "Raport TOP klientek tego tygodnia. {imię} — LTV {cena}. Chroniona VIP ✓",
    previewMessage:
      "Raport TOP klientek tego tygodnia. Joanna M. — LTV 4 200 zł. Chroniona VIP ✓",
    specificSettings: [
      { label: "Próg LTV (zł)", description: "Min. wartość życiowa do monitorowania", type: "number", default: 1000 },
      { label: "Alert zagrożenia", description: "Powiadom gdy VIP nie pojawia się N dni", type: "toggle", default: true },
    ],
  },
  noshow: {
    name: "No-show Recovery",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "Cześć {imię}! Widzimy że nie mogłaś dotrzeć dziś do nas 🤍 Czy chciałabyś przełożyć wizytę?",
    previewMessage:
      "Cześć Kasiu! Widzimy że nie mogłaś dotrzeć dziś do nas 🤍 Czy chciałabyś przełożyć wizytę?",
    specificSettings: [
      { label: "Opóźnienie pierwszego SMS", description: "Minuty po nieobecności", type: "number", default: 30 },
      { label: "Liczba prób", description: "Max wiadomości w sekwencji", type: "number", default: 3 },
    ],
  },
  ambassador: {
    name: "Cichy Ambasador",
    defaultTime: "18:00",
    defaultFreq: "daily",
    defaultChannels: ["SMS"],
    defaultMessage:
      "{imię}, jesteś z nami już długo 💜 Zawsze możemy na Ciebie liczyć. Czy poświęcisz 30 sekund na opinię? [Zostaw opinię →]",
    previewMessage:
      "Magdo, jesteś z nami już 14 miesięcy 💜 Zawsze możemy na Ciebie liczyć. Czy poświęcisz 30 sekund na opinię? [Zostaw opinię →]",
    specificSettings: [
      { label: "Min. liczba wizyt", description: "Od ilu wizyt klientka jest Ambasadorem", type: "number", default: 5 },
    ],
  },
  referral: {
    name: "Efekt Kuli Śnieżnej",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "Cześć {imię}! Masz swój link polecający! Za każdą nową klientkę — darmowe malowanie 💅 {salon}/ref/{link}",
    previewMessage:
      "Cześć Aniu! Masz swój link polecający! Za każdą nową klientkę — darmowe malowanie 💅 studio.pl/ref/ania-k",
    specificSettings: [
      { label: "Po N-tej wizycie", description: "Wyślij link polecający po X wizytach", type: "number", default: 3 },
      { label: "Typ nagrody", description: "Darmowa usługa za polecenie", type: "toggle", default: true },
    ],
  },
  priceDetector: {
    name: "Detektor cenowy konkurencji",
    defaultTime: "08:00",
    defaultFreq: "trigger",
    defaultChannels: ["Push"],
    defaultMessage: "Raport cenowy — {data}. Twoje ceny vs okolica. Potencjał korekty: {cena}/miesiąc",
    previewMessage: "Raport cenowy — kwiecień 2026. Twoje ceny vs okolica (Mokotów). Potencjał korekty: +640 zł/miesiąc",
    specificSettings: [
      { label: "Promień analizy (km)", description: "Okolica do porównania cen", type: "number", default: 5 },
    ],
  },
  upsell: {
    name: "Inteligentny upsell przed wizytą",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "{imię}, jutro o {godzina} czeka Twój {usługa} 💅 Widzimy że ostatnio brałaś też {dodatkowa_usługa} — może przy okazji? (-10%)",
    previewMessage:
      "Aniu, jutro o 11:00 czeka Twój manicure 💅 Widzimy że ostatnio brałaś też stylizację brwi — może przy okazji? (-10%)",
    specificSettings: [
      { label: "Rabat upsell (%)", description: "Rabat na dodatkową usługę", type: "number", default: 10 },
      { label: "Min. historii", description: "Ile razy klientka brała usługę wcześniej", type: "number", default: 2 },
    ],
  },
  profitAlarm: {
    name: "Alarm rentowności",
    defaultTime: "09:00",
    defaultFreq: "daily",
    defaultChannels: ["Push"],
    defaultMessage: "⚠️ Wykryta anomalia — {usługa}: zużycie {cena}/zabieg vs norma. Sprawdź szczegóły.",
    previewMessage: "⚠️ Wykryta anomalia — Przedłużanie żelowe: zużycie 39 zł/zabieg vs norma 22 zł. Sprawdź szczegóły.",
    specificSettings: [
      { label: "Próg alertu (%)", description: "Alert gdy odchylenie przekracza X%", type: "number", default: 30 },
    ],
  },
  firstVisitSequence: {
    name: "Sekwencja powitalna",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "{imię}, już niedługo! Jak przygotować się do {usługa} → [poradnik]. Do zobaczenia {data} o {godzina}!",
    previewMessage:
      "Aniu, już niedługo! Jak przygotować się do manicure hybrydowego → [poradnik]. Do zobaczenia w środę o 11:00!",
    specificSettings: [
      { label: "Liczba SMS w sekwencji", description: "Ile wiadomości w sekwencji", type: "number", default: 4 },
    ],
  },
  abandonedBooking: {
    name: "Ratownik porzuconych rezerwacji",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "{imię}, widzimy że byłaś blisko 💜 Termin na {data} {godzina} nadal wolny. Dokończ rezerwację →",
    previewMessage:
      "Kasiu, widzimy że byłaś blisko 💜 Termin na środę 14:00 nadal wolny — ale 2 osoby też go przeglądają. Dokończ rezerwację →",
    specificSettings: [
      { label: "Opóźnienie (min)", description: "Minuty po porzuceniu rezerwacji", type: "number", default: 30 },
      { label: "FOMO element", description: "Dodaj info o zainteresowaniu terminem", type: "toggle", default: true },
    ],
  },
  loyalty: {
    name: "Program lojalnościowy bez kart",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "{imię}, masz u nas już {wizyty} wizyt! 🎉 Zarobiłaś {nagroda}. Powiedz tylko 'mam nagrodę' przy kolejnej wizycie 💜",
    previewMessage:
      "Aniu, masz u nas już 5 wizyt! 🎉 Zarobiłaś darmowe malowanie. Powiedz tylko 'mam nagrodę' przy kolejnej wizycie 💜",
    specificSettings: [
      { label: "Nagroda co N wizyt", description: "Co ile wizyt nagroda", type: "number", default: 5 },
    ],
  },
  vacationBrain: {
    name: "Drugi mózg podczas urlopu",
    defaultTime: "20:00",
    defaultFreq: "daily",
    defaultChannels: ["Push", "Email"],
    defaultMessage: "☀️ Dzień {dzień} z {dni} — salon działa! {wizyty} wizyt · {przychód} zł przychodu. Odpoczywaj spokojnie 🌴",
    previewMessage: "☀️ Dzień 3 z 7 — salon działa! 8 wizyt · 1 840 zł przychodu. Odpoczywaj spokojnie 🌴",
    specificSettings: [
      { label: "Alerty pilne", description: "Powiadamiaj o pilnych sytuacjach natychmiast", type: "toggle", default: true },
    ],
  },
  reviewGuard: {
    name: "Strażnik reputacji Google",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "Cześć {imię}! Jak oceniasz dzisiejszą wizytę? Odpisz 1-5 💜",
    previewMessage:
      "Cześć Magdo! Jak oceniasz dzisiejszą wizytę? Odpisz 1-5 💜",
    specificSettings: [
      { label: "Opóźnienie po wizycie (h)", description: "Ile godzin po wizycie wysłać ankietę", type: "number", default: 2 },
      { label: "Próg Google (min. ocena)", description: "Od jakiej oceny kierować do Google", type: "number", default: 4 },
    ],
  },
  priceChangeFollowup: {
    name: "Amortyzator podwyżki cen",
    defaultTime: null,
    defaultFreq: "trigger",
    defaultChannels: ["SMS"],
    defaultMessage:
      "{imię}, od {data} nasze ceny ulegną małej zmianie. Dla Ciebie — jako stałej klientki — stare ceny przez 60 dni 💜 Zarezerwuj teraz → [link]",
    previewMessage:
      "Aniu, od maja nasze ceny ulegną małej zmianie. Dla Ciebie — jako stałej klientki — stare ceny przez 60 dni 💜 Zarezerwuj teraz → [link]",
    specificSettings: [
      { label: "Okres ochronny (dni)", description: "Ile dni stare ceny dla stałych klientek", type: "number", default: 60 },
      { label: "Min. wizyt", description: "Od ilu wizyt klientka jest stała", type: "number", default: 5 },
    ],
  },
};

export function AutopilotConfigSheet({
  isOpen,
  onClose,
  config,
  enabled,
  iconBg,
  iconColor,
  icon: Icon,
}: AutopilotConfigSheetProps) {
  const [message, setMessage] = useState(config?.defaultMessage || "");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(config?.defaultChannels || []);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Reset state when config changes
  const configName = config?.name;
  const [lastConfig, setLastConfig] = useState(configName);
  if (configName !== lastConfig) {
    setLastConfig(configName);
    setMessage(config?.defaultMessage || "");
    setSelectedChannels(config?.defaultChannels || []);
  }

  if (!config) return null;

  const toggleChannel = (ch: string) => {
    setSelectedChannels((prev) =>
      prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]
    );
  };

  const insertVariable = (variable: string) => {
    const ta = textareaRef.current;
    if (ta) {
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newMsg = message.slice(0, start) + variable + message.slice(end);
      setMessage(newMsg);
      setTimeout(() => {
        ta.focus();
        ta.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    } else {
      setMessage((prev) => prev + variable);
    }
  };

  const handleSave = () => {
    onClose();
    toast.success("Konfiguracja zapisana", {
      description: "(wersja demo)",
      duration: 3000,
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-3">
            {Icon && (
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  iconBg
                )}
              >
                <Icon className={cn("w-5 h-5", iconColor)} />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-base">{config.name}</h3>
              <p className="text-xs text-muted-foreground">
                Konfiguracja funkcji Autopilota
              </p>
            </div>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
              enabled
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-500"
            )}
          >
            <div
              className={cn(
                "w-1.5 h-1.5 rounded-full",
                enabled ? "bg-green-500" : "bg-gray-400"
              )}
            />
            {enabled ? "Aktywna" : "Wyłączona"}
          </div>
        </div>

        {/* Content — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Schedule */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Harmonogram
            </h4>
            <div className="space-y-3">
              {config.defaultTime && (
                <div>
                  <Label className="text-xs">Godzina wysyłki</Label>
                  <Input
                    type="time"
                    defaultValue={config.defaultTime}
                    className="mt-1"
                  />
                </div>
              )}
              <div>
                <Label className="text-xs">Częstotliwość</Label>
                <Select defaultValue={config.defaultFreq}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Codziennie</SelectItem>
                    <SelectItem value="weekly">Co tydzień</SelectItem>
                    <SelectItem value="trigger">Na wyzwalacz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Channel */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Radio className="w-4 h-4 text-muted-foreground" />
              Kanał komunikacji
            </h4>
            <div className="flex gap-2">
              {["SMS", "Email", "Push"].map((ch) => (
                <button
                  key={ch}
                  onClick={() => toggleChannel(ch)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                    selectedChannels.includes(ch)
                      ? "bg-violet-100 border-violet-300 text-violet-700"
                      : "bg-background border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              Treść wiadomości
            </h4>
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="text-sm"
            />
            <div className="mt-2">
              <p className="text-xs text-muted-foreground mb-1.5">
                Dostępne zmienne:
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {["{imię}", "{data}", "{godzina}", "{usługa}", "{cena}", "{salon}"].map(
                  (v) => (
                    <button
                      key={v}
                      onClick={() => insertVariable(v)}
                      className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md border border-violet-200 hover:bg-violet-100 transition-colors font-mono"
                    >
                      {v}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              Podgląd wiadomości
            </h4>
            <div className="bg-muted/30 rounded-xl p-4 border border-border">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">BC</span>
                </div>
                <span className="text-xs font-semibold">Beauty Calendar</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  teraz
                </span>
              </div>
              <div className="bg-background rounded-xl rounded-tl-sm px-3 py-2.5 shadow-sm">
                <p className="text-sm leading-relaxed">
                  {config.previewMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Specific settings */}
          {config.specificSettings && config.specificSettings.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                Ustawienia zaawansowane
              </h4>
              <div className="space-y-3">
                {config.specificSettings.map((setting, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 mr-3">
                      <p className="text-sm font-medium">{setting.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {setting.description}
                      </p>
                    </div>
                    {setting.type === "toggle" && (
                      <Switch defaultChecked={setting.default as boolean} />
                    )}
                    {setting.type === "number" && (
                      <Input
                        type="number"
                        defaultValue={setting.default as number}
                        className="w-20 text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-muted/10 space-y-2">
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3 flex items-start gap-2 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-violet-700">
              To jest wersja demo. W Twoim salonie zmiany zapisują się do bazy
              i działają natychmiast.
            </p>
          </div>
          <Button
            className="w-full bg-violet-600 hover:bg-violet-700 gap-2"
            onClick={handleSave}
          >
            <Save className="w-4 h-4" />
            Zapisz konfigurację
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
          >
            Anuluj
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
