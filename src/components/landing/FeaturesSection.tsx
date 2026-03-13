import { useState } from "react";
import { 
  Calendar, 
  Users, 
  Scissors, 
  CreditCard, 
  Package, 
  BarChart3,
  Layout,
  ChevronRight,
  Check,
  Clock,
  Bell,
  MousePointer,
  FileText,
  Tag,
  MessageSquare,
  History,
  DollarSign,
  TrendingUp,
  PieChart,
  Download,
  QrCode,
  AlertTriangle,
  Percent,
  Globe,
  Palette,
  Code,
  Bot,
  Brain,
  Target,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const featureTabs = [
  {
    id: "ai-autopilot",
    icon: Bot,
    title: "🤖 AI Autopilot",
    features: [
      { text: "Wypełniacz Luk — AI sugeruje klientkom wolne terminy", icon: Brain },
      { text: "Radar Odejść — wykrywa ryzykownych klientów zanim odejdą", icon: Target },
      { text: "Prognoza Kasy — wiesz ile zarobisz w piątek", icon: TrendingUp },
      { text: "Dynamiczne Ceny — optymalizacja cennika w czasie rzeczywistym", icon: DollarSign },
      { text: "Automatyczne reaktywacje — AI kontaktuje klientki które dawno nie były", icon: Sparkles },
    ],
    mockup: "ai-autopilot",
  },
  {
    id: "calendar",
    icon: Calendar,
    title: "Kalendarz i rezerwacje",
    features: [
      { text: "Widok dzienny, tygodniowy, miesięczny", icon: Calendar },
      { text: "Drag & drop przenoszenie wizyt", icon: MousePointer },
      { text: "Automatyczne przypomnienia SMS/email", icon: Bell },
      { text: "Blokowanie terminów jednym kliknięciem", icon: Clock },
      { text: "Szablony grafików (wakacje, szkolenia)", icon: FileText },
    ],
    mockup: "calendar",
  },
  {
    id: "clients",
    icon: Users,
    title: "Klienci i CRM",
    features: [
      { text: "Pełna historia wizyt", icon: History },
      { text: "Tagi i segmentacja (VIP, ryzykowni, nowi)", icon: Tag },
      { text: "Notatki i preferencje", icon: MessageSquare },
      { text: "Śledzenie źródła pozyskania", icon: TrendingUp },
      { text: "Automatyczne przypomnienia o wizytach", icon: Bell },
    ],
    mockup: "clients",
  },
  {
    id: "services",
    icon: Scissors,
    title: "Usługi i personel",
    features: [
      { text: "Nieograniczona liczba usług", icon: Scissors },
      { text: "Kategorie z ikonami", icon: Layout },
      { text: "Przypisanie usług do pracowników", icon: Users },
      { text: "Indywidualne godziny pracy", icon: Clock },
      { text: "Urlopy i dni wolne", icon: Calendar },
    ],
    mockup: "services",
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Płatności i przedpłaty",
    features: [
      { text: "BLIK, Przelewy24, karty", icon: CreditCard },
      { text: "Warunkowe przedpłaty (tylko ryzykowni)", icon: AlertTriangle },
      { text: "Automatyczne rozliczenia", icon: DollarSign },
      { text: "Historia transakcji", icon: History },
      { text: "Integracja z księgowością", icon: FileText },
    ],
    mockup: "payments",
  },
  {
    id: "products",
    icon: Package,
    title: "Produkty i magazyn",
    features: [
      { text: "Katalog produktów", icon: Package },
      { text: "Śledzenie stanów magazynowych", icon: BarChart3 },
      { text: "Alerty niskiego stanu", icon: AlertTriangle },
      { text: "Skaner kodów QR/EAN", icon: QrCode },
      { text: "Raporty sprzedaży produktów", icon: PieChart },
    ],
    mockup: "products",
  },
  {
    id: "reports",
    icon: BarChart3,
    title: "Raporty i księgowość",
    features: [
      { text: "Dzienny raport kasowy", icon: DollarSign },
      { text: "Prowizje pracowników", icon: Percent },
      { text: "Raport VAT", icon: FileText },
      { text: "Export do księgowej (CSV/PDF)", icon: Download },
      { text: "Analiza trendów i sezonowości", icon: TrendingUp },
    ],
    mockup: "reports",
  },
  {
    id: "widgets",
    icon: Layout,
    title: "Widgety kampanii",
    features: [
      { text: "Osobny kalendarz per promocja", icon: Calendar },
      { text: "Własne ceny i usługi", icon: Tag },
      { text: "Kod embed na stronę", icon: Code },
      { text: "Śledzenie konwersji", icon: TrendingUp },
      { text: "Customowy branding", icon: Palette },
    ],
    mockup: "widgets",
  },
];

// Mockup components for each feature
const CalendarMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
      <span className="font-semibold text-sm">Kalendarz - Grudzień 2024</span>
      <div className="flex gap-1">
        <div className="w-6 h-6 rounded bg-primary/20" />
        <div className="w-6 h-6 rounded bg-primary/20" />
      </div>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map(d => (
          <div key={d} className="text-xs text-center text-muted-foreground font-medium py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 31 }, (_, i) => (
          <div 
            key={i} 
            className={cn(
              "aspect-square rounded text-xs flex items-center justify-center",
              i === 13 && "bg-primary text-primary-foreground font-bold",
              [5, 12, 19].includes(i) && "bg-emerald-500/20 text-emerald-600",
              [7, 15, 22].includes(i) && "bg-amber-500/20 text-amber-600"
            )}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
    <div className="px-4 pb-4 space-y-2">
      <div className="flex items-center gap-2 p-2 bg-primary/10 rounded text-xs">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <span>10:00 - Manicure hybrydowy</span>
      </div>
      <div className="flex items-center gap-2 p-2 bg-emerald-500/10 rounded text-xs">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>14:30 - Pedicure SPA</span>
      </div>
    </div>
  </div>
);

const ClientsMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
      <span className="font-semibold text-sm">Klienci</span>
      <div className="px-2 py-1 bg-primary/20 rounded text-xs">+234</div>
    </div>
    <div className="p-4 space-y-3">
      {[
        { name: "Anna Kowalska", tag: "VIP", tagColor: "bg-amber-500/20 text-amber-600", visits: 24 },
        { name: "Maria Nowak", tag: "Nowa", tagColor: "bg-emerald-500/20 text-emerald-600", visits: 1 },
        { name: "Katarzyna Wiśniewska", tag: "Ryzyko", tagColor: "bg-rose-500/20 text-rose-600", visits: 3 },
      ].map((client, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
            {client.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{client.name}</div>
            <div className="text-xs text-muted-foreground">{client.visits} wizyt</div>
          </div>
          <span className={cn("px-2 py-0.5 rounded text-xs font-medium", client.tagColor)}>
            {client.tag}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ServicesMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
      <span className="font-semibold text-sm">Usługi</span>
    </div>
    <div className="p-4 space-y-3">
      {[
        { name: "Manicure hybrydowy", price: "120 zł", duration: "60 min", color: "bg-pink-500" },
        { name: "Pedicure SPA", price: "150 zł", duration: "90 min", color: "bg-purple-500" },
        { name: "Brwi i rzęsy", price: "80 zł", duration: "45 min", color: "bg-indigo-500" },
      ].map((service, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
          <div className={cn("w-3 h-12 rounded-full", service.color)} />
          <div className="flex-1">
            <div className="font-medium text-sm">{service.name}</div>
            <div className="text-xs text-muted-foreground">{service.duration}</div>
          </div>
          <span className="font-bold text-primary">{service.price}</span>
        </div>
      ))}
    </div>
  </div>
);

const PaymentsMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 border-b border-border">
      <span className="font-semibold text-sm">Płatności dzisiaj</span>
    </div>
    <div className="p-4">
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-3 bg-emerald-500/10 rounded-lg">
          <div className="text-2xl font-bold text-emerald-600">2,450</div>
          <div className="text-xs text-muted-foreground">PLN</div>
        </div>
        <div className="text-center p-3 bg-blue-500/10 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-xs text-muted-foreground">Transakcji</div>
        </div>
        <div className="text-center p-3 bg-amber-500/10 rounded-lg">
          <div className="text-2xl font-bold text-amber-600">3</div>
          <div className="text-xs text-muted-foreground">Przedpłaty</div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
          <span>BLIK</span>
          <span className="font-bold">1,200 zł</span>
        </div>
        <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
          <span>Karta</span>
          <span className="font-bold">850 zł</span>
        </div>
        <div className="flex justify-between items-center text-sm p-2 bg-muted/30 rounded">
          <span>Gotówka</span>
          <span className="font-bold">400 zł</span>
        </div>
      </div>
    </div>
  </div>
);

const ProductsMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
      <span className="font-semibold text-sm">Magazyn</span>
      <div className="flex items-center gap-1 text-amber-600 text-xs">
        <AlertTriangle className="w-3 h-3" />
        <span>3 alerty</span>
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[
        { name: "Lakier OPI Red", stock: 5, min: 10, status: "low" },
        { name: "Krem nawilżający", stock: 23, min: 5, status: "ok" },
        { name: "Olejek do skórek", stock: 2, min: 5, status: "critical" },
      ].map((product, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
            <Package className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">{product.name}</div>
            <div className="text-xs text-muted-foreground">Min: {product.min} szt.</div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-bold",
            product.status === "ok" && "bg-emerald-500/20 text-emerald-600",
            product.status === "low" && "bg-amber-500/20 text-amber-600",
            product.status === "critical" && "bg-rose-500/20 text-rose-600"
          )}>
            {product.stock} szt.
          </span>
        </div>
      ))}
    </div>
  </div>
);

const ReportsMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 border-b border-border">
      <span className="font-semibold text-sm">Raport miesięczny</span>
    </div>
    <div className="p-4">
      <div className="h-32 flex items-end justify-between gap-2 mb-4 px-2">
        {[65, 45, 78, 82, 55, 90, 75, 88, 70, 95, 80, 85].map((h, i) => (
          <div key={i} className="flex-1 bg-primary/30 rounded-t hover:bg-primary/50 transition-colors" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Przychód</div>
          <div className="text-lg font-bold text-emerald-600">32,450 zł</div>
        </div>
        <div className="p-3 bg-muted/30 rounded-lg">
          <div className="text-xs text-muted-foreground">Wzrost</div>
          <div className="text-lg font-bold text-primary">+12%</div>
        </div>
      </div>
    </div>
  </div>
);

const WidgetsMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
      <span className="font-semibold text-sm">Widgety</span>
      <div className="px-2 py-1 bg-emerald-500/20 text-emerald-600 rounded text-xs">3 aktywne</div>
    </div>
    <div className="p-4 space-y-3">
      {[
        { name: "Black Friday -30%", conversions: 45, color: "bg-purple-500" },
        { name: "Instagram Stories", conversions: 23, color: "bg-pink-500" },
        { name: "Strona główna", conversions: 78, color: "bg-blue-500" },
      ].map((widget, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50">
          <div className={cn("w-3 h-10 rounded-full", widget.color)} />
          <div className="flex-1">
            <div className="font-medium text-sm">{widget.name}</div>
            <div className="text-xs text-muted-foreground">{widget.conversions} konwersji</div>
          </div>
          <Code className="w-4 h-4 text-muted-foreground" />
        </div>
      ))}
    </div>
  </div>
);

const AIAutopilotMockupPreview = () => (
  <div className="bg-card rounded-lg shadow-lg overflow-hidden border border-border">
    <div className="bg-primary/10 px-4 py-3 flex items-center justify-between border-b border-border">
      <span className="font-semibold text-sm">AI Autopilot</span>
      <div className="flex items-center gap-1 text-emerald-600 text-xs">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Aktywny</span>
      </div>
    </div>
    <div className="p-4 space-y-3">
      {[
        { action: "Wypełniono lukę 14:00–15:00", client: "Anna K.", time: "2 min temu", color: "bg-violet-500" },
        { action: "Wysłano przypomnienie", client: "Maria N.", time: "15 min temu", color: "bg-emerald-500" },
        { action: "Wykryto ryzyko odejścia", client: "Kasia W.", time: "1h temu", color: "bg-amber-500" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
          <div className={cn("w-2 h-10 rounded-full", item.color)} />
          <div className="flex-1">
            <div className="font-medium text-sm">{item.action}</div>
            <div className="text-xs text-muted-foreground">{item.client} · {item.time}</div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const getMockupComponent = (mockupId: string) => {
  switch (mockupId) {
    case "ai-autopilot": return <AIAutopilotMockupPreview />;
    case "calendar": return <CalendarMockupPreview />;
    case "clients": return <ClientsMockupPreview />;
    case "services": return <ServicesMockupPreview />;
    case "payments": return <PaymentsMockupPreview />;
    case "products": return <ProductsMockupPreview />;
    case "reports": return <ReportsMockupPreview />;
    case "widgets": return <WidgetsMockupPreview />;
    default: return null;
  }
};

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
              
              <ul className="space-y-3 mb-8">
                {activeTab.features.map((feature, index) => (
                  <li 
                    key={index}
                    className="flex items-center gap-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <feature.icon className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-base">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* Visual mockup */}
              <div className="animate-fade-in">
                {getMockupComponent(activeTab.mockup)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
