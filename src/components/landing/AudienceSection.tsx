import { Sparkles, Scissors, Heart, Flower } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const audiences = [
  {
    icon: Sparkles,
    title: "Kliniki estetyczne",
    description: "Zaawansowane procedury, wymagający klienci, wysokie marże. Potrzebujesz systemu który śledzi historię zabiegów i minimalizuje ryzyko.",
    color: "from-violet-500 to-purple-600",
    features: ["Historia zabiegów", "Zgody i dokumentacja", "VIP obsługa"],
  },
  {
    icon: Scissors,
    title: "Salony fryzjerskie",
    description: "Wielu klientów dziennie, różni pracownicy, szybkie wizyty. Potrzebujesz przejrzystego kalendarza i sprawnych rozliczeń z zespołem.",
    color: "from-amber-500 to-orange-600",
    features: ["Multi-stanowiskowy", "Prowizje pracowników", "Szybkie rezerwacje"],
  },
  {
    icon: Heart,
    title: "Salony kosmetyczne",
    description: "Różnorodne usługi, produkty do sprzedaży, kampanie promocyjne. Potrzebujesz elastycznych widgetów i pełnej kontroli magazynu.",
    color: "from-pink-500 to-rose-600",
    features: ["Magazyn produktów", "Widgety kampanii", "Cross-selling"],
  },
  {
    icon: Flower,
    title: "SPA i wellness",
    description: "Dłuższe wizyty, pakiety, depozyty. Potrzebujesz zarządzania voucherami i przedpłatami.",
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
            Dla kogo jest{" "}
            <span className="text-gradient-luxury">Beauty Calendar?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Niezależnie od typu Twojego salonu, mamy rozwiązanie dopasowane do Twoich potrzeb.
          </p>
        </div>

        {/* Audience cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {audiences.map((audience, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden border-border/50 hover:border-border transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
            >
              <CardContent className="p-6">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${audience.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <audience.icon className="w-7 h-7 text-white" />
                </div>

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
