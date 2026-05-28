import {
  Star, CalendarOff, ScanLine, Users, UserX, Heart, Gift,
  BarChart3, TrendingUp, AlertTriangle, Sparkles, MousePointerClick,
  Award, BrainCircuit, ShieldCheck, Tags, Settings2, Radio,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";
import { AutopilotConfigSheet, FUNCTION_CONFIGS } from "./AutopilotConfigSheet";
import { FlashOfertaCard } from "./FlashOfertaCard";
import { PogodowyTriggerCard } from "./PogodowyTriggerCard";
import { useAutopilotConfig, useUpdateAutopilotConfig } from "@/hooks/useAutopilot";
import {
  useAutopilotModuleStats,
  MODULE_KEY_MAP,
  formatLastRun,
  type AutopilotModuleStatsRow,
} from "@/hooks/useAutopilotModuleStats";

interface AutopilotFunctionsProps {
  isDemo?: boolean;
}

type FunctionKey = "vip" | "slots" | "reminder" | "radar" | "noshow" | "ambassador" | "referral"
  | "priceDetector" | "upsell" | "profitAlarm" | "firstVisitSequence" | "abandonedBooking"
  | "loyalty" | "vacationBrain" | "reviewGuard" | "priceChangeFollowup";

interface FunctionColors {
  accentBg: string;
  iconBg: string;
  iconColor: string;
  previewBg: string;
  previewBorder: string;
  accentDot: string;
  accentText: string;
  accentTextHover: string;
}

interface FunctionDef {
  key: FunctionKey;
  icon: React.ElementType;
  colors: FunctionColors;
  title: string;
  schedule: string;
  description: string;
  channel: string;
  renderExample: () => React.ReactNode;
}

// ── COLOR SETS ──

const COLORS: Record<string, FunctionColors> = {
  vip: { accentBg: "bg-amber-400", iconBg: "bg-amber-100", iconColor: "text-amber-600", previewBg: "bg-amber-50", previewBorder: "border-amber-200", accentDot: "bg-amber-500", accentText: "text-amber-700", accentTextHover: "text-amber-600 hover:text-amber-700" },
  slots: { accentBg: "bg-red-400", iconBg: "bg-red-100", iconColor: "text-red-500", previewBg: "bg-red-50", previewBorder: "border-red-200", accentDot: "bg-red-500", accentText: "text-red-700", accentTextHover: "text-red-600" },
  reminder: { accentBg: "bg-blue-400", iconBg: "bg-blue-100", iconColor: "text-blue-600", previewBg: "bg-blue-50", previewBorder: "border-blue-200", accentDot: "bg-blue-500", accentText: "text-blue-700", accentTextHover: "text-blue-600" },
  radar: { accentBg: "bg-purple-400", iconBg: "bg-purple-100", iconColor: "text-purple-600", previewBg: "bg-purple-50", previewBorder: "border-purple-200", accentDot: "bg-purple-500", accentText: "text-purple-700", accentTextHover: "text-purple-600" },
  noshow: { accentBg: "bg-orange-400", iconBg: "bg-orange-100", iconColor: "text-orange-600", previewBg: "bg-orange-50", previewBorder: "border-orange-200", accentDot: "bg-orange-500", accentText: "text-orange-700", accentTextHover: "text-orange-600" },
  ambassador: { accentBg: "bg-pink-400", iconBg: "bg-pink-100", iconColor: "text-pink-600", previewBg: "bg-pink-50", previewBorder: "border-pink-200", accentDot: "bg-pink-500", accentText: "text-pink-700", accentTextHover: "text-pink-600" },
  referral: { accentBg: "bg-green-400", iconBg: "bg-green-100", iconColor: "text-green-600", previewBg: "bg-green-50", previewBorder: "border-green-200", accentDot: "bg-green-500", accentText: "text-green-700", accentTextHover: "text-green-600" },
  priceDetector: { accentBg: "bg-indigo-400", iconBg: "bg-indigo-100", iconColor: "text-indigo-600", previewBg: "bg-indigo-50", previewBorder: "border-indigo-200", accentDot: "bg-indigo-500", accentText: "text-indigo-700", accentTextHover: "text-indigo-600" },
  upsell: { accentBg: "bg-emerald-400", iconBg: "bg-emerald-100", iconColor: "text-emerald-600", previewBg: "bg-emerald-50", previewBorder: "border-emerald-200", accentDot: "bg-emerald-500", accentText: "text-emerald-700", accentTextHover: "text-emerald-600" },
  profitAlarm: { accentBg: "bg-amber-500", iconBg: "bg-amber-100", iconColor: "text-amber-700", previewBg: "bg-amber-50", previewBorder: "border-amber-200", accentDot: "bg-amber-600", accentText: "text-amber-800", accentTextHover: "text-amber-700" },
  firstVisitSequence: { accentBg: "bg-violet-400", iconBg: "bg-violet-100", iconColor: "text-violet-600", previewBg: "bg-violet-50", previewBorder: "border-violet-200", accentDot: "bg-violet-500", accentText: "text-violet-700", accentTextHover: "text-violet-600" },
  abandonedBooking: { accentBg: "bg-cyan-400", iconBg: "bg-cyan-100", iconColor: "text-cyan-600", previewBg: "bg-cyan-50", previewBorder: "border-cyan-200", accentDot: "bg-cyan-500", accentText: "text-cyan-700", accentTextHover: "text-cyan-600" },
  loyalty: { accentBg: "bg-rose-400", iconBg: "bg-rose-100", iconColor: "text-rose-600", previewBg: "bg-rose-50", previewBorder: "border-rose-200", accentDot: "bg-rose-500", accentText: "text-rose-700", accentTextHover: "text-rose-600" },
  vacationBrain: { accentBg: "bg-teal-400", iconBg: "bg-teal-100", iconColor: "text-teal-600", previewBg: "bg-teal-50", previewBorder: "border-teal-200", accentDot: "bg-teal-500", accentText: "text-teal-700", accentTextHover: "text-teal-600" },
  reviewGuard: { accentBg: "bg-sky-400", iconBg: "bg-sky-100", iconColor: "text-sky-600", previewBg: "bg-sky-50", previewBorder: "border-sky-200", accentDot: "bg-sky-500", accentText: "text-sky-700", accentTextHover: "text-sky-600" },
  priceChangeFollowup: { accentBg: "bg-orange-500", iconBg: "bg-orange-100", iconColor: "text-orange-700", previewBg: "bg-orange-50", previewBorder: "border-orange-200", accentDot: "bg-orange-600", accentText: "text-orange-800", accentTextHover: "text-orange-700" },
};

// ── DEMO EXAMPLES ──

function DemoVIPExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">⭐ Jutro masz 3 wyjątkowe klientki:</span>
      <div className="space-y-3 mt-1">
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
      <div className="border-t border-amber-200 pt-2">
        <p className="text-xs text-amber-600">Ten tydzień: 2 urodziny obsłużone · 1 VIP odzyskana</p>
      </div>
    </div>
  );
}

function DemoSlotsExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">📅 Wykryte puste sloty:</span>
      <div className="space-y-3 mt-1">
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
      <div className="border-t border-red-200 pt-2">
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
    <div className="space-y-3">
      <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Porównanie:</span>
      <div className="grid grid-cols-2 gap-3 mt-1">
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
      <div className="border-t border-blue-200 pt-2 space-y-1">
        <p className="text-xs text-blue-600">Ola P. — ostatnio: hybryda nude #12 · uczulenie na aceton</p>
        <p className="text-xs text-blue-600">Ewa S. — ostatnio: balayage blond · prosi o cieplejszy odcień</p>
      </div>
    </div>
  );
}

function DemoRadarExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">💎 TOP klientki tego tygodnia:</span>
      <div className="space-y-3 mt-1">
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
      <div className="border-t border-purple-200 pt-2">
        <p className="text-xs text-purple-600">Łącznie chronione klientki VIP: 23</p>
      </div>
    </div>
  );
}

function DemoNoshowExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">🔄 Ostatni odzysk — Kasia M.:</span>
      <div className="space-y-2 mt-1 ml-2 border-l-2 border-orange-200 pl-4">
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
      <div className="border-t border-orange-200 pt-2 space-y-1">
        <p className="text-xs text-orange-600">Ten miesiąc: 6 no-showów → 4 wróciły</p>
        <p className="text-sm font-bold text-green-600">Odzyskano: 720 zł</p>
      </div>
    </div>
  );
}

function DemoAmbassadorExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-pink-700 uppercase tracking-wide">🌟 Zidentyfikowano 18 Cichych Ambasadorów</span>
      <div className="mt-1 bg-white border border-pink-200 rounded-lg p-3">
        <p className="text-[10px] text-pink-400 mb-1">Do: Magda W. (6 wizyt · 0✗)</p>
        <p className="text-sm text-pink-800 leading-relaxed">
          "Madziu, jesteś z nami już 14 miesięcy 💜<br />
          Zawsze możemy na Ciebie liczyć. Czy poświęcisz 30 sekund na opinię?<br />
          <span className="text-pink-600 underline">[Zostaw opinię →]</span>"
        </p>
      </div>
      <div className="border-t border-pink-200 pt-2">
        <p className="text-xs text-pink-600">Ten tydzień: 4 nowe opinie ★★★★★</p>
      </div>
    </div>
  );
}

function DemoReferralExample() {
  return (
    <div className="space-y-3">
      <div className="bg-white border border-green-200 rounded-lg p-3">
        <p className="text-[10px] text-green-400 mb-1">Do: Ania K. (3. wizyta 🎉)</p>
        <p className="text-sm text-green-800 leading-relaxed">
          "Masz swój link polecający!<br />
          Za każdą nową klientkę — darmowe malowanie 💅<br />
          <span className="text-green-600 font-mono text-xs">studio.pl/ref/ania-k</span>"
        </p>
      </div>
      <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Ten miesiąc:</span>
      <div className="grid grid-cols-2 gap-2">
        <p className="text-xs text-green-700">31 aktywnych linków</p>
        <p className="text-xs text-green-700">14 kliknięć · 6 rezerwacji</p>
        <p className="text-xs text-green-700">Wartość: 1 080 zł</p>
        <p className="text-sm font-bold text-green-600">ROI: 5.4×</p>
      </div>
    </div>
  );
}

function DemoPriceDetectorExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">📊 Raport cenowy — kwiecień 2026</span>
      <p className="text-xs font-semibold text-indigo-700 mb-1.5">Twoje ceny vs okolica (Mokotów, Warszawa):</p>
      <div className="space-y-2">
        <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
          <p className="text-xs font-medium text-gray-800 mb-1">Manicure hybrydowy</p>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="text-gray-500">Ty:</span><span className="font-bold">120 zł</span>
            <span className="text-gray-400">·</span><span className="text-gray-500">Średnia:</span><span>115 zł</span>
            <span className="text-gray-400">·</span><span className="text-gray-500">Max:</span><span>150 zł</span>
          </div>
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">↑ Możesz podnieść o 10 zł</span>
        </div>
        <div className="bg-white rounded-lg p-2.5 border border-red-100">
          <p className="text-xs font-medium text-gray-800 mb-1">Przedłużanie żelowe</p>
          <div className="flex items-center gap-2 text-xs mb-1">
            <span className="text-gray-500">Ty:</span><span className="font-bold">200 zł</span>
            <span className="text-gray-400">·</span><span className="text-gray-500">Średnia:</span><span>230 zł</span>
            <span className="text-gray-400">·</span><span className="text-gray-500">Max:</span><span>280 zł</span>
          </div>
          <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">⚠️ Najtańsza w okolicy — tracisz 30 zł/wizytę</span>
        </div>
      </div>
      <div className="border-t border-indigo-100 pt-2">
        <p className="text-xs text-indigo-700 font-semibold">💡 Potencjał korekty cen: <span className="text-indigo-900">+640 zł/miesiąc</span></p>
      </div>
    </div>
  );
}

function DemoUpsellExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">📱 Jutro wyśle — Ania K. (manicure 11:00):</span>
      <div className="bg-white rounded-xl border border-emerald-200 p-3 mt-1">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">BC</span>
          </div>
          <span className="text-xs font-semibold">Beauty Calendar</span>
          <span className="text-xs text-gray-400 ml-auto">teraz</span>
        </div>
        <p className="text-xs text-gray-800 leading-relaxed">
          Aniu, jutro o 11:00 czeka Twój manicure 💅<br /><br />
          Widzimy że ostatnio brałaś też stylizację brwi — mamy wolne 30 min po Twojej wizycie. Może przy okazji brwi? (-10% gdy dokupisz dziś)<br /><br />
          <span className="text-emerald-600 font-medium">Dodaj brwi →</span>
        </p>
      </div>
      <div className="flex items-center gap-3 text-xs text-emerald-700">
        <span>📊 Ania brała brwi 3x wcześniej</span>
        <span className="text-emerald-400">·</span>
        <span>+80 zł jeśli przyjmie</span>
      </div>
      <div className="border-t border-emerald-200 pt-2">
        <p className="text-xs text-emerald-600">Ten miesiąc: 23 wysłanych · 6 przyjętych · +480 zł</p>
      </div>
    </div>
  );
}

function DemoProfitAlarmExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">⚠️ Wykryta anomalia — 3 dni temu</span>
      <div className="bg-white rounded-lg p-3 border border-amber-200 mt-1">
        <p className="text-xs font-semibold text-amber-800 mb-2">Przedłużanie żelowe — zużycie produktów</p>
        <div className="grid grid-cols-2 gap-2 text-xs mb-2">
          <div className="bg-green-50 rounded p-1.5 text-center">
            <p className="text-gray-500">Normalnie</p>
            <p className="font-bold text-green-700">~22 zł/zabieg</p>
          </div>
          <div className="bg-red-50 rounded p-1.5 text-center">
            <p className="text-gray-500">Środa</p>
            <p className="font-bold text-red-700">~39 zł/zabieg</p>
          </div>
        </div>
        <p className="text-xs text-amber-700 font-medium">→ Sprawdź stylistkę pracującą w środy</p>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-amber-700">Potencjalna strata miesięczna:</span>
        <span className="font-bold text-red-600">-680 zł</span>
      </div>
    </div>
  );
}

function DemoFirstVisitSequenceExample() {
  const steps = [
    { time: "-48h", msg: "Aniu, już niedługo! Jak przygotować się do manicure hybrydowego → [poradnik]", color: "violet" },
    { time: "-24h", msg: "Jutro Cię widzimy! Masz pytania? Napisz — odpiszemy w ciągu godziny 💜", color: "violet" },
    { time: "-2h", msg: "Za 2h! Salon: ul. Piękna 12. Parking w podwórzu → [Google Maps]", color: "violet" },
    { time: "+2h", msg: "Aniu, jak Ci się podobało? Twoja opinia jest dla nas ważna → [link]", color: "green" },
  ];
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">✨ Sekwencja dla nowej klientki:</span>
      <div className="space-y-2 mt-1">
        {steps.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={cn("text-xs font-mono font-bold flex-shrink-0 w-8 mt-0.5", item.color === "green" ? "text-green-600" : "text-violet-600")}>
              {item.time}
            </span>
            <p className="text-xs text-gray-700 leading-relaxed">"{item.msg}"</p>
          </div>
        ))}
      </div>
      <div className="border-t border-violet-200 pt-2">
        <p className="text-xs text-violet-600">Ten miesiąc: 12 nowych klientek · 9 wróciło (75% vs 45% bez sekwencji)</p>
      </div>
    </div>
  );
}

function DemoAbandonedBookingExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">🖱️ Dziś porzucone rezerwacje: 3</span>
      <div className="bg-white rounded-lg p-3 border border-cyan-200 mt-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-semibold">Kasia W. — manicure hybrydowy</p>
            <p className="text-xs text-gray-500">Środa 14:00 · Porzucone 23 min temu</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏳ Za 7 min</span>
        </div>
        <div className="bg-cyan-50 rounded-lg p-2 text-xs text-cyan-800 leading-relaxed border border-cyan-100">
          "Kasiu, widzimy że byłaś blisko 💜 Termin na środę 14:00 nadal wolny — ale 2 osoby też go przeglądają. <span className="text-cyan-600 font-medium">Dokończ rezerwację →</span>"
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { val: "18", label: "wysłanych" },
          { val: "5", label: "wróciły" },
          { val: "28%", label: "skuteczność" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-lg p-1.5 border border-cyan-100">
            <p className="text-sm font-bold text-cyan-700">{s.val}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemoLoyaltyExample() {
  const levels = [
    { visits: 5, reward: "Darmowe malowanie paznokci", active: 3, color: "amber" },
    { visits: 10, reward: "Zabieg pielęgnacyjny gratis", active: 1, color: "violet" },
    { visits: 20, reward: "VIP — stałe -10% od zawsze", active: 0, color: "rose" },
  ];
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">🏆 Aktywne nagrody:</span>
      <div className="space-y-1.5 mt-1">
        {levels.map((level, i) => (
          <div key={i} className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-rose-100">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded-full",
                level.color === "amber" && "bg-amber-100 text-amber-700",
                level.color === "violet" && "bg-violet-100 text-violet-700",
                level.color === "rose" && "bg-rose-100 text-rose-700",
              )}>{level.visits}×</span>
              <p className="text-xs text-gray-700">{level.reward}</p>
            </div>
            {level.active > 0 && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">{level.active} do odebrania</span>
            )}
          </div>
        ))}
      </div>
      <div className="bg-white rounded-lg p-2.5 border border-rose-100">
        <p className="text-xs text-gray-500 mb-1">SMS po 5. wizycie Ani K.:</p>
        <p className="text-xs text-gray-800 leading-relaxed italic">"Aniu, masz u nas już 5 wizyt! 🎉 Zarobiłaś darmowe malowanie. Powiedz tylko 'mam nagrodę' przy kolejnej wizycie 💜"</p>
      </div>
    </div>
  );
}

function DemoVacationBrainExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">🌴 Przykład — raport dnia 3 z 7:</span>
      <div className="bg-white rounded-xl border border-teal-200 p-3 space-y-2 mt-1">
        <div className="flex items-center justify-between mb-1">
          <p className="text-xs font-semibold text-teal-800">☀️ Dzień 3 z 7 — salon działa!</p>
          <span className="text-xs text-teal-500">20:00</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { val: "8", label: "wizyt dziś" },
            { val: "1 840 zł", label: "przychód" },
            { val: "3", label: "po powrocie" },
          ].map((s, i) => (
            <div key={i} className="bg-teal-50 rounded-lg p-1.5 text-center">
              <p className="text-xs font-bold text-teal-800">{s.val}</p>
              <p className="text-xs text-teal-600">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="text-xs text-gray-600 bg-amber-50 rounded-lg p-2 border border-amber-100">
          <span className="font-medium">1 uwaga:</span> Kasia M. zapytała o wcześniejszy termin w piątek. Odpowiedziałam że sprawdzisz po powrocie.
        </div>
        <p className="text-xs text-teal-600 text-center font-medium">Odpoczywaj spokojnie 🌴</p>
      </div>
      <p className="text-xs text-teal-500 italic">Aktywuje się automatycznie gdy Tryb Urlopowy jest włączony</p>
    </div>
  );
}

function DemoReviewGuardExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">🛡️ Jak to działa:</span>
      <div className="space-y-1.5 mt-1">
        <div className="flex items-start gap-2">
          <div className="w-5 h-5 rounded-full bg-sky-200 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-xs font-bold text-sky-700">1</span>
          </div>
          <p className="text-xs text-gray-700">Po wizycie SMS: <span className="italic">"Jak oceniasz wizytę? Odpisz 1-5 💜"</span></p>
        </div>
        <div className="ml-2.5 pl-4 border-l-2 border-dashed border-sky-200 grid grid-cols-2 gap-2">
          <div className="bg-green-50 rounded-lg p-2 border border-green-100">
            <p className="text-xs font-semibold text-green-700 mb-1">★★★★★ (4-5)</p>
            <p className="text-xs text-green-600">→ Automatyczna prośba o Google</p>
          </div>
          <div className="bg-red-50 rounded-lg p-2 border border-red-100">
            <p className="text-xs font-semibold text-red-700 mb-1">★★☆☆☆ (1-3)</p>
            <p className="text-xs text-red-600">→ Alert dla Ciebie. Zadzwoń zanim trafi do Google.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg p-2.5 border border-sky-100">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div>
            <p className="font-bold text-sky-700">47</p>
            <p className="text-gray-500">ankiet</p>
          </div>
          <div>
            <p className="font-bold text-green-600">+18 ★★★★★</p>
            <p className="text-gray-500">Google</p>
          </div>
          <div>
            <p className="font-bold text-red-500">3</p>
            <p className="text-gray-500">uratowanych</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DemoPriceChangeFollowupExample() {
  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">💛 Ostatnia aktywacja — 2 tygodnie temu:</span>
      <div className="bg-white rounded-lg p-2.5 border border-orange-200 mt-1">
        <p className="text-xs text-gray-500 mb-1.5">Trigger: cena manicure 120 zł → 135 zł (+15 zł)</p>
        <p className="text-xs text-gray-500 mb-1">SMS wysłany do 31 stałych klientek (5+ wizyt):</p>
        <p className="text-xs text-gray-800 leading-relaxed italic border-l-2 border-orange-300 pl-2">
          "Aniu, od maja nasze ceny ulegną małej zmianie. Dla Ciebie — jako stałej klientki — stare ceny przez 60 dni 💜 Zarezerwuj teraz → [link]"
        </p>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {[
          { val: "31", label: "SMS wysłanych" },
          { val: "14", label: "zarezerwowało" },
          { val: "0", label: "odejść" },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-lg p-1.5 text-center border border-orange-100">
            <p className="text-sm font-bold text-orange-700">{s.val}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-orange-700 font-medium">💡 14 rezerwacji po starych cenach = bufor przychodu w miesiącu zmiany</p>
    </div>
  );
}

// ── FUNCTION DEFINITIONS ──

const FUNCTIONS: FunctionDef[] = [
  { key: "vip", icon: Star, colors: COLORS.vip, title: "Klientka VIP na jutro", schedule: "Codziennie o 20:00", description: "Dostajesz wieczorne podsumowanie wyjątkowych klientek na jutro — urodziny, jubileusze, zagrożone odejściem.", channel: "Push + Email", renderExample: DemoVIPExample },
  { key: "slots", icon: CalendarOff, colors: COLORS.slots, title: "Martwe godziny", schedule: "Co poniedziałek o 8:00", description: "Analiza pustych slotów w grafiku z ostatnich 3 tygodni. Proponuje promocje flash na te terminy.", channel: "Raport + SMS do klientek", renderExample: DemoSlotsExample },
  { key: "reminder", icon: ScanLine, colors: COLORS.reminder, title: "Pamięta zabieg", schedule: "Przed każdą wizytą", description: "Automatycznie przypomina, co klientka miała ostatnio, jakie produkty użyto, jakie były uwagi.", channel: "Push do stylistki", renderExample: DemoReminderExample },
  { key: "radar", icon: Users, colors: COLORS.radar, title: "Radar wartości", schedule: "Co tydzień", description: "Identyfikuje klientki o najwyższej wartości życiowej (LTV) i monitoruje ich lojalność.", channel: "Dashboard + Push", renderExample: DemoRadarExample },
  { key: "noshow", icon: UserX, colors: COLORS.noshow, title: "No-show Recovery", schedule: "30 min po nieobecności", description: "Automatyczna sekwencja 3 wiadomości po nieobecności: przypomnienie → oferta → ostatnia szansa.", channel: "SMS sekwencja", renderExample: DemoNoshowExample },
  { key: "ambassador", icon: Heart, colors: COLORS.ambassador, title: "Cichy Ambasador", schedule: "Po 5. wizycie", description: "Wykrywa lojalne klientki (5+ wizyt) bez opinii Google i delikatnie prosi o recenzję.", channel: "SMS + Link do Google", renderExample: DemoAmbassadorExample },
  { key: "referral", icon: Gift, colors: COLORS.referral, title: "Efekt Kuli Śnieżnej", schedule: "Po 3. wizycie", description: "Program poleceń: po 3. wizycie klientka dostaje link polecający. Za każde polecenie — rabat.", channel: "SMS z linkiem", renderExample: DemoReferralExample },
];

const NEW_FUNCTIONS: FunctionDef[] = [
  { key: "priceDetector", icon: BarChart3, colors: COLORS.priceDetector, title: "Detektor cenowy konkurencji", schedule: "Raz w miesiącu", description: "Porównuje Twoje ceny z konkurencją w okolicy i podpowiada gdzie możesz podnieść marżę.", channel: "Raport w aplikacji", renderExample: DemoPriceDetectorExample },
  { key: "upsell", icon: TrendingUp, colors: COLORS.upsell, title: "Inteligentny upsell przed wizytą", schedule: "24h przed każdą wizytą", description: "Analizuje historię klientki i proponuje dodatkowe usługi dopasowane do jej preferencji.", channel: "SMS · historia klientki", renderExample: DemoUpsellExample },
  { key: "profitAlarm", icon: AlertTriangle, colors: COLORS.profitAlarm, title: "Alarm rentowności", schedule: "Codziennie", description: "Monitoruje zużycie produktów per zabieg i alertuje gdy koszty przekraczają normę o 30%+.", channel: "Alert gdy odchylenie > 30%", renderExample: DemoProfitAlarmExample },
  { key: "firstVisitSequence", icon: Sparkles, colors: COLORS.firstVisitSequence, title: "Sekwencja powitalna", schedule: "Przy pierwszej rezerwacji", description: "4-krokowa sekwencja SMS przed i po pierwszej wizycie — buduje relację od pierwszej chwili.", channel: "SMS × 4 · auto", renderExample: DemoFirstVisitSequenceExample },
  { key: "abandonedBooking", icon: MousePointerClick, colors: COLORS.abandonedBooking, title: "Ratownik porzuconych rezerwacji", schedule: "30 min po porzuceniu", description: "Wykrywa porzucone rezerwacje w widgecie i wysyła SMS z zachętą do dokończenia.", channel: "SMS · widget", renderExample: DemoAbandonedBookingExample },
  { key: "loyalty", icon: Award, colors: COLORS.loyalty, title: "Program lojalnościowy bez kart", schedule: "Po każdej N-tej wizycie", description: "Automatyczny system nagród za wizyty — bez fizycznych kart. Klientka dostaje SMS z nagrodą.", channel: "SMS · bez fizycznych kart", renderExample: DemoLoyaltyExample },
  { key: "vacationBrain", icon: BrainCircuit, colors: COLORS.vacationBrain, title: "Drugi mózg podczas urlopu", schedule: "Codziennie o 20:00 (gdy urlop)", description: "Codzienny raport podczas Twojego urlopu — salon działa, Ty odpoczywasz.", channel: "Push + Email", renderExample: DemoVacationBrainExample },
  { key: "reviewGuard", icon: ShieldCheck, colors: COLORS.reviewGuard, title: "Strażnik reputacji Google", schedule: "2h po każdej wizycie", description: "Dwuetapowy SMS: zbiera ocenę, a potem kieruje zadowolone do Google lub alarmuje Ciebie.", channel: "SMS dwuetapowy", renderExample: DemoReviewGuardExample },
  { key: "priceChangeFollowup", icon: Tags, colors: COLORS.priceChangeFollowup, title: "Amortyzator podwyżki cen", schedule: "Gdy zmienisz cennik", description: "Przy podwyżce cen wysyła stałym klientkom ofertę ze starymi cenami na 60 dni — zero odejść.", channel: "SMS · stałe klientki", renderExample: DemoPriceChangeFollowupExample },
];

// ── FALLBACK EXAMPLES ──

const FALLBACK_EXAMPLES: Record<string, { emoji: string; title: string; sub: string }[]> = {
  vip: [
    { emoji: "🎂", title: "Anna K. — jutro urodziny", sub: "SMS z życzeniami czeka" },
    { emoji: "💎", title: "Magda W. — 5. wizyta z rzędu", sub: "Zaproponuj kartę stałej klientki" },
  ],
  slots: [
    { emoji: "📊", title: "Wtorek 14:00–16:00 — pusto 3 tygodnie", sub: "Wyślij promocję -20% na ten slot" },
  ],
  reminder: [
    { emoji: "💅", title: "Ola P. — ostatnio: hybryda nude #12", sub: "Notatka: uczulenie na aceton" },
  ],
  radar: [
    { emoji: "👑", title: "Top 1: Joanna M. — LTV 4 200 zł", sub: "14 wizyt, chroniona VIP" },
  ],
  noshow: [
    { emoji: "1️⃣", title: "+30 min: \"Widzimy że nie dotarłaś...\"", sub: "Zaproponuj nowy termin" },
  ],
  ambassador: [
    { emoji: "🤫", title: "12 klientek z 5+ wizytami bez opinii", sub: "Wysyłamy delikatną prośbę SMS" },
  ],
  referral: [
    { emoji: "🔗", title: "Marta Z. poleciła 3 klientki", sub: "Zarobiłaś +450 zł z poleceń" },
  ],
  priceDetector: [{ emoji: "📊", title: "Porównanie cen w Twojej okolicy", sub: "Raport co miesiąc" }],
  upsell: [{ emoji: "📱", title: "SMS z upsell przed wizytą", sub: "Dopasowany do historii klientki" }],
  profitAlarm: [{ emoji: "⚠️", title: "Alert gdy koszty zabiegu rosną", sub: "Monitoruje zużycie produktów" }],
  firstVisitSequence: [{ emoji: "✨", title: "4 SMS-y przed/po pierwszej wizycie", sub: "Buduje relację od początku" }],
  abandonedBooking: [{ emoji: "🖱️", title: "SMS po porzuconej rezerwacji", sub: "30 min po porzuceniu" }],
  loyalty: [{ emoji: "🏆", title: "Automatyczne nagrody za wizyty", sub: "Bez fizycznych kart" }],
  vacationBrain: [{ emoji: "🌴", title: "Raport dzienny podczas urlopu", sub: "Salon działa, Ty odpoczywasz" }],
  reviewGuard: [{ emoji: "🛡️", title: "Filtruje opinie przed Google", sub: "Niezadowolone → do Ciebie" }],
  priceChangeFollowup: [{ emoji: "💛", title: "SMS do stałych przy podwyżce", sub: "Stare ceny przez 60 dni" }],
};

// ── CARD RENDERER ──

function FunctionCard({
  fn,
  enabled,
  isDemo,
  onToggle,
  onConfigure,
}: {
  fn: FunctionDef;
  enabled: boolean;
  isDemo: boolean | undefined;
  onToggle: (key: FunctionKey) => void;
  onConfigure: (key: string) => void;
}) {
  const controls = useAnimation();
  const c = fn.colors;

  const handleToggle = () => {
    const newValue = !enabled;
    onToggle(fn.key);
    if (newValue) {
      controls.start({
        scale: [1, 0.98, 1.02, 1],
        transition: { duration: 0.4 },
      });
    }
  };

  return (
    <motion.div
      animate={controls}
      className={cn(
        "rounded-2xl overflow-hidden border bg-card transition-all duration-300 flex flex-col",
        enabled ? "border-border shadow-sm" : "border-gray-200 bg-gray-50/50"
      )}
    >
      {/* Card body with left accent */}
      <div className="flex flex-1">
        {/* Left accent bar */}
        <div
          className={cn(
            "w-1 flex-shrink-0 rounded-l-2xl transition-colors duration-300",
            enabled ? c.accentBg : "bg-gray-200"
          )}
        />

        {/* Content */}
        <div className="flex-1 p-5 pl-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-2.5">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                  enabled ? c.iconBg : "bg-gray-100"
                )}
              >
                <fn.icon
                  className={cn(
                    "w-[18px] h-[18px] transition-all duration-300",
                    enabled ? c.iconColor : "text-gray-300"
                  )}
                />
              </div>
              <div>
                <p
                  className={cn(
                    "font-semibold text-sm transition-colors duration-300",
                    enabled ? "text-foreground" : "text-gray-400"
                  )}
                >
                  {fn.title}
                </p>
                <p className="text-xs text-muted-foreground">{fn.schedule}</p>
              </div>
            </div>
            <Switch checked={enabled} onCheckedChange={handleToggle} />
          </div>

          {/* Description */}
          <p
            className={cn(
              "text-sm mb-4 transition-colors duration-300",
              enabled ? "text-muted-foreground" : "text-gray-300"
            )}
          >
            {fn.description}
          </p>

          {/* Preview */}
          <div
            className={cn(
              "rounded-xl border p-4 transition-all duration-300",
              enabled ? `${c.previewBg} ${c.previewBorder}` : "bg-gray-50 border-gray-200"
            )}
          >
            {/* Preview label */}
            <div className="mb-3">
              {enabled ? (
                <div className="flex items-center gap-1.5">
                  <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", c.accentDot)} />
                  <span className={cn("text-[10px] font-semibold uppercase tracking-wider", c.accentText)}>
                    Podgląd na żywo
                  </span>
                </div>
              ) : (
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                  Wyłączone — kliknij toggle aby włączyć
                </span>
              )}
            </div>

            {/* Preview content */}
            <div
              className={cn(
                "transition-all duration-300",
                !enabled && "blur-[2px] opacity-40"
              )}
            >
              {isDemo && enabled ? (
                fn.renderExample()
              ) : (
                <div className="space-y-2 opacity-60">
                  {(FALLBACK_EXAMPLES[fn.key] || []).map((ex, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0">{ex.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{ex.title}</p>
                        <p className="text-xs text-muted-foreground">→ {ex.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-muted/20 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{fn.channel}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => enabled && onConfigure(fn.key)}
          className={cn(
            "h-7 text-xs font-medium gap-1.5 hover:bg-background",
            enabled ? c.accentTextHover : "text-gray-300 pointer-events-none"
          )}
        >
          <Settings2 className="w-3.5 h-3.5" />
          Konfiguruj
        </Button>
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ──

export function AutopilotFunctions({ isDemo }: AutopilotFunctionsProps) {
  const [enabledState, setEnabledState] = useState<Record<string, boolean>>(() => {
    if (isDemo) {
      const init: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(DEMO_AUTOPILOT_DATA.functions)) {
        init[k] = v.enabled;
      }
      return init;
    }
    const init: Record<string, boolean> = {};
    [...FUNCTIONS, ...NEW_FUNCTIONS].forEach((f) => {
      init[f.key] = true;
    });
    return init;
  });

  const [configSheetOpen, setConfigSheetOpen] = useState(false);
  const [activeFunction, setActiveFunction] = useState<string | null>(null);

  const handleToggle = (key: FunctionKey) => {
    setEnabledState((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleConfigureClick = (functionId: string) => {
    setActiveFunction(functionId);
    setConfigSheetOpen(true);
  };

  const activeFnDef = activeFunction
    ? [...FUNCTIONS, ...NEW_FUNCTIONS].find((f) => f.key === activeFunction)
    : null;

  return (
    <div className="space-y-4">
      <FlashOfertaCard isDemo={isDemo} />
      <PogodowyTriggerCard isDemo={isDemo} />
      <p className="text-sm text-muted-foreground">
        Kliknij "Konfiguruj" aby dostosować każdą funkcję. Przykłady pokazują jak będzie wyglądać z Twoimi danymi.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {FUNCTIONS.map((fn) => (
          <FunctionCard
            key={fn.key}
            fn={fn}
            enabled={!!enabledState[fn.key]}
            isDemo={isDemo}
            onToggle={handleToggle}
            onConfigure={handleConfigureClick}
          />
        ))}

        {/* Separator */}
        <div className="col-span-1 lg:col-span-2 flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-500" />
            Nowe funkcje
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {NEW_FUNCTIONS.map((fn) => (
          <FunctionCard
            key={fn.key}
            fn={fn}
            enabled={!!enabledState[fn.key]}
            isDemo={isDemo}
            onToggle={handleToggle}
            onConfigure={handleConfigureClick}
          />
        ))}
      </div>

      {/* Config Sheet */}
      <AutopilotConfigSheet
        isOpen={configSheetOpen}
        onClose={() => {
          setConfigSheetOpen(false);
          setActiveFunction(null);
        }}
        functionId={activeFunction}
        config={activeFunction ? FUNCTION_CONFIGS[activeFunction] || null : null}
        enabled={activeFunction ? !!enabledState[activeFunction] : false}
        iconBg={activeFnDef?.colors.iconBg || ""}
        iconColor={activeFnDef?.colors.iconColor || ""}
        icon={activeFnDef?.icon || null}
      />
    </div>
  );
}
