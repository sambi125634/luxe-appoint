import { Settings, Link, Code, CalendarCheck } from "lucide-react";

const steps = [
  {
    icon: Settings,
    title: "Konfiguracja salonu",
    description: "Dodajesz swoje usługi, zespół i godziny pracy. 5-minutowy wizard przeprowadzi Cię przez wszystko.",
  },
  {
    icon: Link,
    title: "Integracja z kalendarzem",
    description: "Połączenie z Google Calendar i GoHighLevel jednym kliknięciem. Wszystko zsynchronizowane automatycznie.",
  },
  {
    icon: Code,
    title: "Osadzenie na stronie",
    description: "Kopiujesz wygenerowany kod lub link. Wklejasz na swojej stronie lub wysyłasz klientkom.",
  },
  {
    icon: CalendarCheck,
    title: "Rezerwacje 24/7",
    description: "Klientki same wpisują się do kalendarza. Ty widzisz wszystko w jednym miejscu, bez chaosu.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Jak to działa w Twoim salonie?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Od rejestracji do działającego kalendarza w mniej niż 10 minut
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative">
            {/* Connection line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-secondary to-accent hidden md:block" />
            
            <div className="space-y-12">
              {steps.map((step, index) => (
                <div 
                  key={step.title}
                  className={`flex items-center gap-8 animate-fade-in ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className={`flex-1 ${index % 2 === 1 ? 'md:text-right' : ''}`}>
                    <div className="glass-card-elevated p-6 inline-block">
                      <h3 className="font-serif text-xl font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                  
                  <div className="relative z-10 flex-shrink-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-glow">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}