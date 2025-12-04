import { Phone, Calendar, Ghost, Frown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const painPoints = [
  {
    icon: Phone,
    title: "Telefony w środku zabiegu",
    description: "Klientka dzwoni, żeby się umówić, ale Ty masz ręce w parafinie. Albo odbierasz i tracisz flow, albo nie odbierasz i tracisz klientkę."
  },
  {
    icon: Calendar,
    title: "Chaos w grafiku",
    description: "Jeden zeszyt, dwa telefony, trzy karteczki samoprzylepne. I nagle okazuje się, że dwie klientki są umówione na tę samą godzinę."
  },
  {
    icon: Ghost,
    title: "No-showy i puste sloty",
    description: "Klientka nie przyszła, nie odwołała, a Ty siedzisz z pustym fotelem i czekasz. Pieniądze uciekają."
  },
  {
    icon: Frown,
    title: "Skomplikowane systemy",
    description: "Booksy? Fresha? Piękne w reklamie, ale żeby ustawić grafik na wakacje, trzeba mieć dyplom inżyniera."
  }
];

const PainPointsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Znasz to uczucie?
          </h2>
          <p className="text-muted-foreground text-lg">
            Nie jesteś sama. 87% właścicielek salonów boryka się z tymi samymi problemami.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <Card 
              key={index} 
              className="glass-card border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover-lift"
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <point.icon className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
