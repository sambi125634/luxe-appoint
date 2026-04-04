import { motion } from "framer-motion";
import {
  Brain,
  Calculator,
  Scan,
  TrendingUp,
  Users,
  FileText,
  Shield,
  Gift,
  Layout,
  Target,
  Sparkles,
  Heart,
  Package,
  Check,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const uniqueFeatures = [
  {
    icon: Brain,
    title: "AI Autopilot (12 funkcji)",
    description:
      "Automatyczne wypełnianie luk w grafiku, predykcja odejść, inteligentne urodziny, upsell w rezerwacji — 12 funkcji AI które pracują za Ciebie 24/7.",
  },
  {
    icon: Calculator,
    title: "True Profit per zabieg",
    description:
      "Dodajesz składniki receptury do zabiegu. System automatycznie oblicza realny zysk po odliczeniu materiałów — nie przychód, a prawdziwy profit.",
  },
  {
    icon: Heart,
    title: "Retencja — strefy zagrożenia",
    description:
      "Radar odejść pokazuje klientki w strefie żółtej i czerwonej. Automatyczne SMS/email zanim klientka odejdzie na dobre.",
  },
  {
    icon: TrendingUp,
    title: "Prognoza przychodów AI",
    description:
      "AI analizuje trendy rezerwacji i przewiduje Twoje przychody na 30/60/90 dni. Trafność: 94%.",
  },
  {
    icon: Shield,
    title: "Własność bazy danych",
    description:
      "Twoja baza klientek jest Twoja. Eksport jednym kliknięciem. Żadna platforma nie może Ci jej zabrać.",
  },
  {
    icon: Layout,
    title: "Prywatna aplikacja mobilna",
    description:
      "Twoje klientki widzą tylko Twój salon — nie konkurencję obok. Bez reklam innych salonów.",
  },
  {
    icon: Users,
    title: "Automatyczna segmentacja",
    description:
      "System sam przypisuje tagi: VIP, zagrożona, nowa, no-show. AI taguje za Ciebie.",
  },
  {
    icon: Package,
    title: "Receptury zabiegowe",
    description:
      "Każdy zabieg ma przypisaną recepturę. Magazyn aktualizuje się automatycznie po każdej wizycie.",
  },
  {
    icon: Scan,
    title: "Skaner kodów kamerą",
    description:
      "Skanuj kody kreskowe aparatem telefonu — przyjmuj dostawy, sprawdzaj stany. Bez dodatkowego sprzętu.",
  },
  {
    icon: Target,
    title: "Ścieżka Klientki™ + Auto-zaliczki",
    description:
      "Wizualna ścieżka od pierwszej wizyty do stałej klientki. Automatyczne zaliczki dla no-showów.",
  },
  {
    icon: Gift,
    title: "Program poleceń z ROI",
    description:
      "Każda klientka dostaje unikalny link. Widzisz ile klientek przyprowadziła i ile zarobiłaś dzięki niej.",
  },
  {
    icon: Sparkles,
    title: "Widget per kampania",
    description:
      "Osobny widget rezerwacji dla każdej kampanii — Instagram, strona, Google Ads. Mierzysz konwersję każdego źródła.",
  },
];

export const ComparisonSection = () => {
  const scrollToForm = () => {
    document.getElementById("lead-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/20" id="comparison">
      <div className="container max-w-5xl">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Uczciwe porównanie
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Co dostajesz u nas,{" "}
            <span className="text-gradient-luxury">czego nie ma nigdzie indziej.</span>
          </h2>
        </motion.div>

        {/* Pricing knockout — two cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* BC card */}
          <div className="relative rounded-2xl border-2 border-primary bg-card p-6 md:p-8 shadow-lg">
            <Badge className="absolute -top-3 left-6 bg-primary text-primary-foreground text-xs px-3">
              Beauty Calendar
            </Badge>
            <div className="mt-2">
              <div className="text-4xl md:text-5xl font-black text-foreground">
                99 <span className="text-lg font-medium text-muted-foreground">zł netto/mies</span>
              </div>
              <div className="flex items-center gap-2 mt-3 text-emerald-600 font-semibold">
                <Check className="w-5 h-5" />
                <span>0% prowizji — zawsze</span>
              </div>
              <div className="flex items-center gap-2 mt-1.5 text-emerald-600 font-semibold">
                <Check className="w-5 h-5" />
                <span>Stała cena, bez opłat per-head</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground border-t border-border pt-4">
                Twoje dane. Twoja baza. Twój brand.<br />
                Zabierasz kiedy chcesz.
              </p>
            </div>
          </div>

          {/* Marketplace card */}
          <div className="rounded-2xl border border-border bg-muted/30 p-6 md:p-8 opacity-80">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">
              Typowy marketplace
            </p>
            <div className="text-4xl md:text-5xl font-black text-muted-foreground">
              145+ <span className="text-lg font-medium">zł netto/mies</span>
            </div>
            <div className="mt-3 text-sm text-muted-foreground space-y-1.5">
              <p>+ 35 zł za każdego dodatkowego pracownika</p>
              <p>+ do 45% prowizji od nowych klientek (Boost)</p>
            </div>
            <p className="mt-4 text-sm text-muted-foreground/70 border-t border-border/50 pt-4">
              Ich platforma. Ich zasady.<br />
              Jutro mogą zmienić cennik.
            </p>
          </div>
        </motion.div>

        {/* Unique features header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-xl md:text-2xl font-bold text-center">
            <span className="text-primary">{uniqueFeatures.length} funkcji</span> których marketplace nie oferuje
          </h3>
        </motion.div>

        {/* Feature cards grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {uniqueFeatures.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="group relative rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <Badge
                  variant="outline"
                  className="absolute top-4 right-4 text-[10px] text-primary border-primary/30 bg-primary/5"
                >
                  Tylko u nas
                </Badge>
                <div className="flex gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="pr-16">
                    <h4 className="font-bold text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Shared features disclaimer */}
        <motion.div
          className="mt-12 text-center max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            CRM, SMS, magazyn, raporty, karty lojalnościowe — tak, to mają obie platformy.{" "}
            <span className="text-foreground font-medium">
              Różnica? W tym co dzieje się potem — gdy klientka nie wraca.
            </span>
          </p>
          <p className="text-xs text-muted-foreground/60 mt-4">
            Dane porównawcze oparte na publicznie dostępnych cennikach (stan na 2026).
            Prowizja 45% dotyczy usługi Boost (nowe klientki z marketplace), nie wszystkich wizyt.
          </p>
        </motion.div>

        {/* CTA */}
        <div className="text-center mt-10">
          <Button
            onClick={scrollToForm}
            size="lg"
            className="rounded-full px-8 text-base group"
          >
            Zacznij za darmo — przekonaj się sama
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};
