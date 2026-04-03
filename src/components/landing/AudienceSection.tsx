import { Sparkles, Scissors, Heart, Flower } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const audiences = [
  {
    icon: Heart,
    title: "💅 Salony kosmetyczne",
    description: "Manicure, pedicure, stylizacja brwi i rzęs. Zarządzaj stanowiskami, materiałami i grafikiem pracownic — wszystko w jednym panelu.",
    color: "from-pink-500 to-rose-600",
    features: ["Magazyn produktów", "Widgety kampanii", "Cross-selling"],
  },
  {
    icon: Scissors,
    title: "💇‍♀️ Salony fryzjerskie",
    description: "Warianty usług dla krótkich i długich włosów, produkty w magazynie, prowizje dla pracownic. Bo fryzjerstwo to nie tylko nożyczki.",
    color: "from-amber-500 to-orange-600",
    features: ["Multi-stanowiskowy", "Prowizje pracowników", "Szybkie rezerwacje"],
  },
  {
    icon: Sparkles,
    title: "👩‍⚕️ Kliniki medycyny estetycznej",
    description: "Karty konsultacyjne, zgody RODO, historia zabiegów, True Profit per zabieg. Dla klinik, które myślą jak biznes, nie jak gabinet.",
    color: "from-violet-500 to-purple-600",
    features: ["Historia zabiegów", "Zgody i dokumentacja", "True Profit"],
  },
  {
    icon: Flower,
    title: "🧖‍♀️ SPA & Wellness",
    description: "Pakiety usług, karnety, rezerwacje grupowe, multi-lokalizacja. Bo SPA to nie jeden fotel — to doświadczenie.",
    color: "from-emerald-500 to-teal-600",
    features: ["Pakiety usług", "Vouchery", "Przedpłaty online"],
  },
];

export const AudienceSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Stworzone dla kobiet, które prowadzą salon —{" "}
            <span className="text-gradient-luxury">nie dla korporacji.</span>
          </h2>
        </div>

        {/* Audience cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden border-border/50 hover:border-border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <CardContent className="p-6">
                {/* Content */}
                <h3 className="text-xl font-bold mb-2">{audience.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {audience.description}
                </p>

                {/* Feature tags */}
                <div className="flex flex-wrap gap-2">
                  {audience.features.map((feature, i) => (
                    <span 
                      key={i}
                      className="text-xs px-2 py-1 bg-muted rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};