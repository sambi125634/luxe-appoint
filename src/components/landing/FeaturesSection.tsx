import { useState } from "react";
import { 
  Calendar, 
  Users, 
  Scissors, 
  CreditCard, 
  Package, 
  BarChart3,
  Layout,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const featureTabs = [
  {
    id: "calendar",
    icon: Calendar,
    title: "Kalendarz i rezerwacje",
    features: [
      "Widok dzienny, tygodniowy, miesięczny",
      "Drag & drop przenoszenie wizyt",
      "Automatyczne przypomnienia SMS/email",
      "Blokowanie terminów jednym kliknięciem",
      "Szablony grafików (wakacje, szkolenia, standardowy tydzień)",
    ],
  },
  {
    id: "clients",
    icon: Users,
    title: "Klienci i CRM",
    features: [
      "Pełna historia wizyt",
      "Tagi i segmentacja (VIP, ryzykowni, nowi)",
      "Notatki i preferencje",
      "Śledzenie źródła pozyskania",
      "Automatyczne przypomnienia o wizytach",
    ],
  },
  {
    id: "services",
    icon: Scissors,
    title: "Usługi i personel",
    features: [
      "Nieograniczona liczba usług",
      "Kategorie z ikonami",
      "Przypisanie usług do pracowników",
      "Indywidualne godziny pracy",
      "Urlopy i dni wolne",
    ],
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Płatności i przedpłaty",
    features: [
      "BLIK, Przelewy24, karty",
      "Warunkowe przedpłaty (tylko ryzykowni)",
      "Automatyczne rozliczenia",
      "Historia transakcji",
      "Integracja z księgowością",
    ],
  },
  {
    id: "products",
    icon: Package,
    title: "Produkty i magazyn",
    features: [
      "Katalog produktów",
      "Śledzenie stanów magazynowych",
      "Alerty niskiego stanu",
      "Skaner kodów QR/EAN",
      "Raporty sprzedaży produktów",
    ],
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Raporty i księgowość",
    features: [
      "Dzienny raport kasowy",
      "Prowizje pracowników",
      "Raport VAT",
      "Export do księgowej (CSV/PDF)",
      "Analiza trendów i sezonowości",
    ],
  },
  {
    id: "widgets",
    icon: Layout,
    title: "Widgety kampanii",
    features: [
      "Osobny kalendarz per promocja",
      "Własne ceny i usługi",
      "Kod embed na stronę",
      "Śledzenie konwersji",
      "A/B testy różnych ofert",
    ],
  },
];

export const FeaturesSection = () => {
  const [activeTab, setActiveTab] = useState(featureTabs[0]);

  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Wszystko czego potrzebujesz.{" "}
            <span className="text-muted-foreground">Nic więcej.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kompletny zestaw narzędzi do zarządzania salonem w jednym miejscu.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tab list */}
          <div className="space-y-2">
            {featureTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all",
                  activeTab.id === tab.id
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "hover:bg-muted/50"
                )}
              >
                <tab.icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{tab.title}</span>
                {activeTab.id === tab.id && (
                  <ChevronRight className="w-4 h-4 ml-auto" />
                )}
              </button>
            ))}
          </div>

          {/* Feature content */}
          <div className="lg:col-span-2">
            <div className="glass-card p-8 lg:p-10 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                  <activeTab.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{activeTab.title}</h3>
              </div>
              
              <ul className="space-y-4">
                {activeTab.features.map((feature, index) => (
                  <li 
                    key={index}
                    className="flex items-start gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <ChevronRight className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Visual placeholder */}
              <div className="mt-8 aspect-video bg-muted/30 rounded-xl border border-border/50 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <activeTab.icon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <span>Podgląd funkcji</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
