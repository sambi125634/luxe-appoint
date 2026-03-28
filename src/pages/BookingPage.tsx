import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { Sparkles, MapPin, Phone, Clock, Loader2 } from "lucide-react";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { BookingWidget as WidgetConfig, mockWidgets } from "@/components/admin/widgets/types";
import { supabase } from "@/integrations/supabase/client";

interface SalonInfo {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  description: string | null;
  slug: string;
}

export default function BookingPage() {
  const { slug } = useParams();
  const [isIntro, setIsIntro] = useState(true);
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig | null>(null);
  const [salonInfo, setSalonInfo] = useState<SalonInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSalonData = async () => {
      setLoading(true);
      setError(null);

      if (!slug) {
        setError("Brak identyfikatora salonu");
        setLoading(false);
        return;
      }

      // Check if demo slug
      const isDemo = slug === "demo-salon";

      if (isDemo) {
        const widget = mockWidgets.find(w => w.slug === slug) || mockWidgets[0];
        setWidgetConfig(widget);
        setSalonInfo({
          id: "demo",
          name: "Luxury Beauty Spa",
          address: "ul. Piękna 15, 00-001 Warszawa",
          city: "Warszawa",
          phone: "+48 22 123 45 67",
          description: "Twój azyl piękna w sercu Warszawy. Oferujemy kompleksowe usługi kosmetyczne i spa na najwyższym poziomie.",
          slug: "demo-salon",
        });
        setLoading(false);
        return;
      }

      // Fetch real salon by slug
      const { data: salon, error: salonError } = await supabase
        .from("salons")
        .select("id, name, address, city, phone, description, slug")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (salonError || !salon) {
        setError("Nie znaleziono salonu");
        setLoading(false);
        return;
      }

      setSalonInfo({
        id: salon.id,
        name: salon.name,
        address: salon.address,
        city: salon.city,
        phone: salon.phone,
        description: salon.description,
        slug: salon.slug,
      });

      // Build widget config from real salon data
      const widget: WidgetConfig = {
        ...mockWidgets[0],
        id: "main",
        name: salon.name,
        slug: salon.slug,
        salonId: salon.id,
        isActive: true,
        type: "main",
        theme: {
          ...mockWidgets[0].theme,
          primaryColor: "#7c3aed",
          headerText: salon.name,
        },
      };
      setWidgetConfig(widget);
      setLoading(false);
    };

    loadSalonData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !salonInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif font-bold mb-2">Salon nie znaleziony</h1>
          <p className="text-muted-foreground mb-4">{error || "Sprawdź adres URL i spróbuj ponownie."}</p>
          <Link to="/" className="text-primary hover:underline">Wróć na stronę główną</Link>
        </div>
      </div>
    );
  }

  // On intro step, render widget full-screen without header/footer
  if (isIntro) {
    return (
      <BookingWidget 
        widgetConfig={widgetConfig} 
        salonId={salonInfo.id} 
        onStepChange={(stepId) => setIsIntro(stepId === "intro")}
      />
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
              {salonInfo.description && (
                <p className="text-muted-foreground max-w-xl">{salonInfo.description}</p>
              )}
            </div>
            
            <div className="flex flex-col gap-2 text-sm">
              {salonInfo.address && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  {salonInfo.address}{salonInfo.city ? `, ${salonInfo.city}` : ""}
                </div>
              )}
              {salonInfo.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  {salonInfo.phone}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Booking Widget */}
      <main className="container mx-auto px-4 py-12">
        <BookingWidget 
          widgetConfig={widgetConfig} 
          salonId={salonInfo.id} 
          onStepChange={(stepId) => setIsIntro(stepId === "intro")}
        />
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
