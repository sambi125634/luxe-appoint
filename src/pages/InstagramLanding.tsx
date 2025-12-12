import { useParams, useSearchParams, Link } from "react-router-dom";
import { Calendar, MapPin, Phone, Clock, Instagram, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

// Mock salon data - in production this would come from API
const mockSalonData = {
  name: "Demo Salon Beauty",
  description: "Twój ulubiony salon kosmetyczny w sercu miasta. Oferujemy profesjonalne usługi z najwyższej jakości produktami.",
  logo: null,
  address: "ul. Piękna 15, 00-001 Warszawa",
  phone: "+48 123 456 789",
  hours: "Pon-Pt: 9:00-20:00, Sob: 10:00-16:00",
  instagram: "@demosalonbeauty",
  primaryColor: "hsl(271, 76%, 53%)" // Primary violet
};

export default function InstagramLanding() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const ref = searchParams.get("ref") || "instagram";

  // In production, fetch salon data based on slug
  const salon = mockSalonData;

  const bookingUrl = `/s/${slug}?utm_source=${ref}&utm_medium=landing`;

  useEffect(() => {
    document.title = `${salon.name} | Rezerwacja Online`;
  }, [salon.name]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex flex-col items-center justify-center p-4">
        {/* Animated background elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-md space-y-6">
          {/* Logo / Name */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <Sparkles className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-serif font-bold">{salon.name}</h1>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              {salon.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: "100ms" }}>
            {/* Primary CTA - Book Now */}
            <Link to={bookingUrl} className="block">
              <Button 
                className="w-full h-14 text-lg gap-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/30 group"
              >
                <Calendar className="w-5 h-5" />
                Zarezerwuj wizytę
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {/* Secondary actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-12 gap-2"
                onClick={() => window.open(`tel:${salon.phone.replace(/\s/g, "")}`)}
              >
                <Phone className="w-4 h-4" />
                Zadzwoń
              </Button>
              <Button 
                variant="outline" 
                className="h-12 gap-2"
                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(salon.address)}`)}
              >
                <MapPin className="w-4 h-4" />
                Mapa
              </Button>
            </div>

            {/* Info cards */}
            <div className="grid gap-3 pt-2">
              <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur rounded-lg border">
                <Clock className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Godziny otwarcia</p>
                  <p className="text-muted-foreground">{salon.hours}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card/50 backdrop-blur rounded-lg border">
                <MapPin className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">Adres</p>
                  <p className="text-muted-foreground">{salon.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social proof / Instagram */}
          <div 
            className="text-center pt-4 animate-fade-in" 
            style={{ animationDelay: "200ms" }}
          >
            <a 
              href={`https://instagram.com/${salon.instagram?.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Instagram className="w-4 h-4" />
              {salon.instagram}
            </a>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 text-xs text-muted-foreground animate-fade-in" style={{ animationDelay: "300ms" }}>
            <p>Powered by <span className="text-primary font-medium">Beauty Calendar</span></p>
          </div>
        </div>
      </div>
  );
}
