import { Star, CalendarOff, ScanLine, Users, UserX, Heart, Gift } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface FunctionCardProps {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  schedule: string;
  description: string;
  exampleTitle: string;
  exampleBg: string;
  exampleBorder: string;
  exampleTitleColor: string;
  exampleTextColor: string;
  exampleSubColor: string;
  examples: { emoji: string; title: string; sub: string }[];
  footer: string;
}

function FunctionCard({ icon: Icon, iconBg, iconColor, title, schedule, description, exampleTitle, exampleBg, exampleBorder, exampleTitleColor, exampleTextColor, exampleSubColor, examples, footer }: FunctionCardProps) {
  const [enabled, setEnabled] = useState(true);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
              <Icon className={`w-[18px] h-[18px] ${iconColor}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">{title}</p>
              <p className="text-xs text-muted-foreground">{schedule}</p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        <p className="text-sm text-muted-foreground mb-4">{description}</p>

        <div className={`${exampleBg} border ${exampleBorder} rounded-xl p-4`}>
          <span className={`text-xs font-semibold ${exampleTitleColor} uppercase tracking-wide`}>
            {exampleTitle}
          </span>
          <div className="space-y-2 mt-3 opacity-60">
            {examples.map((ex, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex-shrink-0">{ex.emoji}</span>
                <div>
                  <p className={`text-sm font-medium ${exampleTextColor}`}>{ex.title}</p>
                  <p className={`text-xs ${exampleSubColor}`}>→ {ex.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{footer}</span>
        <Button variant="ghost" size="sm" className="text-xs h-7">Konfiguruj →</Button>
      </div>
    </div>
  );
}

const FUNCTIONS: FunctionCardProps[] = [
  {
    icon: Star, iconBg: "bg-amber-100", iconColor: "text-amber-600",
    title: "Klientka VIP na jutro", schedule: "Codziennie o 20:00",
    description: "Dostajesz wieczorne podsumowanie wyjątkowych klientek na jutro — urodziny, jubileusze, zagrożone odejściem.",
    exampleTitle: "Przykład — tak będzie wyglądać:",
    exampleBg: "bg-amber-50", exampleBorder: "border-amber-100",
    exampleTitleColor: "text-amber-700", exampleTextColor: "text-amber-800", exampleSubColor: "text-amber-600",
    examples: [
      { emoji: "🎂", title: "Anna K. — jutro urodziny", sub: "SMS z życzeniami czeka" },
      { emoji: "💎", title: "Magda W. — 5. wizyta z rzędu", sub: "Zaproponuj kartę stałej klientki" },
      { emoji: "💤", title: "Kasia M. — 8 tyg. nieobecności", sub: "Wysłaliśmy ofertę. Przyjdzie jutro." },
    ],
    footer: "Godzina: 20:00 · Push + Email",
  },
  {
    icon: CalendarOff, iconBg: "bg-red-100", iconColor: "text-red-600",
    title: "Martwe godziny", schedule: "Co poniedziałek o 8:00",
    description: "Analiza pustych slotów w grafiku z ostatnich 3 tygodni. Proponuje promocje flash na te terminy.",
    exampleTitle: "Przykład:",
    exampleBg: "bg-red-50", exampleBorder: "border-red-100",
    exampleTitleColor: "text-red-700", exampleTextColor: "text-red-800", exampleSubColor: "text-red-600",
    examples: [
      { emoji: "📊", title: "Wtorek 14:00–16:00 — pusto 3 tygodnie", sub: "Wyślij promocję -20% na ten slot" },
      { emoji: "📊", title: "Czwartek 10:00–11:00 — pusto 2 tygodnie", sub: "Zaproponuj nową usługę ekspresową" },
    ],
    footer: "Poniedziałek 8:00 · Raport + SMS do klientek",
  },
  {
    icon: ScanLine, iconBg: "bg-blue-100", iconColor: "text-blue-600",
    title: "Pamięta zabieg", schedule: "Przed każdą wizytą",
    description: "Automatycznie przypomina, co klientka miała ostatnio, jakie produkty użyto, jakie były uwagi.",
    exampleTitle: "Przykład:",
    exampleBg: "bg-blue-50", exampleBorder: "border-blue-100",
    exampleTitleColor: "text-blue-700", exampleTextColor: "text-blue-800", exampleSubColor: "text-blue-600",
    examples: [
      { emoji: "💅", title: "Ola P. — ostatnio: hybryda nude #12", sub: "Notatka: uczulenie na aceton" },
      { emoji: "💇", title: "Ewa S. — ostatnio: balayage blond", sub: "Prosi o cieplejszy odcień" },
    ],
    footer: "Automatycznie · Push do stylistki",
  },
  {
    icon: Users, iconBg: "bg-purple-100", iconColor: "text-purple-600",
    title: "Radar wartości", schedule: "Co tydzień",
    description: "Identyfikuje klientki o najwyższej wartości życiowej (LTV) i monitoruje ich lojalność.",
    exampleTitle: "Przykład:",
    exampleBg: "bg-purple-50", exampleBorder: "border-purple-100",
    exampleTitleColor: "text-purple-700", exampleTextColor: "text-purple-800", exampleSubColor: "text-purple-600",
    examples: [
      { emoji: "👑", title: "Top 1: Joanna M. — LTV 4 200 zł", sub: "14 wizyt, chroniona VIP" },
      { emoji: "⚠️", title: "Alicja R. — LTV 3 800 zł, zagrożona", sub: "Brak wizyty od 45 dni" },
    ],
    footer: "Co tydzień · Dashboard + Push",
  },
  {
    icon: UserX, iconBg: "bg-orange-100", iconColor: "text-orange-600",
    title: "No-show Recovery", schedule: "30 min po nieobecności",
    description: "Automatyczna sekwencja 3 wiadomości po nieobecności: przypomnienie → oferta → ostatnia szansa.",
    exampleTitle: "Sekwencja przykładowa:",
    exampleBg: "bg-orange-50", exampleBorder: "border-orange-100",
    exampleTitleColor: "text-orange-700", exampleTextColor: "text-orange-800", exampleSubColor: "text-orange-600",
    examples: [
      { emoji: "1️⃣", title: '+30 min: "Widzimy że nie dotarłaś..."', sub: "Zaproponuj nowy termin" },
      { emoji: "2️⃣", title: '+24h: "Mamy wolne miejsce jutro o..."', sub: "Konkretna propozycja" },
      { emoji: "3️⃣", title: '+72h: "-15% na kolejną wizytę"', sub: "Ostatnia szansa" },
    ],
    footer: "Automatycznie · SMS sekwencja",
  },
  {
    icon: Heart, iconBg: "bg-pink-100", iconColor: "text-pink-600",
    title: "Cichy Ambasador", schedule: "Po 5. wizycie",
    description: "Wykrywa lojalne klientki (5+ wizyt) bez opinii Google i delikatnie prosi o recenzję.",
    exampleTitle: "Przykład:",
    exampleBg: "bg-pink-50", exampleBorder: "border-pink-100",
    exampleTitleColor: "text-pink-700", exampleTextColor: "text-pink-800", exampleSubColor: "text-pink-600",
    examples: [
      { emoji: "🤫", title: "12 klientek z 5+ wizytami bez opinii", sub: "Wysyłamy delikatną prośbę SMS" },
      { emoji: "⭐", title: "Ostatni miesiąc: 4 nowe opinie Google", sub: "Dzięki Cichym Ambasadorom" },
    ],
    footer: "Po 5. wizycie · SMS + Link do Google",
  },
  {
    icon: Gift, iconBg: "bg-green-100", iconColor: "text-green-600",
    title: "Efekt Kuli Śnieżnej", schedule: "Po 3. wizycie",
    description: "Program poleceń: po 3. wizycie klientka dostaje link polecający. Za każde polecenie — rabat.",
    exampleTitle: "Przykład:",
    exampleBg: "bg-green-50", exampleBorder: "border-green-100",
    exampleTitleColor: "text-green-700", exampleTextColor: "text-green-800", exampleSubColor: "text-green-600",
    examples: [
      { emoji: "🔗", title: "Marta Z. poleciła 3 klientki", sub: "Zarobiłaś +450 zł z poleceń" },
      { emoji: "📱", title: 'SMS: "Podziel się rabatem -10% z koleżanką"', sub: "Automatyczny link po 3. wizycie" },
    ],
    footer: "Po 3. wizycie · SMS z linkiem",
  },
];

export function AutopilotFunctions() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Kliknij kartę aby skonfigurować. Przykłady pokazują jak będzie wyglądać z Twoimi danymi.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FUNCTIONS.map((fn, i) => (
          <FunctionCard key={i} {...fn} />
        ))}
      </div>
    </div>
  );
}
