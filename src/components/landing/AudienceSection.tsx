import { Sparkles, Scissors, Heart, Flower, Footprints, Stethoscope, Dumbbell, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const audiences = [
  {
    icon: Heart,
    title: "\uD83D\uDC85 Salony kosmetyczne",
    description: "Manicure, pedicure, stylizacja brwi i rz\u0119s. Zarz\u0105dzaj stanowiskami, materia\u0142ami i grafikiem pracownic.",
    color: "from-pink-500 to-rose-600",
    features: ["Magazyn produkt\u00F3w", "Widgety kampanii", "Cross-selling"],
  },
  {
    icon: Scissors,
    title: "\uD83D\uDC87\u200D\u2640\uFE0F Salony fryzjerskie",
    description: "Warianty us\u0142ug, produkty w magazynie, prowizje dla pracownic. Bo fryzjerstwo to nie tylko no\u017Cyczki.",
    color: "from-amber-500 to-orange-600",
    features: ["Multi-stanowiskowy", "Prowizje", "Szybkie rezerwacje"],
  },
  {
    icon: Sparkles,
    title: "\uD83D\uDC69\u200D\u2695\uFE0F Medycyna estetyczna",
    description: "Karty konsultacyjne, zgody RODO, historia zabieg\u00F3w, True Profit per zabieg. Dla klinik, kt\u00F3re my\u015Bl\u0105 jak biznes.",
    color: "from-violet-500 to-purple-600",
    features: ["Historia zabieg\u00F3w", "Dokumentacja", "True Profit"],
  },
  {
    icon: Flower,
    title: "\uD83E\uDDD6\u200D\u2640\uFE0F SPA & Wellness",
    description: "Pakiety us\u0142ug, karnety, rezerwacje grupowe, multi-lokalizacja. Bo SPA to do\u015Bwiadczenie.",
    color: "from-emerald-500 to-teal-600",
    features: ["Pakiety us\u0142ug", "Vouchery", "Przedp\u0142aty"],
  },
  {
    icon: Scissors,
    title: "\uD83D\uDC88 Barbershopy",
    description: "Szybkie rezerwacje, kolejka klient\u00F3w, prowizje dla barber\u00F3w. Prosty kalendarz, zero zb\u0119dnych funkcji.",
    color: "from-slate-500 to-zinc-600",
    features: ["Szybki kalendarz", "Prowizje", "SMS"],
  },
  {
    icon: Footprints,
    title: "\uD83E\uDDB6 Podologia",
    description: "Karty pacjenta, dokumentacja medyczna, przypomnienia o kontrolach. Zgodne z wymogami bran\u017Cy.",
    color: "from-sky-500 to-blue-600",
    features: ["Karty pacjenta", "Kontrole", "RODO"],
  },
  {
    icon: Stethoscope,
    title: "\uD83E\uDE7A Fizjoterapia",
    description: "Opis zabieg\u00F3w, post\u0119py pacjenta, cykle wizyt. Idealny dla gabinet\u00F3w rehabilitacyjnych.",
    color: "from-cyan-500 to-sky-600",
    features: ["Cykle wizyt", "Notatki", "Eksporty"],
  },
  {
    icon: Dumbbell,
    title: "\uD83E\uDDD8\u200D\u2640\uFE0F Masa\u017C & Joga",
    description: "Rezerwacje grupowe, pakiety sesji, karnety. Dla studio\u00F3w, kt\u00F3re chc\u0105 rosn\u0105\u0107.",
    color: "from-orange-500 to-red-600",
    features: ["Pakiety sesji", "Karnety", "Rezerwacje grupowe"],
  },
];

export const AudienceSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Dla ka\u017Cdego salonu beauty i wellness.{" "}
            <span className="text-gradient-luxury">R\u00F3wnie\u017C dla Twojego.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Niezale\u017Cnie od bran\u017Cy \u2014 je\u015Bli przyjmujesz klient\u00F3w na wizyty, Beauty Calendar jest dla Ciebie.
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
                <h3 className="text-xl font-bold mb-2">{audience.title}</h3>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {audience.description}
                </p>

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

                <div className={`absolute inset-0 bg-gradient-to-br ${audience.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};