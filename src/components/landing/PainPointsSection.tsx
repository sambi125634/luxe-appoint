import { AlertCircle, Globe, Users, Bell, Unplug } from "lucide-react";

const painPoints = [
  {
    icon: Globe,
    title: "Brzydki, techniczny wygląd",
    description: "Angielski interfejs, skomplikowane menu, wizualne zamieszanie. Klientka czuje się zagubiona zamiast zachwycona.",
  },
  {
    icon: Users,
    title: "Chaos przy wielu usługach",
    description: "40+ zabiegów, 5 specjalistek, różne czasy trwania – generyczne kalendarze tego nie ogarniają.",
  },
  {
    icon: Bell,
    title: "Brak kontroli nad no-show",
    description: "Klientki nie przychodzą, nie pamiętają, a Ty tracisz pieniądze. Brak dobrych przypomnień SMS/WhatsApp.",
  },
  {
    icon: Unplug,
    title: "Rozjechane integracje",
    description: "Kalendarz osobno, Google Calendar osobno, CRM osobno. Zero automatyzacji, ciągłe przeklikiwanie.",
  },
];

export function PainPointsSection() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full text-destructive text-sm font-medium mb-4">
            <AlertCircle className="w-4 h-4" />
            Problem
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Standardowe kalendarze zabijają
            <br />
            <span className="text-gradient-luxury">doświadczenie Twojej klientki</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Booksy, generyczne kalendarze GoHighLevel, Calendly... Są projektowane dla wszystkich, 
            więc tak naprawdę nie działają dobrze dla nikogo.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {painPoints.map((point, index) => (
            <div
              key={point.title}
              className="glass-card p-6 hover-lift animate-fade-in border-destructive/10 hover:border-destructive/30 transition-colors"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                <point.icon className="w-7 h-7 text-destructive" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">{point.title}</h3>
              <p className="text-muted-foreground text-sm">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}