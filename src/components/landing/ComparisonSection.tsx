import { useState } from "react";
import { Check, X, AlertTriangle, ChevronDown, Brain, Calculator, Scan, TrendingUp, Users, FileText, Shield, Gift, Layout, Target, Sparkles, BarChart3, Heart, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type FeatureStatus = boolean | "partial" | string;

interface ComparisonRow {
  feature: string;
  icon?: React.ElementType;
  bc: FeatureStatus;
  marketplace: FeatureStatus;
  highlight?: boolean;
  description?: string;
  group: "pricing" | "unique" | "shared";
}

const comparisonData: ComparisonRow[] = [
  // Pricing rows
  {
    feature: "Prowizja od rezerwacji",
    bc: "0%",
    marketplace: "0–45% (Boost)",
    highlight: true,
    group: "pricing",
    description: "Marketplace pobiera do 45% prowizji od nowych klientek pozyskanych przez funkcję Boost. Beauty Calendar — zero prowizji. Zawsze."
  },
  {
    feature: "Koszt podstawowy (miesięcznie)",
    bc: "od 99 zł netto",
    marketplace: "145 zł + 35 zł/os",
    highlight: true,
    group: "pricing",
    description: "Marketplace liczy 145 zł netto za pakiet podstawowy + 35 zł za każdego dodatkowego pracownika. U nas — stała cena, bez opłat per-head."
  },
  // Unique BC features
  {
    feature: "Własność bazy danych",
    icon: Shield,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Twoja baza klientek jest Twoja. Eksportujesz ją jednym kliknięciem. Żadna platforma nie może Ci jej zabrać ani ograniczyć dostępu."
  },
  {
    feature: "Prywatna aplikacja mobilna",
    icon: Layout,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Twoje klientki widzą tylko Twój salon — nie konkurencję obok. Aplikacja z Twoim brandem, bez reklam innych salonów."
  },
  {
    feature: "AI Autopilot (12 funkcji)",
    icon: Brain,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Automatyczne wypełnianie luk w grafiku, wykrywanie cichych fanek, predykcja odejść, inteligentne urodziny, upsell w rezerwacji — 12 funkcji AI które pracują za Ciebie 24/7."
  },
  {
    feature: "True Profit per zabieg",
    icon: Calculator,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Dodajesz składniki receptury do zabiegu. System automatycznie oblicza realny zysk po odliczeniu materiałów — nie przychód, a prawdziwy profit."
  },
  {
    feature: "Receptury zabiegowe",
    icon: Package,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Każdy zabieg ma przypisaną recepturę — ile ml farby, ile g rozjaśniacza. Magazyn aktualizuje się automatycznie po każdej wizycie."
  },
  {
    feature: "Skaner kodów kamerą",
    icon: Scan,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Skanuj kody kreskowe aparatem telefonu — przyjmuj dostawy, sprawdzaj stany, koryguj magazyn. Bez dodatkowego sprzętu."
  },
  {
    feature: "Prognoza przychodów AI",
    icon: TrendingUp,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "AI analizuje trendy rezerwacji i przewiduje Twoje przychody na następne 30/60/90 dni. Trafność: 94% na podstawie danych historycznych."
  },
  {
    feature: "Automatyczna segmentacja",
    icon: Users,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "System sam przypisuje tagi: VIP, zagrożona odejściem, nowa klientka, no-show. Nie musisz ręcznie tagować — AI robi to za Ciebie."
  },
  {
    feature: "Ścieżka Klientki™ + Auto-zaliczki",
    icon: Target,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Wizualna ścieżka od pierwszej wizyty do stałej klientki (5 etapów). Automatyczne wymaganie zaliczki dla klientek z historią no-showów."
  },
  {
    feature: "Retencja — strefy zagrożenia",
    icon: Heart,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Radar odejść pokazuje klientki w strefie żółtej (dawno nie było) i czerwonej (zaraz odejdą). Automatyczne SMS/email zanim będzie za późno."
  },
  {
    feature: "Program poleceń z ROI",
    icon: Gift,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Każda klientka dostaje unikalny link polecający. Widzisz ile klientek przyprowadziła, ile zarobiłaś dzięki niej. Mierzalny ROI, nie życzeniowe 'poleć nas'."
  },
  {
    feature: "Widget per kampania",
    icon: Sparkles,
    bc: true,
    marketplace: false,
    group: "unique",
    description: "Tworzysz osobny widget rezerwacji dla każdej kampanii — inny na Instagram, inny na stronę, inny na Google Ads. Mierzysz konwersję każdego źródła."
  },
  // Shared features
  {
    feature: "Karty konsultacyjne",
    icon: FileText,
    bc: true,
    marketplace: "partial",
    group: "shared",
    description: "U nas: pełny builder z własnymi polami, red-flags, podpisem elektronicznym. Marketplace ma prostsze formularze zgody."
  },
  {
    feature: "Auto-zaliczki (no-show)",
    icon: Shield,
    bc: true,
    marketplace: "partial",
    group: "shared",
    description: "U nas: automatyczne reguły (np. po 2. no-show wymagaj zaliczki). Marketplace: ręczne kaucje/przedpłaty."
  },
  {
    feature: "CRM z tagami i historią",
    bc: true,
    marketplace: true,
    group: "shared",
    description: "Obie platformy oferują CRM z tagami klientów, kartami, notatkami i historią wizyt."
  },
  {
    feature: "SMS + email automatyzacja",
    bc: true,
    marketplace: true,
    group: "shared",
    description: "Obie platformy oferują kampanie SMS/email i zautomatyzowany marketing."
  },
  {
    feature: "Zarządzanie magazynem",
    bc: true,
    marketplace: true,
    group: "shared",
    description: "Obie platformy oferują podstawowe zarządzanie stanami magazynowymi produktów."
  },
  {
    feature: "Raporty sprzedaży",
    icon: BarChart3,
    bc: true,
    marketplace: true,
    group: "shared",
    description: "Obie platformy generują raporty sprzedażowe i finansowe."
  },
  {
    feature: "Karty lojalnościowe",
    bc: true,
    marketplace: true,
    group: "shared",
    description: "Obie platformy oferują program lojalnościowy / karty stałego klienta."
  },
];

const StatusIcon = ({ status, isHighlight, isBc }: { status: FeatureStatus; isHighlight?: boolean; isBc?: boolean }) => {
  if (status === true) {
    return (
      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="w-4 h-4 text-emerald-600" />
      </div>
    );
  }
  if (status === false) {
    return (
      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
        <X className="w-4 h-4 text-rose-600" />
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
        <AlertTriangle className="w-4 h-4 text-amber-600" />
      </div>
    );
  }
  return (
    <span className={cn(
      "text-sm font-medium",
      isHighlight && isBc && "text-emerald-600 font-bold",
      isHighlight && !isBc && "text-rose-600 font-bold"
    )}>
      {status}
    </span>
  );
};

const FeatureRow = ({ row, index }: { row: ComparisonRow; index: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasDescription = !!row.description;
  const Icon = row.icon;

  return (
    <>
      <tr
        onClick={() => hasDescription && setIsOpen(!isOpen)}
        className={cn(
          "border-b border-border/50 transition-colors",
          hasDescription && "cursor-pointer hover:bg-muted/30",
          index % 2 === 0 && "bg-muted/10",
          row.highlight && "bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/20",
          isOpen && "bg-primary/5"
        )}
      >
        <td className={cn(
          "py-3.5 px-4 font-medium text-sm",
          row.highlight && "text-rose-600 font-bold"
        )}>
          <div className="flex items-center gap-2">
            {hasDescription && (
              <ChevronDown className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
                isOpen && "rotate-180"
              )} />
            )}
            {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
            <span>{row.feature}</span>
          </div>
        </td>
        <td className="py-3.5 px-4">
          <div className="flex justify-center">
            <StatusIcon status={row.bc} isHighlight={row.highlight} isBc={true} />
          </div>
        </td>
        <td className="py-3.5 px-4">
          <div className="flex justify-center">
            <StatusIcon status={row.marketplace} isHighlight={row.highlight} />
          </div>
        </td>
      </tr>
      <AnimatePresence>
        {isOpen && row.description && (
          <tr>
            <td colSpan={3} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-6 py-3 text-sm text-muted-foreground bg-muted/20 border-b border-border/30">
                  {row.description}
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

export const ComparisonSection = () => {
  const pricingRows = comparisonData.filter(r => r.group === "pricing");
  const uniqueRows = comparisonData.filter(r => r.group === "unique");
  const sharedRows = comparisonData.filter(r => r.group === "shared");

  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/20">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Uczciwe porównanie
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Co dostajesz u nas,{" "}
            <span className="text-gradient-luxury">czego nie ma nigdzie indziej.</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Ceny i funkcje oparte na publicznie dostępnych cennikach. Kliknij wiersz po szczegóły.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b-2 border-border">
                <th className="text-left py-4 px-4 font-semibold text-sm">Funkcja</th>
                <th className="py-4 px-4 text-center w-32">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Beauty Calendar
                  </Badge>
                </th>
                <th className="py-4 px-4 text-center w-32 font-semibold text-sm text-muted-foreground">
                  Marketplace
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Pricing */}
              {pricingRows.map((row, i) => (
                <FeatureRow key={row.feature} row={row} index={i} />
              ))}

              {/* Unique header */}
              <tr>
                <td colSpan={3} className="px-4 pt-6 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-primary">
                    Tylko w Beauty Calendar ({uniqueRows.length})
                  </p>
                </td>
              </tr>
              {uniqueRows.map((row, i) => (
                <FeatureRow key={row.feature} row={row} index={i} />
              ))}

              {/* Shared header */}
              <tr>
                <td colSpan={3} className="px-4 pt-6 pb-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Wspólne funkcje
                  </p>
                </td>
              </tr>
              {sharedRows.map((row, i) => (
                <FeatureRow key={row.feature} row={row} index={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-6 mt-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-emerald-600" />
            </div>
            <span>Pełna funkcjonalność</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
            </div>
            <span>Ograniczona</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center">
              <X className="w-2.5 h-2.5 text-rose-600" />
            </div>
            <span>Brak</span>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          Dane porównawcze oparte na publicznie dostępnych cennikach i stronach funkcji (stan na 2026).
          Prowizja 45% dotyczy usługi Boost (nowe klientki z marketplace), nie wszystkich wizyt.
        </p>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button
            onClick={scrollToForm}
            size="lg"
            className="rounded-full px-8 text-base"
          >
            Zacznij za darmo — przekonaj się sama
          </Button>
        </div>
      </div>
    </section>
  );
};
