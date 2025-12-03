import { Sparkles, Calendar, Grid3X3, Heart, Zap } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Piękny widok rezerwacji",
    description: "Elegancki kalendarz tygodniowy dla całego zespołu. Kolorowe wizyty, statusy, filtrowanie po specjaliście. Wszystko widoczne na pierwszy rzut oka.",
    image: "calendar",
  },
  {
    icon: Grid3X3,
    title: "Stworzony pod 40–100+ usług",
    description: "Kategorie zabiegów, różne czasy i ceny, przypisanie do specjalistek. Bez chaosu, bez scrollowania w nieskończoność.",
    image: "services",
  },
  {
    icon: Heart,
    title: "Przyjazny dla klientki",
    description: "3-krokowa rezerwacja po polsku. Czytelny wybór usługi, terminu i formularza. Twoja klientka poczuje się zaopiekowana.",
    image: "booking",
  },
  {
    icon: Zap,
    title: "Gotowy pod automatyzacje",
    description: "Synchronizacja z Google Calendar. Integracja z GoHighLevel. Automatyczne przypomnienia. Zero manualnej pracy.",
    image: "integrations",
  },
];

export function SolutionSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Rozwiązanie
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Beauty Calendar – kalendarz
            <br />
            <span className="text-gradient-luxury">zaprojektowany dla salonów beauty</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Jeden cel: perfekcyjne doświadczenie rezerwacji dla Ciebie i Twoich klientek. 
            Nic więcej, nic mniej.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="glass-card-elevated p-8 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
              
              {/* Mini preview illustration */}
              <div className="mt-6 bg-muted/30 rounded-xl p-4">
                {feature.image === 'calendar' && (
                  <div className="grid grid-cols-5 gap-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className={`h-6 rounded text-xs flex items-center justify-center ${
                        i % 3 === 0 ? 'bg-primary/30' : i % 3 === 1 ? 'bg-secondary/30' : 'bg-muted'
                      }`} />
                    ))}
                  </div>
                )}
                {feature.image === 'services' && (
                  <div className="flex gap-2 flex-wrap">
                    {['Twarz', 'Ciało', 'Depilacja', 'Paznokcie'].map((cat) => (
                      <span key={cat} className="px-3 py-1 bg-primary/10 rounded-full text-xs text-primary">{cat}</span>
                    ))}
                  </div>
                )}
                {feature.image === 'booking' && (
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gradient-to-r from-primary to-secondary rounded-full" />
                    <span className="text-xs text-muted-foreground">Krok 3/3</span>
                  </div>
                )}
                {feature.image === 'integrations' && (
                  <div className="flex gap-3 items-center justify-center">
                    <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">GCal</span>
                    </div>
                    <Zap className="w-4 h-4 text-accent" />
                    <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center">
                      <span className="text-xs font-bold text-secondary">GHL</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}