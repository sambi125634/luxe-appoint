import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardMockup from "./mockups/DashboardMockup";
import BookingMockup from "./mockups/BookingMockup";

export const InteractiveDemoSection = () => {
  const [activeTab, setActiveTab] = useState("client");

  return (
    <section id="interactive-demo" className="py-20 lg:py-32 bg-gradient-to-b from-muted/20 to-background">
      <div className="container">
        {/* Section header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            <Play className="w-4 h-4 mr-2" />
            Interaktywne demo
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Zobaczysz to co widzą{" "}
            <span className="text-gradient-luxury">najlepsze właścicielki salonów</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Intuicyjny panel. Zero szkoleń. Konfiguracja w 15 minut — nawet jeśli ostatnio „coś technicznego" to zmiana hasła do Wi-Fi.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="client" className="gap-2">
              <User className="w-4 h-4" />
              Widok klientki
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="w-4 h-4" />
              Panel salonu
            </TabsTrigger>
          </TabsList>

          <div className="glass-card-elevated p-4 lg:p-8 rounded-2xl">
            {/* Device frame */}
            <div className="relative">
              {/* Browser chrome */}
              <div className="bg-muted rounded-t-xl p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center">
                    {activeTab === "client" 
                      ? "beautycalendar.pl/s/demo-salon" 
                      : "beautycalendar.pl/admin"
                    }
                  </div>
                </div>
              </div>

              {/* Content */}
              <TabsContent value="client" className="mt-0">
                <div className="bg-background rounded-b-xl overflow-hidden aspect-[16/10]">
                  <BookingMockup />
                </div>
              </TabsContent>

              <TabsContent value="admin" className="mt-0">
                <div className="bg-background rounded-b-xl overflow-hidden aspect-[16/10]">
                  <DashboardMockup />
                </div>
              </TabsContent>
            </div>

            {/* Highlight badges */}
            {activeTab === "client" && (
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg animate-pulse">
                Widok klienta
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="text-center mt-8">
            <Button size="lg" asChild className="group">
              <Link to="/demo">
                Otwórz pełne demo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </Tabs>
      </div>
    </section>
  );
};