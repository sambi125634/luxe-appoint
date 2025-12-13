import { Bot, Shield, TrendingUp, Zap, Check, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const solutions = [
  {
    icon: Bot,
    title: "AI wypełnia luki w grafiku",
    description: "System analizuje Twój kalendarz i sugeruje klientkom terminy, które maksymalizują Twoje zarobki. Zero pustych okienek.",
    stat: "+23%",
    statLabel: "więcej rezerwacji",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Koniec z no-showami",
    description: "AI rozpoznaje ryzykownych klientów i automatycznie wymaga przedpłaty. Tracisz mniej, zarabiasz więcej.",
    stat: "-67%",
    statLabel: "mniej no-showów",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Prognozy przychodów w czasie rzeczywistym",
    description: "Wiesz dokładnie ile zarobisz w tym tygodniu, miesiącu, kwartale. Podejmuj decyzje oparte na danych, nie przeczuciach.",
    stat: "94%",
    statLabel: "dokładność prognoz",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Gotowe w 5 minut, nie 5 godzin",
    description: "Bez umów, bez prowizji, bez skomplikowanych ustawień. Dodaj usługi, personel, i zacznij przyjmować rezerwacje.",
    stat: "5 min",
    statLabel: "do startu",
    color: "from-pink-500 to-rose-600",
  },
];

export const TransformationSection = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background" />
      
      <div className="container relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            A gdyby Twój kalendarz{" "}
            <span className="text-gradient-luxury">pracował za Ciebie?</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Beauty Calendar to nie kolejny system rezerwacji. To Twój cyfrowy asystent, który nigdy nie śpi.
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {solutions.map((solution, index) => (
            <Card 
              key={index}
              className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col h-full">
                  {/* Header with icon and stat */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <solution.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold bg-gradient-to-r ${solution.color} bg-clip-text text-transparent`}>
                        {solution.stat}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {solution.statLabel}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-2">
                    {solution.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed flex-grow">
                    {solution.description}
                  </p>
                  
                  {/* Check indicator */}
                  <div className="flex items-center gap-2 mt-4 text-sm text-emerald-600">
                    <Check className="w-4 h-4" />
                    <span>Działa automatycznie</span>
                  </div>
                </div>
                
                {/* Hover gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button 
            size="lg" 
            asChild
            className="group px-8 py-6 text-lg"
          >
            <Link to="/demo">
              Zobacz jak to działa
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
