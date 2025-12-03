import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, Calendar, Smartphone } from "lucide-react";

interface HeroSectionProps {
  onScrollToDemo: () => void;
}

export function HeroSection({ onScrollToDemo }: HeroSectionProps) {
  return (
    <section className="pt-32 pb-20 px-4 relative overflow-hidden min-h-screen flex items-center">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      <div className="absolute top-40 right-20 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />

      <div className="container mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Copy */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              Polski system rezerwacji online
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 animate-slide-up">
              <span className="text-gradient-luxury">Piękny kalendarz online</span>
              <br />
              <span className="text-foreground">dla salonów beauty</span>
              <br />
              <span className="text-muted-foreground text-3xl md:text-4xl">(w końcu po polsku)</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              Zamień brzydkie, angielskie kalendarze na elegancki system rezerwacji, 
              który zachwyci Twoje klientki i zautomatyzuje codzienną pracę.
            </p>
            
            {/* Benefits */}
            <ul className="space-y-3 mb-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              {[
                "Rezerwacje 24/7 bez chaosu na Messengerze",
                "Widok całego zespołu w jednym miejscu",
                "Stworzony dla salonów, nie dla wszystkich branż naraz",
                "Integracja z Google Calendar i GoHighLevel",
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3 text-foreground">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center flex-shrink-0">
                    <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button 
                variant="luxury" 
                size="xl" 
                className="gap-2"
                onClick={onScrollToDemo}
              >
                Zobacz demo kalendarza
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="xl"
                onClick={() => window.open('/umow-konsultacje', '_blank')}
              >
                Umów darmową rozmowę
              </Button>
            </div>
          </div>
          
          {/* Right side - Mockups */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.5s" }}>
            {/* Desktop mockup */}
            <div className="glass-card-elevated p-4 rounded-2xl shadow-glow">
              <div className="bg-card rounded-lg overflow-hidden">
                <div className="bg-muted/50 px-4 py-2 flex items-center gap-2 border-b border-border">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/50" />
                    <div className="w-3 h-3 rounded-full bg-accent/50" />
                    <div className="w-3 h-3 rounded-full bg-primary/50" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">Panel Beauty Calendar</span>
                </div>
                <div className="p-4 bg-background">
                  <div className="flex items-center gap-4 mb-4">
                    <Calendar className="w-6 h-6 text-primary" />
                    <span className="font-serif text-lg font-semibold">Kalendarz tygodniowy</span>
                  </div>
                  {/* Mini calendar grid */}
                  <div className="grid grid-cols-5 gap-2">
                    {['Pon', 'Wt', 'Śr', 'Czw', 'Pt'].map((day) => (
                      <div key={day} className="text-center text-xs text-muted-foreground font-medium">{day}</div>
                    ))}
                    {Array.from({ length: 15 }).map((_, i) => (
                      <div key={i} className={`h-8 rounded text-xs flex items-center justify-center ${
                        [2, 5, 7, 11, 13].includes(i) 
                          ? 'bg-primary/20 text-primary' 
                          : [3, 9].includes(i) 
                          ? 'bg-secondary/20 text-secondary' 
                          : 'bg-muted/30'
                      }`}>
                        {[2, 5, 7, 11, 13].includes(i) && '10:00'}
                        {[3, 9].includes(i) && '14:00'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Phone mockup */}
            <div className="absolute -bottom-8 -left-8 w-48 glass-card-elevated p-3 rounded-2xl shadow-gold">
              <div className="bg-card rounded-lg overflow-hidden">
                <div className="bg-primary/10 px-3 py-2 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Rezerwacja</span>
                </div>
                <div className="p-3 space-y-2">
                  <div className="text-xs text-muted-foreground">Krok 2/3</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-2/3 bg-gradient-to-r from-primary to-secondary rounded-full" />
                  </div>
                  <div className="text-sm font-medium">Wybierz termin</div>
                  <div className="grid grid-cols-3 gap-1">
                    {['10:00', '11:30', '14:00'].map((time) => (
                      <div key={time} className={`text-xs py-1 rounded text-center ${time === '11:30' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}