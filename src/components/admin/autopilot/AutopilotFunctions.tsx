import { Star, CalendarOff, ScanLine, Users, UserX, Heart, Gift } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";

interface AutopilotFunctionsProps {
  isDemo?: boolean;
}

type FunctionKey = "vip" | "slots" | "reminder" | "radar" | "noshow" | "ambassador" | "referral";

interface FunctionDef {
  key: FunctionKey;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  title: string;
  schedule: string;
  description: string;
  footer: string;
  renderExample: () => React.ReactNode;
}

function DemoVIPExample() {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">⭐ Jutro masz 3 wyjątkowe klientki:</span>
      <div className="space-y-3 mt-3">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">🎂</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Joanna L. — jutro urodziny (35 lat!)</p>
            <p className="text-xs text-amber-600">→ SMS z życzeniami i -10% na kolejną wizytę</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">💎</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Marta K. — 10. wizyta z rzędu</p>
            <p className="text-xs text-amber-600">→ Zaproponuj kartę Stałej Klientki VIP</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">💤</span>
          <div>
            <p className="text-sm font-medium text-amber-800">Beata W. — 9 tyg. bez wizyty, wydała 3 200 zł</p>
            <p className="text-xs text-amber-600">→ Wysłaliśmy ofertę wczoraj. Zarezerwowała środę.</p>
          </div>
        </div>
      </div>
      <div className="border-t border-amber-200 mt-3 pt-2">
        <p className="text-xs text-amber-600">Ten tydzień: 2 urodziny obsłużone · 1 VIP odzyskana</p>
      </div>
    </div>
  );
}

function DemoSlotsExample() {
  return (
    <div className="bg-red-50 border border-red-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">📅 Wykryte puste sloty:</span>
      <div className="space-y-3 mt-3">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">📊</span>
          <div>
            <p className="text-sm font-medium text-red-800">Czwartek 13:00–15:00 — pusty od 4 tygodni</p>
            <p className="text-xs text-red-600">→ Oferta flash wysłana do 12 klientek</p>
            <p className="text-xs text-red-600">→ Wynik: 2 zarezerwowały · +420 zł</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">📊</span>
          <div>
            <p className="text-sm font-medium text-red-800">Wtorek 9:00–10:00 — pusty od 2 tygodni</p>
            <p className="text-xs text-red-600">→ Autopilot zaplanował akcję na jutro 8:00</p>
          </div>
        </div>
      </div>
      <div className="border-t border-red-200 mt-3 pt-2">
        <pre className="text-[10px] font-mono text-red-500 leading-tight">
{`Pon  Wt   Śr   Czw  Pt   Sob
████ ██░░ ████ ░░░░ ████ ████
          ↑         ↑
       działa tu  działa tu`}
        </pre>
      </div>
    </div>
  );
}

function DemoReminderExample() {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Porównanie:</span>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div className="bg-gray-100 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">Zwykłe przypomnienie:</p>
          <p className="text-sm text-gray-600">Przypomnienie o wizycie jutro o 11:00</p>
          <span className="inline-block mt-2 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full">❌ Generyczne</span>
        </div>
        <div className="bg-white border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-500 mb-1">Beauty Calendar:</p>
          <p className="text-sm text-blue-800">Cześć Aniu! Jutro o 11:00 czeka manicure hybrydowy 💅 Ostatnio: Dusty Rose — mamy gotowy!</p>
          <span className="inline-block mt-2 text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✓ Personalizowane</span>
        </div>
      </div>
      <div className="border-t border-blue-200 mt-3 pt-2 space-y-1">
        <p className="text-xs text-blue-600">Ola P. — ostatnio: hybryda nude #12 · uczulenie na aceton</p>
        <p className="text-xs text-blue-600">Ewa S. — ostatnio: balayage blond · prosi o cieplejszy odcień</p>
      </div>
    </div>
  );
}

function DemoRadarExample() {
  return (
    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">💎 TOP klientki tego tygodnia:</span>
      <div className="space-y-3 mt-3">
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">🏆</span>
          <div>
            <p className="text-sm font-medium text-purple-800">Joanna M. — LTV 4 200 zł</p>
            <p className="text-xs text-purple-600">14 wizyt · chroniona VIP</p>
            <p className="text-xs text-purple-600">✓ Przypomnienia ✓ Urodziny 15.04 ✓ Wizyta za 8 dni</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-medium text-purple-800">Alicja R. — LTV 3 800 zł, ZAGROŻONA</p>
            <p className="text-xs text-purple-600">Brak wizyty 45 dni · ostatnia wartość: 280 zł</p>
            <p className="text-xs text-orange-600">→ Autopilot wysyła reaktywację dziś o 18:00</p>
          </div>
        </div>
      </div>
      <div className="border-t border-purple-200 mt-3 pt-2">
        <p className="text-xs text-purple-600">Łącznie chronione klientki VIP: 23</p>
      </div>
    </div>
  );
}

function DemoNoshowExample() {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">🔄 Ostatni odzysk — Kasia M.:</span>
      <div className="space-y-2 mt-3 ml-2 border-l-2 border-orange-200 pl-4">
        <div>
          <p className="text-xs text-orange-400 font-mono">● 12:00</p>
          <p className="text-sm text-orange-800">Nie przyszła na wizytę</p>
        </div>
        <div>
          <p className="text-xs text-orange-400 font-mono">● 12:30</p>
          <p className="text-sm text-orange-800">SMS: "Tęsknimy! Czy wszystko OK? 🤍"</p>
          <p className="text-xs text-green-600">Kasia odpisała po 2h ✓</p>
        </div>
        <div>
          <p className="text-xs text-orange-400 font-mono">● Jutro</p>
          <p className="text-sm text-orange-800">"Mamy wolne: czw 10:00, pt 14:00"</p>
          <p className="text-xs text-green-600">Zarezerwowała czwartek ✓</p>
        </div>
      </div>
      <div className="border-t border-orange-200 mt-3 pt-2 space-y-1">
        <p className="text-xs text-orange-600">Ten miesiąc: 6 no-showów → 4 wróciły</p>
        <p className="text-sm font-bold text-green-600">Odzyskano: 720 zł</p>
      </div>
    </div>
  );
}

function DemoAmbassadorExample() {
  return (
    <div className="bg-pink-50 border border-pink-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-pink-700 uppercase tracking-wide">🌟 Zidentyfikowano 18 Cichych Ambasadorów</span>
      <div className="mt-3 bg-white border border-pink-200 rounded-lg p-3">
        <p className="text-[10px] text-pink-400 mb-1">Do: Magda W. (6 wizyt · 0✗)</p>
        <p className="text-sm text-pink-800 leading-relaxed">
          "Madziu, jesteś z nami już 14 miesięcy 💜<br />
          Zawsze możemy na Ciebie liczyć. Czy poświęcisz 30 sekund na opinię?<br />
          <span className="text-pink-600 underline">[Zostaw opinię →]</span>"
        </p>
      </div>
      <div className="border-t border-pink-200 mt-3 pt-2">
        <p className="text-xs text-pink-600">Ten tydzień: 4 nowe opinie ★★★★★</p>
      </div>
    </div>
  );
}

function DemoReferralExample() {
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
      <div className="bg-white border border-green-200 rounded-lg p-3 mb-3">
        <p className="text-[10px] text-green-400 mb-1">Do: Ania K. (3. wizyta 🎉)</p>
        <p className="text-sm text-green-800 leading-relaxed">
          "Masz swój link polecający!<br />
          Za każdą nową klientkę — darmowe malowanie 💅<br />
          <span className="text-green-600 font-mono text-xs">studio.pl/ref/ania-k</span>"
        </p>
      </div>
      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Ten miesiąc:</span>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <p className="text-xs text-green-700">31 aktywnych linków</p>
        <p className="text-xs text-green-700">14 kliknięć · 6 rezerwacji</p>
        <p className="text-xs text-green-700">Wartość: 1 080 zł</p>
        <p className="text-sm font-bold text-green-600">ROI: 5.4×</p>
      </div>
    </div>
  );
}

const DEMO_EXAMPLES: Record<FunctionKey, () => React.ReactNode> = {
  vip: DemoVIPExample,
  slots: DemoSlotsExample,
  reminder: DemoReminderExample,
  radar: DemoRadarExample,
  noshow: DemoNoshowExample,
  ambassador: DemoAmbassadorExample,
  referral: DemoReferralExample,
};

const FUNCTIONS: FunctionDef[] = [
  {
    key: "vip", icon: Star, iconBg: "bg-amber-100", iconColor: "text-amber-600", borderColor: "border-amber-300",
    title: "Klientka VIP na jutro", schedule: "Codziennie o 20:00",
    description: "Dostajesz wieczorne podsumowanie wyjątkowych klientek na jutro — urodziny, jubileusze, zagrożone odejściem.",
    footer: "Godzina: 20:00 · Push + Email",
    renderExample: DemoVIPExample,
  },
  {
    key: "slots", icon: CalendarOff, iconBg: "bg-red-100", iconColor: "text-red-600", borderColor: "border-red-300",
    title: "Martwe godziny", schedule: "Co poniedziałek o 8:00",
    description: "Analiza pustych slotów w grafiku z ostatnich 3 tygodni. Proponuje promocje flash na te terminy.",
    footer: "Poniedziałek 8:00 · Raport + SMS do klientek",
    renderExample: DemoSlotsExample,
  },
  {
    key: "reminder", icon: ScanLine, iconBg: "bg-blue-100", iconColor: "text-blue-600", borderColor: "border-blue-300",
    title: "Pamięta zabieg", schedule: "Przed każdą wizytą",
    description: "Automatycznie przypomina, co klientka miała ostatnio, jakie produkty użyto, jakie były uwagi.",
    footer: "Automatycznie · Push do stylistki",
    renderExample: DemoReminderExample,
  },
  {
    key: "radar", icon: Users, iconBg: "bg-purple-100", iconColor: "text-purple-600", borderColor: "border-purple-300",
    title: "Radar wartości", schedule: "Co tydzień",
    description: "Identyfikuje klientki o najwyższej wartości życiowej (LTV) i monitoruje ich lojalność.",
    footer: "Co tydzień · Dashboard + Push",
    renderExample: DemoRadarExample,
  },
  {
    key: "noshow", icon: UserX, iconBg: "bg-orange-100", iconColor: "text-orange-600", borderColor: "border-orange-300",
    title: "No-show Recovery", schedule: "30 min po nieobecności",
    description: "Automatyczna sekwencja 3 wiadomości po nieobecności: przypomnienie → oferta → ostatnia szansa.",
    footer: "Automatycznie · SMS sekwencja",
    renderExample: DemoNoshowExample,
  },
  {
    key: "ambassador", icon: Heart, iconBg: "bg-pink-100", iconColor: "text-pink-600", borderColor: "border-pink-300",
    title: "Cichy Ambasador", schedule: "Po 5. wizycie",
    description: "Wykrywa lojalne klientki (5+ wizyt) bez opinii Google i delikatnie prosi o recenzję.",
    footer: "Po 5. wizycie · SMS + Link do Google",
    renderExample: DemoAmbassadorExample,
  },
  {
    key: "referral", icon: Gift, iconBg: "bg-green-100", iconColor: "text-green-600", borderColor: "border-green-300",
    title: "Efekt Kuli Śnieżnej", schedule: "Po 3. wizycie",
    description: "Program poleceń: po 3. wizycie klientka dostaje link polecający. Za każde polecenie — rabat.",
    footer: "Po 3. wizycie · SMS z linkiem",
    renderExample: DemoReferralExample,
  },
];

// Fallback examples for non-demo
const FALLBACK_EXAMPLES: Record<FunctionKey, { emoji: string; title: string; sub: string }[]> = {
  vip: [
    { emoji: "🎂", title: "Anna K. — jutro urodziny", sub: "SMS z życzeniami czeka" },
    { emoji: "💎", title: "Magda W. — 5. wizyta z rzędu", sub: "Zaproponuj kartę stałej klientki" },
    { emoji: "💤", title: "Kasia M. — 8 tyg. nieobecności", sub: "Wysłaliśmy ofertę. Przyjdzie jutro." },
  ],
  slots: [
    { emoji: "📊", title: "Wtorek 14:00–16:00 — pusto 3 tygodnie", sub: "Wyślij promocję -20% na ten slot" },
    { emoji: "📊", title: "Czwartek 10:00–11:00 — pusto 2 tygodnie", sub: "Zaproponuj nową usługę ekspresową" },
  ],
  reminder: [
    { emoji: "💅", title: "Ola P. — ostatnio: hybryda nude #12", sub: "Notatka: uczulenie na aceton" },
    { emoji: "💇", title: "Ewa S. — ostatnio: balayage blond", sub: "Prosi o cieplejszy odcień" },
  ],
  radar: [
    { emoji: "👑", title: "Top 1: Joanna M. — LTV 4 200 zł", sub: "14 wizyt, chroniona VIP" },
    { emoji: "⚠️", title: "Alicja R. — LTV 3 800 zł, zagrożona", sub: "Brak wizyty od 45 dni" },
  ],
  noshow: [
    { emoji: "1️⃣", title: "+30 min: \"Widzimy że nie dotarłaś...\"", sub: "Zaproponuj nowy termin" },
    { emoji: "2️⃣", title: "+24h: \"Mamy wolne miejsce jutro o...\"", sub: "Konkretna propozycja" },
    { emoji: "3️⃣", title: "+72h: \"-15% na kolejną wizytę\"", sub: "Ostatnia szansa" },
  ],
  ambassador: [
    { emoji: "🤫", title: "12 klientek z 5+ wizytami bez opinii", sub: "Wysyłamy delikatną prośbę SMS" },
    { emoji: "⭐", title: "Ostatni miesiąc: 4 nowe opinie Google", sub: "Dzięki Cichym Ambasadorom" },
  ],
  referral: [
    { emoji: "🔗", title: "Marta Z. poleciła 3 klientki", sub: "Zarobiłaś +450 zł z poleceń" },
    { emoji: "📱", title: "SMS: \"Podziel się rabatem -10% z koleżanką\"", sub: "Automatyczny link po 3. wizycie" },
  ],
};

const EXAMPLE_COLORS: Record<FunctionKey, { bg: string; border: string; titleColor: string; textColor: string; subColor: string }> = {
  vip: { bg: "bg-amber-50", border: "border-amber-100", titleColor: "text-amber-700", textColor: "text-amber-800", subColor: "text-amber-600" },
  slots: { bg: "bg-red-50", border: "border-red-100", titleColor: "text-red-700", textColor: "text-red-800", subColor: "text-red-600" },
  reminder: { bg: "bg-blue-50", border: "border-blue-100", titleColor: "text-blue-700", textColor: "text-blue-800", subColor: "text-blue-600" },
  radar: { bg: "bg-purple-50", border: "border-purple-100", titleColor: "text-purple-700", textColor: "text-purple-800", subColor: "text-purple-600" },
  noshow: { bg: "bg-orange-50", border: "border-orange-100", titleColor: "text-orange-700", textColor: "text-orange-800", subColor: "text-orange-600" },
  ambassador: { bg: "bg-pink-50", border: "border-pink-100", titleColor: "text-pink-700", textColor: "text-pink-800", subColor: "text-pink-600" },
  referral: { bg: "bg-green-50", border: "border-green-100", titleColor: "text-green-700", textColor: "text-green-800", subColor: "text-green-600" },
};

export function AutopilotFunctions({ isDemo }: AutopilotFunctionsProps) {
  const [enabledState, setEnabledState] = useState<Record<FunctionKey, boolean>>(() => {
    if (isDemo) {
      const init: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(DEMO_AUTOPILOT_DATA.functions)) {
        init[k] = v.enabled;
      }
      return init as Record<FunctionKey, boolean>;
    }
    return { vip: true, slots: true, reminder: true, radar: true, noshow: true, ambassador: true, referral: true };
  });

  const [justToggled, setJustToggled] = useState<string | null>(null);

  const handleToggle = (key: FunctionKey) => {
    setEnabledState(prev => ({ ...prev, [key]: !prev[key] }));
    if (!enabledState[key]) {
      setJustToggled(key);
      setTimeout(() => setJustToggled(null), 500);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Kliknij kartę aby skonfigurować. Przykłady pokazują jak będzie wyglądać z Twoimi danymi.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FUNCTIONS.map((fn) => {
          const enabled = enabledState[fn.key];
          const colors = EXAMPLE_COLORS[fn.key];

          return (
            <motion.div
              key={fn.key}
              animate={justToggled === fn.key ? { scale: [0.98, 1.02, 1] } : {}}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-2xl overflow-hidden transition-all duration-300",
                enabled
                  ? `bg-card border ${fn.borderColor}`
                  : "bg-gray-50 border border-gray-200"
              )}
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                      enabled ? fn.iconBg : "bg-gray-100"
                    )}>
                      <fn.icon className={cn(
                        "w-[18px] h-[18px] transition-all duration-300",
                        enabled ? fn.iconColor : "text-gray-300"
                      )} />
                    </div>
                    <div>
                      <p className={cn("font-semibold text-sm transition-colors duration-300", enabled ? "" : "text-gray-400")}>{fn.title}</p>
                      <p className="text-xs text-muted-foreground">{fn.schedule}</p>
                    </div>
                  </div>
                  <Switch checked={enabled} onCheckedChange={() => handleToggle(fn.key)} />
                </div>

                <p className={cn("text-sm mb-4 transition-colors duration-300", enabled ? "text-muted-foreground" : "text-gray-300")}>{fn.description}</p>

                <div className="relative">
                  {isDemo && enabled ? (
                    fn.renderExample()
                  ) : (
                    <div className={cn(
                      "rounded-xl p-4 transition-all duration-300",
                      enabled ? `${colors.bg} border ${colors.border}` : `${colors.bg} border ${colors.border} opacity-20`
                    )}>
                      <span className={cn("text-xs font-semibold uppercase tracking-wide", colors.titleColor)}>
                        Przykład — tak będzie wyglądać:
                      </span>
                      <div className="space-y-2 mt-3 opacity-60">
                        {(FALLBACK_EXAMPLES[fn.key] || []).map((ex, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <span className="flex-shrink-0">{ex.emoji}</span>
                            <div>
                              <p className={cn("text-sm font-medium", colors.textColor)}>{ex.title}</p>
                              <p className={cn("text-xs", colors.subColor)}>→ {ex.sub}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {!enabled && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
                      <p className="text-xs text-gray-400 font-medium">Wyłączone — kliknij toggle aby włączyć</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{fn.footer}</span>
                <Button variant="ghost" size="sm" className="text-xs h-7">Konfiguruj →</Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
