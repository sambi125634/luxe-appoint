import { Syringe, Sparkles, Scissors } from "lucide-react";

const audiences = [
  {
    icon: Syringe,
    title: "Kliniki medycyny estetycznej",
    description: "Skomplikowane zabiegi, wiele gabinetów, wymagające klientki. Beauty Calendar radzi sobie z harmonogramowaniem nawet 100+ różnych procedur i wielu specjalistów.",
  },
  {
    icon: Sparkles,
    title: "Salony kosmetyczne i spa",
    description: "Od peelingów po masaże – wszystkie usługi w jednym miejscu. Klientki rezerwują same, a Ty masz czas na to, co robisz najlepiej.",
  },
  {
    icon: Scissors,
    title: "Fryzjerzy i studia urody",
    description: "Strzyżenie, koloryzacja, stylizacja – każda usługa ma inny czas trwania. Beauty Calendar automatycznie zarządza blokami czasu i dostępnością.",
  },
];

export function TargetAudienceSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Dla kogo jest Beauty Calendar?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Każdy salon beauty ma swoje specyficzne potrzeby. My je rozumiemy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <div
              key={audience.title}
              className="glass-card-elevated p-8 text-center hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center mx-auto mb-6">
                <audience.icon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-4">{audience.title}</h3>
              <p className="text-muted-foreground text-sm">{audience.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}