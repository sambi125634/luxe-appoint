import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Sparkles, MapPin, Phone, Clock } from "lucide-react";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { BookingWidget as WidgetConfig, mockWidgets } from "@/components/admin/widgets/types";

// This would come from API/database
const salonInfo = {
  name: "Luxury Beauty Spa",
  address: "ul. Piękna 15, 00-001 Warszawa",
  phone: "+48 22 123 45 67",
  hours: "Pon-Pt: 9:00-20:00, Sob: 10:00-18:00",
  description: "Twój azyl piękna w sercu Warszawy. Oferujemy kompleksowe usługi kosmetyczne i spa na najwyższym poziomie.",
};

export default function BookingPage() {
  const { slug } = useParams();
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load widget configuration based on slug
    // In production, this would be an API call to load from database
    const loadWidgetConfig = () => {
      setLoading(true);
      
      // Find widget by slug (mock implementation)
      const widget = mockWidgets.find(w => w.slug === slug) || mockWidgets[0];
      setWidgetConfig(widget);
      
      setLoading(false);
    };

    loadWidgetConfig();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary/10 via-secondary/5 to-accent/10 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">powered by Beauty Calendar</span>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">
                {widgetConfig?.theme?.headerText || salonInfo.name}
              </h1>
              <p className="text-muted-foreground max-w-xl">{salonInfo.description}</p>
            </div>
            
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {salonInfo.address}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                {salonInfo.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {salonInfo.hours}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Booking Widget */}
      <main className="container mx-auto px-4 py-12">
        <BookingWidget widgetConfig={widgetConfig} />
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border mt-auto">
        <div className="container mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">
              {widgetConfig?.theme?.footerText || "Rezerwacje powered by Beauty Calendar"}
            </span>
          </Link>
        </div>
      </footer>
    </div>
  );
}