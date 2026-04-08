import { Star, CalendarOff, ScanLine, Users, UserX, Heart, Gift, BarChart3, TrendingUp, AlertTriangle, Sparkles, MousePointerClick, Award, BrainCircuit, ShieldCheck, Tags } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";

interface AutopilotFunctionsProps {
  isDemo?: boolean;
}

type FunctionKey = "vip" | "slots" | "reminder" | "radar" | "noshow" | "ambassador" | "referral"
  | "priceDetector" | "upsell" | "profitAlarm" | "firstVisitSequence" | "abandonedBooking"
  | "loyalty" | "vacationBrain" | "reviewGuard" | "priceChangeFollowup";

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

// ── EXISTING DEMO EXAMPLES ──

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
          <p className="text-sm text-orange-800">SMS: &quot;Tęsknimy! Czy wszystko OK? 🤍&quot;</p>
          <p className="text-xs text-green-600">Kasia odpisała po 2h ✓</p>
        </div>
        <div>
          <p className="text-xs text-orange-400 font-mono">● Jutro</p>
          <p className="text-sm text-orange-800">&quot;Mamy wolne: czw 10:00, pt 14:00&quot;</p>
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
          &quot;Madziu, jesteś z nami już 14 miesięcy 💜<br />
          Zawsze możemy na Ciebie liczyć. Czy poświęcisz 30 sekund na opinię?<br />
          <span className="text-pink-600 underline">[Zostaw opinię →]</span>&quot;
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
          &quot;Masz swój link polecający!<br />
          Za każdą nową klientkę — darmowe malowanie 💅<br />
          <span className="text-green-600 font-mono text-xs">studio.pl/ref/ania-k</span>&quot;
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

// ── NEW DEMO EXAMPLES ──

function DemoPriceDetectorExample() {
  return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">📊 Raport cenowy — kwiecień 2026</span>
      <div className="space-y-3 mt-3">
        <p className="text-xs font-semibold text-indigo-700 mb-1.5">Twoje ceny vs okolica (Mokotów, Warszawa):</p>
        <div className="space-y-2">
          <div className="bg-white rounded-lg p-2.5 border border-indigo-100">
            <p className="text-xs font-medium text-gray-800 mb-1">Manicure hybrydowy</p>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-gray-500">Ty:</span>
              <span className="font-bold">120 zł</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">Średnia:</span>
              <span>115 zł</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">Max:</span>
              <span>150 zł</span>
            </div>
            <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">↑ Możesz podnieść o 10 zł</span>
          </div>
          <div className="bg-white rounded-lg p-2.5 border border-red-100">
            <p className="text-xs font-medium text-gray-800 mb-1">Przedłużanie żelowe</p>
            <div className="flex items-center gap-2 text-xs mb-1">
              <span className="text-gray-500">Ty:</span>
              <span className="font-bold">200 zł</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">Średnia:</span>
              <span>230 zł</span>
              <span className="text-gray-400">·</span>
              <span className="text-gray-500">Max:</span>
              <span>280 zł</span>
            </div>
            <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">⚠️ Najtańsza w okolicy — tracisz 30 zł/wizytę</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-indigo-100">
          <p className="text-xs text-indigo-700 font-semibold">💡 Potencjał korekty cen: <span className="text-indigo-900">+640 zł/miesiąc</span></p>
        </div>
      </div>
    </div>
  );
}

function DemoUpsellExample() {
  return (
    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">📱 Jutro wyśle — Ania K. (manicure 11:00):</span>
      <div className="bg-white rounded-xl border border-emerald-200 p-3 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">BC</span>
          </div>
          <span className="text-xs font-semibold">Beauty Calendar</span>
          <span className="text-xs text-gray-400 ml-auto">teraz</span>
        </div>
        <p className="text-xs text-gray-800 leading-relaxed">
          Aniu, jutro o 11:00 czeka Twój manicure 💅
          <br /><br />
          Widzimy że ostatnio brałaś też stylizację brwi — mamy wolne 30 min po Twojej wizycie. Może przy okazji brwi? (-10% gdy dokupisz dziś)
          <br /><br />
          <span className="text-emerald-600 font-medium">Dodaj brwi →</span>
        </p>
      </div>
      <div className="mt-2 flex items-center gap-3 text-xs text-emerald-700">
        <span>📊 Ania brała brwi 3x wcześniej</span>
        <span className="text-emerald-400">·</span>
        <span>+80 zł jeśli przyjmie</span>
      </div>
      <div className="border-t border-emerald-200 mt-3 pt-2">
        <p className="text-xs text-emerald-600">Ten miesiąc: 23 wysłanych · 6 przyjętych · +480 zł</p>
      </div>
    </div>
  );
}

function DemoProfitAlarmExample() {
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">⚠️ Wykryta anomalia — 3 dni temu</span>
      <div className="space-y-2 mt-3">
        <div className="bg-white rounded-lg p-3 border border-amber-200">
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
    <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-violet-700 uppercase tracking-wide">✨ Sekwencja dla nowej klientki:</span>
      <div className="space-y-2 mt-3">
        {steps.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={cn("text-xs font-mono font-bold flex-shrink-0 w-8 mt-0.5", item.color === "green" ? "text-green-600" : "text-violet-600")}>
              {item.time}
            </span>
            <p className="text-xs text-gray-700 leading-relaxed">&quot;{item.msg}&quot;</p>
          </div>
        ))}
      </div>
      <div className="border-t border-violet-200 mt-3 pt-2">
        <p className="text-xs text-violet-600">Ten miesiąc: 12 nowych klientek · 9 wróciło (75% vs 45% bez sekwencji)</p>
      </div>
    </div>
  );
}

function DemoAbandonedBookingExample() {
  return (
    <div className="bg-cyan-50 border border-cyan-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-cyan-700 uppercase tracking-wide">🖱️ Dziś porzucone rezerwacje: 3</span>
      <div className="space-y-2 mt-3">
        <div className="bg-white rounded-lg p-3 border border-cyan-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-semibold">Kasia W. — manicure hybrydowy</p>
              <p className="text-xs text-gray-500">Środa 14:00 · Porzucone 23 min temu</p>
            </div>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏳ Za 7 min wyślę SMS</span>
          </div>
          <div className="bg-cyan-50 rounded-lg p-2 text-xs text-cyan-800 leading-relaxed border border-cyan-100">
            &quot;Kasiu, widzimy że byłaś blisko 💜 Termin na środę 14:00 nadal wolny — ale 2 osoby też go przeglądają. <span className="text-cyan-600 font-medium">Dokończ rezerwację →</span>&quot;
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
    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-rose-700 uppercase tracking-wide">🏆 Aktywne nagrody:</span>
      <div className="space-y-1.5 mt-3">
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
      <div className="bg-white rounded-lg p-2.5 border border-rose-100 mt-2">
        <p className="text-xs text-gray-500 mb-1">SMS po 5. wizycie Ani K.:</p>
        <p className="text-xs text-gray-800 leading-relaxed italic">&quot;Aniu, masz u nas już 5 wizyt! 🎉 Zarobiłaś darmowe malowanie. Powiedz tylko &apos;mam nagrodę&apos; przy kolejnej wizycie 💜&quot;</p>
      </div>
    </div>
  );
}

function DemoVacationBrainExample() {
  return (
    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-teal-700 uppercase tracking-wide">🌴 Przykład — raport dnia 3 z 7:</span>
      <div className="bg-white rounded-xl border border-teal-200 p-3 space-y-2 mt-3">
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
      <div className="mt-2">
        <p className="text-xs text-teal-500 italic">Aktywuje się automatycznie gdy Tryb Urlopowy jest włączony</p>
      </div>
    </div>
  );
}

function DemoReviewGuardExample() {
  return (
    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-sky-700 uppercase tracking-wide">🛡️ Jak to działa:</span>
      <div className="space-y-2 mt-3">
        <div className="space-y-1.5">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 rounded-full bg-sky-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-sky-700">1</span>
            </div>
            <p className="text-xs text-gray-700">Po wizycie SMS: <span className="italic">&quot;Jak oceniasz wizytę? Odpisz 1-5 💜&quot;</span></p>
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
    </div>
  );
}

function DemoPriceChangeFollowupExample() {
  return (
    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
      <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide">💛 Ostatnia aktywacja — 2 tygodnie temu:</span>
      <div className="space-y-2 mt-3">
        <div className="bg-white rounded-lg p-2.5 border border-orange-200">
          <p className="text-xs text-gray-500 mb-1.5">Trigger: cena manicure 120 zł → 135 zł (+15 zł)</p>
          <p className="text-xs text-gray-500 mb-1">SMS wysłany do 31 stałych klientek (5+ wizyt):</p>
          <p className="text-xs text-gray-800 leading-relaxed italic border-l-2 border-orange-300 pl-2">
            &quot;Aniu, od maja nasze ceny ulegną małej zmianie. Dla Ciebie — jako stałej klientki — stare ceny przez 60 dni 💜 Zarezerwuj teraz → [link]&quot;
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
    </div>
  );
}

// ── FUNCTION DEFINITIONS ──

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

const NEW_FUNCTIONS: FunctionDef[] = [
  {
    key: "priceDetector", icon: BarChart3, iconBg: "bg-indigo-100", iconColor: "text-indigo-600", borderColor: "border-indigo-200",
    title: "Detektor cenowy konkurencji", schedule: "Raz w miesiącu",
    description: "Porównuje Twoje ceny z konkurencją w okolicy i podpowiada gdzie możesz podnieść marżę.",
    footer: "Raz w miesiącu · Raport w aplikacji",
    renderExample: DemoPriceDetectorExample,
  },
  {
    key: "upsell", icon: TrendingUp, iconBg: "bg-emerald-100", iconColor: "text-emerald-600", borderColor: "border-emerald-200",
    title: "Inteligentny upsell przed wizytą", schedule: "24h przed każdą wizytą",
    description: "Analizuje historię klientki i proponuje dodatkowe usługi dopasowane do jej preferencji.",
    footer: "24h przed wizytą · SMS · historia klientki",
    renderExample: DemoUpsellExample,
  },
  {
    key: "profitAlarm", icon: AlertTriangle, iconBg: "bg-amber-100", iconColor: "text-amber-600", borderColor: "border-amber-200",
    title: "Alarm rentowności", schedule: "Codziennie",
    description: "Monitoruje zużycie produktów per zabieg i alertuje gdy koszty przekraczają normę o 30%+.",
    footer: "Codziennie · Alert gdy odchylenie > 30%",
    renderExample: DemoProfitAlarmExample,
  },
  {
    key: "firstVisitSequence", icon: Sparkles, iconBg: "bg-violet-100", iconColor: "text-violet-600", borderColor: "border-violet-200",
    title: "Sekwencja powitalna", schedule: "Przy pierwszej rezerwacji",
    description: "4-krokowa sekwencja SMS przed i po pierwszej wizycie — buduje relację od pierwszej chwili.",
    footer: "Pierwsza rezerwacja · SMS × 4 · auto",
    renderExample: DemoFirstVisitSequenceExample,
  },
  {
    key: "abandonedBooking", icon: MousePointerClick, iconBg: "bg-cyan-100", iconColor: "text-cyan-600", borderColor: "border-cyan-200",
    title: "Ratownik porzuconych rezerwacji", schedule: "30 min po porzuceniu",
    description: "Wykrywa porzucone rezerwacje w widgecie i wysyła SMS z zachętą do dokończenia.",
    footer: "30 min po porzuceniu · SMS · widget",
    renderExample: DemoAbandonedBookingExample,
  },
  {
    key: "loyalty", icon: Award, iconBg: "bg-rose-100", iconColor: "text-rose-600", borderColor: "border-rose-200",
    title: "Program lojalnościowy bez kart", schedule: "Po każdej N-tej wizycie",
    description: "Automatyczny system nagród za wizyty — bez fizycznych kart. Klientka dostaje SMS z nagrodą.",
    footer: "Po N-tej wizycie · SMS · bez fizycznych kart",
    renderExample: DemoLoyaltyExample,
  },
  {
    key: "vacationBrain", icon: BrainCircuit, iconBg: "bg-teal-100", iconColor: "text-teal-600", borderColor: "border-teal-200",
    title: "Drugi mózg podczas urlopu", schedule: "Codziennie o 20:00 (gdy urlop)",
    description: "Codzienny raport podczas Twojego urlopu — salon działa, Ty odpoczywasz.",
    footer: "Tylko podczas urlopu · 20:00 · Push + Email",
    renderExample: DemoVacationBrainExample,
  },
  {
    key: "reviewGuard", icon: ShieldCheck, iconBg: "bg-sky-100", iconColor: "text-sky-600", borderColor: "border-sky-200",
    title: "Strażnik reputacji Google", schedule: "2h po każdej wizycie",
    description: "Dwuetapowy SMS: zbiera ocenę, a potem kieruje zadowolone do Google lub alarmuje Ciebie.",
    footer: "2h po wizycie · SMS dwuetapowy",
    renderExample: DemoReviewGuardExample,
  },
  {
    key: "priceChangeFollowup", icon: Tags, iconBg: "bg-orange-100", iconColor: "text-orange-600", borderColor: "border-orange-200",
    title: "Amortyzator podwyżki cen", schedule: "Gdy zmienisz cennik",
    description: "Przy podwyżce cen wysyła stałym klientkom ofertę ze starymi cenami na 60 dni — zero odejść.",
    footer: "Przy każdej zmianie ceny · SMS · stałe klientki",
    renderExample: DemoPriceChangeFollowupExample,
  },
];

// Fallback examples for non-demo
const FALLBACK_EXAMPLES: Record<string, { emoji: string; title: string; sub: string }[]> = {
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
  priceDetector: [
    { emoji: "📊", title: "Porównanie cen w Twojej okolicy", sub: "Raport co miesiąc" },
  ],
  upsell: [
    { emoji: "📱", title: "SMS z upsell przed wizytą", sub: "Dopasowany do historii klientki" },
  ],
  profitAlarm: [
    { emoji: "⚠️", title: "Alert gdy koszty zabiegu rosną", sub: "Monitoruje zużycie produktów" },
  ],
  firstVisitSequence: [
    { emoji: "✨", title: "4 SMS-y przed/po pierwszej wizycie", sub: "Buduje relację od początku" },
  ],
  abandonedBooking: [
    { emoji: "🖱️", title: "SMS po porzuconej rezerwacji", sub: "30 min po porzuceniu" },
  ],
  loyalty: [
    { emoji: "🏆", title: "Automatyczne nagrody za wizyty", sub: "Bez fizycznych kart" },
  ],
  vacationBrain: [
    { emoji: "🌴", title: "Raport dzienny podczas urlopu", sub: "Salon działa, Ty odpoczywasz" },
  ],
  reviewGuard: [
    { emoji: "🛡️", title: "Filtruje opinie przed Google", sub: "Niezadowolone → do Ciebie" },
  ],
  priceChangeFollowup: [
    { emoji: "💛", title: "SMS do stałych przy podwyżce", sub: "Stare ceny przez 60 dni" },
  ],
};

const EXAMPLE_COLORS: Record<string, { bg: string; border: string; titleColor: string; textColor: string; subColor: string }> = {
  vip: { bg: "bg-amber-50", border: "border-amber-100", titleColor: "text-amber-700", textColor: "text-amber-800", subColor: "text-amber-600" },
  slots: { bg: "bg-red-50", border: "border-red-100", titleColor: "text-red-700", textColor: "text-red-800", subColor: "text-red-600" },
  reminder: { bg: "bg-blue-50", border: "border-blue-100", titleColor: "text-blue-700", textColor: "text-blue-800", subColor: "text-blue-600" },
  radar: { bg: "bg-purple-50", border: "border-purple-100", titleColor: "text-purple-700", textColor: "text-purple-800", subColor: "text-purple-600" },
  noshow: { bg: "bg-orange-50", border: "border-orange-100", titleColor: "text-orange-700", textColor: "text-orange-800", subColor: "text-orange-600" },
  ambassador: { bg: "bg-pink-50", border: "border-pink-100", titleColor: "text-pink-700", textColor: "text-pink-800", subColor: "text-pink-600" },
  referral: { bg: "bg-green-50", border: "border-green-100", titleColor: "text-green-700", textColor: "text-green-800", subColor: "text-green-600" },
  priceDetector: { bg: "bg-indigo-50", border: "border-indigo-100", titleColor: "text-indigo-700", textColor: "text-indigo-800", subColor: "text-indigo-600" },
  upsell: { bg: "bg-emerald-50", border: "border-emerald-100", titleColor: "text-emerald-700", textColor: "text-emerald-800", subColor: "text-emerald-600" },
  profitAlarm: { bg: "bg-amber-50", border: "border-amber-100", titleColor: "text-amber-700", textColor: "text-amber-800", subColor: "text-amber-600" },
  firstVisitSequence: { bg: "bg-violet-50", border: "border-violet-100", titleColor: "text-violet-700", textColor: "text-violet-800", subColor: "text-violet-600" },
  abandonedBooking: { bg: "bg-cyan-50", border: "border-cyan-100", titleColor: "text-cyan-700", textColor: "text-cyan-800", subColor: "text-cyan-600" },
  loyalty: { bg: "bg-rose-50", border: "border-rose-100", titleColor: "text-rose-700", textColor: "text-rose-800", subColor: "text-rose-600" },
  vacationBrain: { bg: "bg-teal-50", border: "border-teal-100", titleColor: "text-teal-700", textColor: "text-teal-800", subColor: "text-teal-600" },
  reviewGuard: { bg: "bg-sky-50", border: "border-sky-100", titleColor: "text-sky-700", textColor: "text-sky-800", subColor: "text-sky-600" },
  priceChangeFollowup: { bg: "bg-orange-50", border: "border-orange-100", titleColor: "text-orange-700", textColor: "text-orange-800", subColor: "text-orange-600" },
};

function renderFunctionCard(
  fn: FunctionDef,
  enabled: boolean,
  isDemo: boolean | undefined,
  justToggled: string | null,
  onToggle: (key: FunctionKey) => void,
) {
  const colors = EXAMPLE_COLORS[fn.key] || { bg: "bg-gray-50", border: "border-gray-100", titleColor: "text-gray-700", textColor: "text-gray-800", subColor: "text-gray-600" };

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
          <Switch checked={enabled} onCheckedChange={() => onToggle(fn.key)} />
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
}

export function AutopilotFunctions({ isDemo }: AutopilotFunctionsProps) {
  const allKeys = [...FUNCTIONS, ...NEW_FUNCTIONS].map(f => f.key);
  const [enabledState, setEnabledState] = useState<Record<string, boolean>>(() => {
    if (isDemo) {
      const init: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(DEMO_AUTOPILOT_DATA.functions)) {
        init[k] = v.enabled;
      }
      return init;
    }
    const init: Record<string, boolean> = {};
    allKeys.forEach(k => { init[k] = true; });
    return init;
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
        {FUNCTIONS.map((fn) => renderFunctionCard(fn, !!enabledState[fn.key], isDemo, justToggled, handleToggle))}

        {/* Separator */}
        <div className="col-span-1 lg:col-span-2 flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-500" />
            Nowe funkcje
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {NEW_FUNCTIONS.map((fn) => renderFunctionCard(fn, !!enabledState[fn.key], isDemo, justToggled, handleToggle))}
      </div>
    </div>
  );
}
