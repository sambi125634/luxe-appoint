import { Gift, CheckCircle } from "lucide-react";

const benefits = [
  "Dostęp do pełnej wersji demonstracyjnej kalendarza",
  "Personalny onboarding na krótkiej rozmowie online",
  "Pomoc w konfiguracji usług i zespołu",
  "Wsparcie przy osadzeniu kalendarza na Twojej stronie",
  "Bez zobowiązań – możesz zrezygnować w każdej chwili",
];

export function DemoOfferSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card-elevated p-8 md:p-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent-foreground text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Bezpłatne demo
            </div>
            
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Co otrzymasz w wersji demonstracyjnej?
            </h2>
            <p className="text-muted-foreground mb-8">
              Zero ryzyka, zero ukrytych kosztów. Przetestujesz wszystko przed podjęciem decyzji.
            </p>
            
            <div className="text-left max-w-md mx-auto space-y-4">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}