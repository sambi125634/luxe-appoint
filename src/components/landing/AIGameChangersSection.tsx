import { useState } from "react";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Users,
  Heart,
  Check,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "silent-fans",
    icon: Heart,
    title: "Silent Fans Detector™",
    subtitle: "Znajdź ciche fanki",
    description: "23% Twoich klientek to lojalne fanki, które nigdy nie zostawiły opinii. System je znajduje i wysyła spersonalizowaną wiadomość z prośbą o polecenie lub recenzję Google. Ty nie robisz nic. One robią resztę.",
    stat: "+23%",
    statLabel: "opinii Google bez Twojego udziału",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "smart-gap",
    icon: Brain,
    title: "Smart Gap Management",
    subtitle: "AI zamyka luki w kalendarzu",
    description: "30-minutowa luka między 14:00 a 14:30? System sprawdza bazę klientek, znajduje te które lubią usługi ekspresowe i wysyła im ofertę last-minute. Luka = stracone pieniądze. AI ją zamyka za Ciebie.",
    stat: "+23%",
    statLabel: "więcej rezerwacji w \"martwych\" godzinach",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "true-profit",
    icon: DollarSign,
    title: "True Profit Dashboard",
    subtitle: "Ile NAPRAWDĘ zarabiasz?",
    description: "Przychód to nie zysk. System odejmuje koszt materiałów, czas pracownicy i koszty stałe. Pokazuje ile NAPRAWDĘ zarabiasz na każdym zabiegu. Będziesz zaskoczona co wyjdzie na plus, a co na minus.",
    stat: "100%",
    statLabel: "przejrzystości finansowej",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "churn",
    icon: Target,
    title: "Churn Prediction",
    subtitle: "Wiesz zanim odejdzie",
    description: "Klientka Anna nie była 45 dni. Wcześniej przychodziła co 3 tygodnie. System wykrywa tę zmianę 14 dni ZANIM odejdzie na dobre — i daje Ci gotową wiadomość reaktywacyjną. Ty tylko klikasz „wyślij”.",
    stat: "-67%",
    statLabel: "redukcja odejść klientek",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "upsell",
    icon: TrendingUp,
    title: "AI Upsell Engine",
    subtitle: "Automatyczne dosprzedawanie",
    description: "Klientka rezerwuje manicure hybrydowy. System wie, że 60% klientek z tym zabiegiem dokupuje pielęgnację dłoni. Automatycznie sugeruje: „Dodaj spa dłoni za 45 zł?” Średni wzrost wartości wizyty: +18%.",
    stat: "+18%",
    statLabel: "wzrost wartości wizyty",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "pixel",
    icon: Users,
    title: "Auto-Audience Builder",
    subtitle: "Pixel Conditioning",
    description: "System automatycznie dzieli Twoje klientki na grupy: nowe, powracające, VIP, zagrożone odejściem. Tworzy gotowe segmenty do Facebook Ads. Zero ręcznej pracy — Pixel robi resztę.",
    stat: "ROI",
    statLabel: "z reklam wreszcie mierzalny",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10",
  },
];

export const AIGameChangersSection = () => {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background via-muted/10 to-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>
      
      <div className="container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 text-sm text-primary font-medium mb-4">
            <Brain className="w-4 h-4" />
            12 funkcji AI — żaden konkurent tego nie ma
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Co jeśli Twój salon zarabiał na Ciebie,{" "}
            <span className="text-primary">nawet gdy śpisz?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            12 funkcji AI, które pracują 24/7. Żaden konkurent tego nie ma. Żaden. Sprawdź sama.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Feature tabs - left side */}
          <div className="lg:col-span-2 space-y-3">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature)}
                className={cn(
                  "w-full p-4 rounded-xl text-left transition-all duration-300",
                  "border hover:shadow-md",
                  activeFeature.id === feature.id
                    ? "bg-card border-primary/30 shadow-lg"
                    : "bg-transparent border-border/50 hover:border-border hover:bg-card/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                    activeFeature.id === feature.id
                      ? `bg-gradient-to-br ${feature.color}`
                      : feature.bgColor
                  )}>
                    <feature.icon className={cn(
                      "w-5 h-5",
                      activeFeature.id === feature.id ? "text-white" : "text-foreground"
                    )} />
                  </div>
                  <div>
                    <div className="font-semibold">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.subtitle}</div>
                  </div>
                  {activeFeature.id === feature.id && (
                    <ArrowRight className="w-4 h-4 ml-auto text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feature detail - right side */}
          <div className="lg:col-span-3">
            <div className="glass-card-elevated p-8 lg:p-10 h-full">
              <div className="flex flex-col h-full">
                {/* Icon and badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                    activeFeature.color
                  )}>
                    <activeFeature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                      activeFeature.color
                    )}>
                      {activeFeature.stat}
                    </div>
                    <div className="text-sm text-muted-foreground max-w-[150px]">
                      {activeFeature.statLabel}
                    </div>
                  </div>
                </div>

                {/* Title and description */}
                <h3 className="text-2xl font-bold mb-2">{activeFeature.title}</h3>
                <p className="text-lg text-muted-foreground mb-6 flex-grow">
                  {activeFeature.description}
                </p>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                  {["Działa automatycznie 24/7", "Dostępne w pakiecie ELITE (349 zł/mies)", "Rezultaty od pierwszego tygodnia"].map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => {
                    const demoSection = document.getElementById("interactive-demo");
                    if (demoSection) {
                      demoSection.scrollIntoView({ behavior: "smooth" });
                    } else {
                      window.location.href = "/demo";
                    }
                  }}
                >
                  Zobacz demo tej funkcji
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};