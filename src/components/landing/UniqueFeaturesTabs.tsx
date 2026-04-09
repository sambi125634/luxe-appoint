import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  RefreshCw,
  AlertOctagon,
  Heart,
  ShieldCheck,
  Bell,
  Repeat2,
  Smartphone,
  QrCode,
  Gift,
  Database,
  Tags,
  FlaskConical,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";

interface FeatureCard {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  metric: string;
  accentColor: string;
}

interface Tab {
  emoji: string;
  label: string;
  cards: FeatureCard[];
}

const ACCENT_CLASSES: Record<string, { bg: string; text: string; border: string; badgeBg: string; metricText: string }> = {
  violet: { bg: "bg-violet-100", text: "text-violet-600", border: "hover:border-violet-200", badgeBg: "bg-violet-50 text-violet-600 border-violet-200", metricText: "text-violet-600" },
  orange: { bg: "bg-orange-100", text: "text-orange-600", border: "hover:border-orange-200", badgeBg: "bg-orange-50 text-orange-600 border-orange-200", metricText: "text-orange-600" },
  pink: { bg: "bg-pink-100", text: "text-pink-600", border: "hover:border-pink-200", badgeBg: "bg-pink-50 text-pink-600 border-pink-200", metricText: "text-pink-600" },
  green: { bg: "bg-emerald-100", text: "text-emerald-600", border: "hover:border-emerald-200", badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200", metricText: "text-emerald-600" },
  blue: { bg: "bg-blue-100", text: "text-blue-600", border: "hover:border-blue-200", badgeBg: "bg-blue-50 text-blue-600 border-blue-200", metricText: "text-blue-600" },
  teal: { bg: "bg-teal-100", text: "text-teal-600", border: "hover:border-teal-200", badgeBg: "bg-teal-50 text-teal-600 border-teal-200", metricText: "text-teal-600" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", border: "hover:border-indigo-200", badgeBg: "bg-indigo-50 text-indigo-600 border-indigo-200", metricText: "text-indigo-600" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", border: "hover:border-rose-200", badgeBg: "bg-rose-50 text-rose-600 border-rose-200", metricText: "text-rose-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", border: "hover:border-amber-200", badgeBg: "bg-amber-50 text-amber-600 border-amber-200", metricText: "text-amber-600" },
};

const tabs: Tab[] = [
  {
    emoji: "😤",
    label: "Nie wróciła",
    cards: [
      {
        icon: RefreshCw,
        badge: "Retencja",
        title: "Sekwencja powrotu — 4 etapy",
        description: "System obserwuje każdą klientkę po wizycie. 14 dni ciszy → delikatne przypomnienie. 30 dni → oferta specjalna. 60 dni → rabat na powrót. 90 dni → ostatnia szansa. Ty ustawiasz treść raz — system działa bez przerwy. Nawet gdy śpisz.",
        metric: "67% klientek z sekwencją wraca",
        accentColor: "violet",
      },
      {
        icon: AlertOctagon,
        badge: "AI",
        title: "Radar Odejść — zanim zniknie",
        description: "AI analizuje wzorce każdej klientki i oznacza ją jako: bezpieczna, zagrożona lub krytyczna — zanim sama zdecyduje że odchodzi. Dostajesz alert z imieniem klientki i sugestią co wysłać. Reagujesz zanim stracisz wizytę.",
        metric: "Wykrywa ryzyko 3 tygodnie wcześniej",
        accentColor: "orange",
      },
      {
        icon: Heart,
        badge: "Lojalność",
        title: "Program lojalnościowy bez kart",
        description: "Cyfrowy licznik wizyt w tle każdej klientki. Po 5. wizycie: automatyczna wiadomość z nagrodą. 'Aniu, zarobiłaś darmowe malowanie 💜 Powiedz tylko że masz nagrodę przy kolejnej wizycie.' Bez fizycznych kart. Bez ręcznego liczenia. Klientka wraca bo wie że zbliża się do czegoś wyjątkowego.",
        metric: "Retencja +35% po wdrożeniu",
        accentColor: "pink",
      },
    ],
  },
  {
    emoji: "🪑",
    label: "Pusty fotel",
    cards: [
      {
        icon: ShieldCheck,
        badge: "No-show",
        title: "AI rozpoznaje ryzyko — wymaga zaliczki",
        description: "Klientka która nie przyszła 2 razy bez odwołania dostaje od AI oznaczenie 'wysokie ryzyko'. Przy kolejnej rezerwacji — system automatycznie wymaga zaliczki. Bez Twojej interwencji. Bez niezręcznej rozmowy. Klientka płaci z góry albo rezerwuje gdzie indziej.",
        metric: "-67% no-showów po pierwszym miesiącu",
        accentColor: "green",
      },
      {
        icon: Bell,
        badge: "Przypomnienia",
        title: "Przypomnienie które pamięta historię",
        description: "Nie wysyłamy 'Przypomnienie o wizycie jutro o 11:00'. Wysyłamy: 'Aniu, jutro o 11:00 czeka manicure 💅 Ostatnio wybrałaś Dusty Rose — mamy go gotowy!' Personalizacja na podstawie historii klientki. Jedno zdanie które mówi że ją pamiętasz.",
        metric: "Open rate SMS: 94%",
        accentColor: "blue",
      },
      {
        icon: Repeat2,
        badge: "Recovery",
        title: "No-show Recovery — trzyetapowy odzysk",
        description: "Klientka nie przyszła. 30 min później: 'Tęsknimy — czy wszystko OK? 🤍' 24h bez odpowiedzi: 3 propozycje wolnych terminów. 48h nadal bez rezerwacji: oferta specjalna tylko dla niej. Trzy etapy. Automatycznie. Bez Twojego udziału.",
        metric: "4 na 10 nieobecnych wraca",
        accentColor: "teal",
      },
    ],
  },
  {
    emoji: "📱",
    label: "Marka",
    cards: [
      {
        icon: Smartphone,
        badge: "Aplikacja",
        title: "Twoja klientka widzi tylko Ciebie",
        description: "Klientka pobiera aplikację Beauty Calendar i przypisuje się do Twojego salonu. Od tej chwili — widzi tylko Ciebie. Nie marketplace. Nie konkurencję. Nie reklamy innych salonów. Tylko Twoje usługi. Twoje terminy. Twoje powiadomienia. To Twój prywatny kanał do klientek — na zawsze.",
        metric: "Zero reklam konkurencji w aplikacji",
        accentColor: "violet",
      },
      {
        icon: QrCode,
        badge: "Widget",
        title: "Widget per kampania — wiesz co działa",
        description: "Osobny widget rezerwacji dla każdej reklamy. Instagram ma inny link niż strona www. Google Ads ma inny niż TikTok. Widzisz dokładnie: która kampania przyniosła ile rezerwacji i jaką wartość. Przestajesz przepalać budżet. Skalujesz to co działa.",
        metric: "Pełny tracking źródeł rezerwacji",
        accentColor: "indigo",
      },
      {
        icon: Gift,
        badge: "Polecenia",
        title: "Program poleceń z mierzalnym ROI",
        description: "Po 3. wizycie klientka dostaje swój unikalny link polecający. 'Za każdą nową klientkę — darmowe malowanie paznokci 💜' Widzisz: kliknięcia, rezerwacje, wartość każdego polecenia w złotych. Influencer marketing z mierzalnym ROI — w każdym salonie.",
        metric: "Średnie ROI programu: 5.4×",
        accentColor: "rose",
      },
    ],
  },
  {
    emoji: "📊",
    label: "Dane",
    cards: [
      {
        icon: Database,
        badge: "Eksport",
        title: "Eksport który jest wart cokolwiek",
        description: "__EXPORT__",
        metric: "100% danych — Twoich. Zawsze.",
        accentColor: "violet",
      },
      {
        icon: Tags,
        badge: "Segmentacja",
        title: "Grupy zakupowe — marketing bez zgadywania",
        description: "System automatycznie grupuje klientki według zachowań zakupowych: które kupują usługi powyżej 200 zł, które przychodzą regularnie co 4 tygodnie, które próbują nowych usług, które rezerwują tylko w weekendy. Tworzysz własne grupy według własnych kryteriów. Wysyłasz ofertę dokładnie do tych które na nią czekają. Nie do wszystkich 847 klientek naraz.",
        metric: "Laser-targeting bez agencji marketingowej",
        accentColor: "amber",
      },
      {
        icon: FlaskConical,
        badge: "Finanse",
        title: "True Profit — ile naprawdę zarabiasz",
        description: "Wpisujesz recepturę zabiegu raz. System odejmuje zużyte materiały ze stanu magazynowego i pokazuje ile NAPRAWDĘ zarabiasz na każdym zabiegu — nie przychód. Realny zysk po kosztach. Większość właścicielek odkrywa że ich 'najlepsza usługa' zarabia 3× mniej niż myślały. Teraz wiesz co promować — i dlaczego.",
        metric: "Koniec z domysłami finansowymi",
        accentColor: "teal",
      },
    ],
  },
];

function ExportDescription() {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          <span className="font-medium text-foreground/70">Booksy eksportuje:</span> imię, telefon, email. Koniec.
        </p>
      </div>
      <div className="border-l-2 border-primary/30 pl-3">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-primary">Beauty Calendar eksportuje:</span>{" "}
          <span className="text-muted-foreground">
            pełną historię każdej wizyty, wydane kwoty, preferencje, grupy zakupowe, częstotliwość wizyt, ostatnią usługę, notatki z kart konsultacyjnych.
          </span>
        </p>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        To nie jest lista kontaktów. To jest baza wiedzy o Twoich klientkach. Marketing który naprawdę trafia zaczyna się tutaj.
      </p>
    </div>
  );
}

function FeatureCardComponent({
  card,
  index,
  onHover,
  onLeave,
}: {
  card: FeatureCard;
  index: number;
  onHover: () => void;
  onLeave: () => void;
}) {
  const accent = ACCENT_CLASSES[card.accentColor] || ACCENT_CLASSES.violet;
  const Icon = card.icon;
  const isExport = card.description === "__EXPORT__";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={cn(
        "bg-white border border-gray-100 rounded-2xl p-6",
        "hover:shadow-lg hover:shadow-violet-50/50 transition-all duration-300",
        "hover:-translate-y-1 cursor-default",
        accent.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", accent.bg)}>
          <Icon className={cn("w-5 h-5", accent.text)} />
        </div>
        <span className={cn("text-[11px] font-medium px-2.5 py-1 rounded-full border", accent.badgeBg)}>
          {card.badge}
        </span>
      </div>

      <h4 className="font-bold text-[15px] text-foreground mb-2 leading-snug">{card.title}</h4>

      {isExport ? (
        <ExportDescription />
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
      )}

      <div className="border-t border-gray-100 mt-4 pt-3">
        <p className={cn("text-sm font-semibold", accent.metricText)}>→ {card.metric}</p>
      </div>
    </motion.div>
  );
}

export function UniqueFeaturesTabs() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const INTERVAL_MS = 8000;
  const TICK_MS = 50;

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((current) => (current + 1) % tabs.length);
          return 0;
        }
        return prev + (100 / (INTERVAL_MS / TICK_MS));
      });
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    setProgress(0);
  }, [activeTab]);

  const handleTabClick = useCallback((index: number) => {
    setActiveTab(index);
    setIsPaused(true);
    setProgress(0);
  }, []);

  const handleAreaEnter = useCallback(() => setIsPaused(true), []);
  const handleAreaLeave = useCallback(() => setIsPaused(false), []);

  const scrollToPricing = () => {
    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="py-16 md:py-20 lg:py-28">
      {/* Header */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-full px-4 py-1.5 mb-6">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-medium text-violet-600">Tylko u nas</span>
        </div>

        <h2 className="text-2xl md:text-4xl lg:text-[42px] font-bold leading-tight mb-4">
          <span className="text-primary">12 funkcji,</span> które same zarabiają za Ciebie
        </h2>

        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Każda rozwiązuje problem, który dziś kosztuje Cię{" "}
          <span className="text-foreground font-medium">czas i pieniądze.</span>
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <div className="flex items-center gap-1 md:gap-2 mb-8 md:mb-10 p-1 md:p-1.5 bg-gray-100 rounded-2xl max-w-2xl mx-auto">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              className={cn(
                "flex-1 flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 md:px-3 py-2.5 md:py-2.5 rounded-xl transition-all duration-300 text-xs md:text-sm font-semibold",
                activeTab === i
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : "text-gray-400 hover:text-gray-600 hover:bg-white/60"
              )}
            >
              <span className="text-base leading-none">{tab.emoji}</span>
              <span className="leading-none text-[10px] sm:text-xs md:text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto h-0.5 bg-gray-100 rounded-full overflow-hidden mb-8">
          <motion.div
            className="h-full bg-violet-400 rounded-full"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.05, ease: "linear" }}
          />
        </div>
      </motion.div>

      {/* Cards grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
          onMouseEnter={handleAreaEnter}
          onMouseLeave={handleAreaLeave}
        >
          {tabs[activeTab].cards.map((card, i) => (
            <FeatureCardComponent
              key={`${activeTab}-${i}`}
              card={card}
              index={i}
              onHover={handleAreaEnter}
              onLeave={handleAreaLeave}
            />
          ))}
        </motion.div>
      </AnimatePresence>

      {/* CTA */}
      <motion.div
        className="text-center mt-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-sm text-muted-foreground mb-5">
          To dopiero 12 z ponad 60 funkcji Beauty Calendar
        </p>
        <Button
          onClick={scrollToPricing}
          size="lg"
          className="rounded-full px-8 text-base"
        >
          Sprawdź cennik →
        </Button>
      </motion.div>
    </div>
  );
}