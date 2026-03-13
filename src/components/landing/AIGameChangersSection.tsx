import { useState } from "react";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Instagram,
  Sparkles,
  Check,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    id: "smart-gap",
    icon: Brain,
    title: "Wypełniacz Luk",
    subtitle: "AI samo dzwoni do klientek",
    description: "Masz 30-minutową przerwę między zabiegami? AI sugeruje klientkom dokładnie ten termin z badge \"Idealny termin\". Wypełnij każdą minutę.",
    stat: "+23%",
    statLabel: "więcej rezerwacji w \"martwych\" godzinach",
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-500/10",
  },
  {
    id: "risk-score",
    icon: Target,
    title: "Radar Odejść",
    subtitle: "Wiesz zanim odejdzie",
    description: "System analizuje historię: no-showy, odwołania, spóźnienia. Automatycznie wymaga przedpłaty od ryzykownych klientów.",
    stat: "-67%",
    statLabel: "redukcja no-showów",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "revenue",
    icon: TrendingUp,
    title: "Revenue Predictor",
    subtitle: "Prognoza przychodów",
    description: "Wiesz ile zarobisz zanim miesiąc się skończy. AI analizuje trendy, sezonowość i historię rezerwacji.",
    stat: "94%",
    statLabel: "dokładność prognoz",
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "pricing",
    icon: DollarSign,
    title: "Optimal Pricing",
    subtitle: "Dynamiczne ceny",
    description: "Poniedziałek pusty? Piątek przepełniony? AI sugeruje zniżki off-peak i premium w godzinach szczytu.",
    stat: "+18%",
    statLabel: "przychodu bez dodatkowych klientów",
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "instagram",
    icon: Instagram,
    title: "Instagram Booking",
    subtitle: "Link rezerwacyjny na Instagram",
    description: "Jeden link w bio, który śledzi konwersje z social media. Zobacz dokładnie, które posty przynoszą rezerwacje.",
    stat: "ROI",
    statLabel: "z Instagrama wreszcie mierzalne",
    color: "from-gradient-to-r from-purple-500 via-pink-500 to-orange-500",
    bgColor: "bg-pink-500/10",
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
          <Badge 
            variant="outline" 
            className="mb-4 px-4 py-2 border-primary/30 bg-primary/5"
          >
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            Powered by AI
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            5 funkcji AI,{" "}
            <span className="text-gradient-luxury">których nie ma konkurencja</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Sztuczna inteligencja, która naprawdę rozumie Twój biznes i automatycznie go optymalizuje.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Feature tabs - left side */}
          <div className="lg:col-span-2 space-y-3">
            {features.map((feature, index) => (
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
                  {["Działa automatycznie 24/7", "Brak dodatkowych kosztów", "Rezultaty od pierwszego dnia"].map((benefit, i) => (
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
