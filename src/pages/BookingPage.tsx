import { useParams, Link } from "react-router-dom";
import { Sparkles, MapPin, Phone, Clock } from "lucide-react";
import { BookingWidget } from "@/components/booking/BookingWidget";

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
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">{salonInfo.name}</h1>
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
        <BookingWidget />
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border mt-auto">
        <div className="container mx-auto text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Rezerwacje powered by Beauty Calendar</span>
          </Link>
        </div>
      </footer>
    </div>
  );
}
