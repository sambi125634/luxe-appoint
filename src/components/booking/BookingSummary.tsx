import { Calendar, Clock, User, Sparkles, MapPin, Phone, Mail, FileText, CalendarPlus, Navigation, Share2 } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ClientData } from "./ClientForm";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BookingSummaryProps {
  service: { name: string; duration: number; price: number } | null;
  staff: { name: string } | null;
  date: Date | null;
  time: string | null;
  client: ClientData;
}

// Salon info - w przyszłości z API
const salonInfo = {
  name: "Luxury Beauty Spa",
  address: "ul. Piękna 15, 00-001 Warszawa",
  phone: "+48 22 123 45 67",
};

export function BookingSummary({ service, staff, date, time, client }: BookingSummaryProps) {
  const endTime = () => {
    if (!time || !service) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + service.duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
  };

  const addToCalendar = () => {
    if (!date || !time || !service) return;
    
    const startDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);
    
    const formatForGoogle = (d: Date) => d.toISOString().replace(/-|:|\.\d{3}/g, "");
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + " - " + salonInfo.name)}&dates=${formatForGoogle(startDate)}/${formatForGoogle(endDate)}&location=${encodeURIComponent(salonInfo.address)}&details=${encodeURIComponent("Wizyta w " + salonInfo.name)}`;
    
    window.open(googleUrl, "_blank");
  };

  const openMaps = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(salonInfo.address)}`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-serif font-semibold mb-2">Podsumowanie wizyty</h2>
        <p className="text-muted-foreground">Sprawdź szczegóły przed potwierdzeniem</p>
      </div>

      {/* Boarding Pass Style Card */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/30 bg-gradient-to-br from-card via-card to-primary/5">
        {/* Decorative circles for "ticket" effect */}
        <div className="absolute -left-4 top-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary/30" />
        <div className="absolute -right-4 top-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary/30" />
        
        {/* Header section */}
        <div className="bg-gradient-to-r from-primary to-secondary p-4 text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="font-serif font-semibold">{salonInfo.name}</span>
            </div>
            <span className="text-xs opacity-80">Potwierdzenie wizyty</span>
          </div>
        </div>
        
        {/* Main content */}
        <div className="p-6 space-y-6">
          {/* Date & Time - Big display */}
          <div className="flex items-center justify-between gap-4">
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Data</p>
              <p className="text-2xl font-serif font-bold">
                {date ? format(date, "d MMM", { locale: pl }) : "—"}
              </p>
              <p className="text-sm text-muted-foreground">
                {date ? format(date, "EEEE", { locale: pl }) : ""}
              </p>
            </div>
            <div className="w-px h-16 bg-border" />
            <div className="text-center flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Godzina</p>
              <p className="text-2xl font-serif font-bold text-primary">{time}</p>
              <p className="text-sm text-muted-foreground">do {endTime()}</p>
            </div>
          </div>

          {/* Dotted line separator */}
          <div className="border-t-2 border-dashed border-border" />

          {/* Service details */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Usługa</p>
                <p className="font-semibold text-lg">{service?.name}</p>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {service?.duration} min
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cena</p>
                <p className="text-xl font-bold text-primary">{service?.price} zł</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Specjalista</p>
                <p className="font-semibold">{staff ? staff.name : "Dowolny dostępny"}</p>
              </div>
            </div>
          </div>

          {/* Dotted line separator */}
          <div className="border-t-2 border-dashed border-border" />

          {/* Client info */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Dane klienta</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{client.firstName} {client.lastName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            </div>
          </div>

          {client.notes && (
            <>
              <div className="border-t border-border" />
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Uwagi</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with salon info */}
        <div className="bg-muted/50 p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <MapPin className="w-4 h-4" />
            <span>{salonInfo.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{salonInfo.phone}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="gap-2" onClick={addToCalendar}>
          <CalendarPlus className="w-4 h-4" />
          Dodaj do kalendarza
        </Button>
        <Button variant="outline" className="gap-2" onClick={openMaps}>
          <Navigation className="w-4 h-4" />
          Otwórz w mapach
        </Button>
      </div>

      {/* Important info */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Ważne:</strong> Prosimy o przybycie 5-10 minut przed wizytą. 
          W razie potrzeby zmiany terminu, prosimy o kontakt min. 24h wcześniej.
        </p>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
        <span className="font-medium">Do zapłaty na miejscu</span>
        <span className="text-2xl font-serif font-bold text-primary">{service?.price} zł</span>
      </div>
    </div>
  );
}
