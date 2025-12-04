import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, Monitor, Smartphone, Play } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewType = "salon" | "client";

export function DemoPreviewSection() {
  const [activeView, setActiveView] = useState<ViewType>("salon");

  return (
    <section className="py-20 px-4 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Play className="w-4 h-4" />
            Interaktywne demo
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Wypróbuj Beauty Calendar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Zobacz, jak wygląda system z perspektywy salonu i klientki. 
            Klikaj, eksploruj i przekonaj się, że to naprawdę działa!
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center mb-8">
          <div className="glass-card p-1.5 inline-flex gap-1">
            <button
              onClick={() => setActiveView("salon")}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                activeView === "salon"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Monitor className="w-4 h-4" />
              Panel salonu
            </button>
            <button
              onClick={() => setActiveView("client")}
              className={cn(
                "px-6 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2",
                activeView === "client"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Smartphone className="w-4 h-4" />
              Widok klientki
            </button>
          </div>
        </div>

        {/* Preview Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Browser Frame */}
          <div className="glass-card-elevated overflow-hidden">
            {/* Browser Header */}
            <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 max-w-md mx-auto">
                <div className="bg-muted rounded-lg px-4 py-1.5 text-sm text-muted-foreground text-center">
                  {activeView === "salon" 
                    ? "beautycalendar.pl/admin" 
                    : "beautycalendar.pl/s/luxury-spa"
                  }
                </div>
              </div>
              <Link to={activeView === "salon" ? "/demo" : "/book/demo-salon"} target="_blank">
                <Button variant="ghost" size="sm" className="gap-1">
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">Otwórz</span>
                </Button>
              </Link>
            </div>

            {/* Preview Content */}
            <div className="relative h-[500px] lg:h-[600px] overflow-hidden">
              <iframe
                src={activeView === "salon" ? "/demo" : "/book/demo-salon"}
                className="w-full h-full border-0"
                title={activeView === "salon" ? "Panel salonu" : "Widok rezerwacji"}
              />
              
              {/* Gradient overlay at bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Floating CTA */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <Link to={activeView === "salon" ? "/demo" : "/book/demo-salon"}>
              <Button variant="luxury" size="lg" className="gap-2 shadow-xl">
                <ExternalLink className="w-4 h-4" />
                Eksploruj pełny podgląd
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature highlights below preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              title: "Pełna interakcja",
              description: "Klikaj, dodawaj wizyty, zarządzaj usługami - wszystko działa!",
            },
            {
              title: "Realistyczne dane",
              description: "Demo zawiera przykładowe wizyty, klientki i usługi beauty",
            },
            {
              title: "Bez rejestracji",
              description: "Testuj bez podawania danych. Zarejestruj się, gdy będziesz gotowa",
            },
          ].map((feature) => (
            <div key={feature.title} className="text-center">
              <h4 className="font-serif font-semibold mb-2">{feature.title}</h4>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
