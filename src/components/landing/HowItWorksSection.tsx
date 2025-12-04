import { Settings, Users, Code, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Settings,
    number: "01",
    title: "Skonfiguruj salon",
    description: "Dodaj usługi, ustaw ceny, wgraj logo"
  },
  {
    icon: Users,
    number: "02",
    title: "Dodaj zespół",
    description: "Przypisz specjalistki i ich godziny pracy"
  },
  {
    icon: Code,
    number: "03",
    title: "Wklej widget",
    description: "Jedna linijka kodu na Twoją stronę lub Instagram"
  },
  {
    icon: CheckCircle,
    number: "04",
    title: "Odbieraj rezerwacje",
    description: "Klientki umawiają się same, 24/7"
  }
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Od rejestracji do pierwszej rezerwacji w{" "}
            <span className="text-gold">10 minut</span>
          </h2>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-deep via-gold to-burgundy" />
            
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-deep to-burgundy flex items-center justify-center mx-auto shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-sm font-bold text-background">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
