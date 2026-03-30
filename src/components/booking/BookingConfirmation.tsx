import { useState, useEffect } from "react";
import { Check, Calendar, Clock, User, MapPin, Phone, CalendarPlus, Navigation, Share2, Sparkles, UserPlus, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { Confetti } from "./Confetti";

interface Service {
  name: string;
  duration: number;
  price: number;
}

interface Staff {
  name: string;
}

interface BookingConfirmationProps {
  service: Service | null;
  staff: Staff | null;
  date: Date | null;
  time: string | null;
  clientName: string;
  bookingRef?: string;
}

// Salon info
const salonInfo = {
  name: "Luxury Beauty Spa",
  address: "ul. Piękna 15, 00-001 Warszawa",
  phone: "+48 22 123 45 67",
};

// Service-specific preparation instructions
const preparationInstructions: Record<string, string[]> = {
  "Mezoterapia igłowa": [
    "Nie stosuj retinolu 3 dni przed zabiegiem",
    "Unikaj ekspozycji na słońce",
    "Przyjdź z oczyszczoną twarzą, bez makijażu",
  ],
  "Depilacja laserowa bikini": [
    "Ogól obszar zabiegowy 1-2 dni przed wizytą",
    "Unikaj opalania 2 tygodnie przed zabiegiem",
    "Nie stosuj kremów samoopalających",
  ],
  "Peeling kawitacyjny": [
    "Przyjdź z oczyszczoną twarzą",
    "Unikaj silnych peelingów 3 dni przed",
  ],
  "default": [
    "Przyjdź 5-10 minut przed umówioną godziną",
    "W razie pytań skontaktuj się z nami",
  ],
};

export function BookingConfirmation({ 
  service, 
  staff, 
  date, 
  time, 
  clientName,
  bookingRef = "BC" + Date.now().toString().slice(-6)
}: BookingConfirmationProps) {
  const [showPreparation, setShowPreparation] = useState(true);
  const [accountCreated, setAccountCreated] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    // Hide confetti after animation
    const timer = setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);
  
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
    
    const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service.name + " - " + salonInfo.name)}&dates=${formatForGoogle(startDate)}/${formatForGoogle(endDate)}&location=${encodeURIComponent(salonInfo.address)}&details=${encodeURIComponent("Wizyta w " + salonInfo.name + "\nNumer rezerwacji: " + bookingRef)}`;
    
    window.open(googleUrl, "_blank");
  };

  const downloadIcal = () => {
    if (!date || !time || !service) return;

    const startDate = new Date(date);
    const [hours, minutes] = time.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);

    const formatIcal = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icalContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${formatIcal(startDate)}`,
      `DTEND:${formatIcal(endDate)}`,
      `SUMMARY:${service.name} — ${salonInfo.name}`,
      `LOCATION:${salonInfo.address}`,
      `DESCRIPTION:Numer rezerwacji: ${bookingRef}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n");

    const blob = new Blob([icalContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "wizyta.ics";
    link.click();
    URL.revokeObjectURL(url);
  };

  const openMaps = () => {
    window.open(`https://maps.google.com/?q=${encodeURIComponent(salonInfo.address)}`, "_blank");
  };

  const shareBooking = async () => {
    const text = `Moja wizyta w ${salonInfo.name}\n📅 ${date ? format(date, "d MMMM yyyy", { locale: pl }) : ""} o ${time}\n💇 ${service?.name}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: "Moja rezerwacja", text });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      navigator.clipboard.writeText(text);
      toast({ title: "Skopiowano", description: "Szczegóły rezerwacji skopiowane do schowka" });
    }
  };

  const handleCreateAccount = () => {
    // Simulate account creation
    setAccountCreated(true);
    toast({
      title: "Konto utworzone!",
      description: "Możesz teraz szybciej rezerwować kolejne wizyty.",
    });
  };

  const instructions = service?.name 
    ? (preparationInstructions[service.name] || preparationInstructions["default"])
    : preparationInstructions["default"];

  return (
    <div className="min-h-[500px] flex flex-col items-center animate-scale-in">
      {/* Confetti animation */}
      {showConfetti && <Confetti duration={4000} />}
      
      {/* Success icon */}
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mb-6 shadow-glow">
        <Check className="w-10 h-10 text-primary-foreground" />
      </div>
      
      <h2 className="text-3xl font-serif font-bold mb-2 text-center">Rezerwacja potwierdzona!</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Dziękujemy, {clientName.split(" ")[0]}! Potwierdzenie zostało wysłane na Twój e-mail i SMS.
      </p>

      {/* Boarding Pass Card */}
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-2xl border-2 border-primary/20 bg-card shadow-xl">
          {/* Decorative notches */}
          <div className="absolute -left-3 top-[140px] w-6 h-6 rounded-full bg-background" />
          <div className="absolute -right-3 top-[140px] w-6 h-6 rounded-full bg-background" />
          
          {/* Header */}
          <div className="bg-gradient-to-r from-primary via-primary to-secondary p-5 text-primary-foreground">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-serif font-bold">{salonInfo.name}</span>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs opacity-70 mb-1">NUMER REZERWACJI</p>
                <p className="text-xl font-mono font-bold tracking-wider">{bookingRef}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-70 mb-1">KLIENT</p>
                <p className="font-medium">{clientName}</p>
              </div>
            </div>
          </div>

          {/* Dotted divider */}
          <div className="border-t-2 border-dashed border-border mx-6" />

          {/* Main info */}
          <div className="p-5 space-y-4">
            {/* Date & Time */}
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">DATA</p>
                <p className="text-2xl font-serif font-bold">
                  {date ? format(date, "d", { locale: pl }) : "—"}
                </p>
                <p className="text-sm font-medium">
                  {date ? format(date, "MMM yyyy", { locale: pl }) : ""}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {date ? format(date, "EEEE", { locale: pl }) : ""}
                </p>
              </div>
              
              <div className="flex flex-col items-center px-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
              
              <div className="text-center flex-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">GODZINA</p>
                <p className="text-2xl font-serif font-bold text-primary">{time}</p>
                <p className="text-sm font-medium">— {endTime()}</p>
                <p className="text-xs text-muted-foreground mt-1">{service?.duration} min</p>
              </div>
            </div>

            {/* Service */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">ZABIEG</p>
                  <p className="font-semibold">{service?.name}</p>
                  {staff && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <User className="w-3 h-3" />
                      {staff.name}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">CENA</p>
                  <p className="text-xl font-bold text-primary">{service?.price} zł</p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">{salonInfo.name}</p>
                <p className="text-muted-foreground">{salonInfo.address}</p>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-5 pb-5">
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-col h-auto py-3 gap-1"
                onClick={addToCalendar}
              >
                <CalendarPlus className="w-4 h-4" />
                <span className="text-[10px]">Kalendarz</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-col h-auto py-3 gap-1"
                onClick={openMaps}
              >
                <Navigation className="w-4 h-4" />
                <span className="text-[10px]">Nawiguj</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-col h-auto py-3 gap-1"
                onClick={shareBooking}
              >
                <Share2 className="w-4 h-4" />
                <span className="text-[10px]">Udostępnij</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Preparation instructions */}
        <div className="mt-6">
          <button 
            onClick={() => setShowPreparation(!showPreparation)}
            className="w-full flex items-center justify-between p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-left"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-amber-800 dark:text-amber-200">Przygotowanie do wizyty</span>
            </div>
            {showPreparation ? (
              <ChevronUp className="w-4 h-4 text-amber-600" />
            ) : (
              <ChevronDown className="w-4 h-4 text-amber-600" />
            )}
          </button>
          
          {showPreparation && (
            <div className="p-4 border border-t-0 border-amber-200 dark:border-amber-800 rounded-b-xl bg-amber-50/50 dark:bg-amber-950/20 animate-fade-in">
              <ul className="space-y-2">
                {instructions.map((instruction, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                    <span className="text-amber-600 mt-0.5">•</span>
                    {instruction}
                  </li>
                ))}
              </ul>
              <p className="text-xs text-muted-foreground mt-3">
                W razie pytań: {salonInfo.phone}
              </p>
            </div>
          )}
        </div>

        {/* Create account CTA */}
        {!accountCreated ? (
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm mb-1">Załóż konto i rezerwuj szybciej</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Zapisz swoje dane i historię wizyt. Kolejna rezerwacja zajmie tylko minutę!
                </p>
                <Button size="sm" variant="outline" onClick={handleCreateAccount} className="gap-2">
                  <UserPlus className="w-4 h-4" />
                  Utwórz konto (1 klik)
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl animate-fade-in">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <Check className="w-5 h-5" />
              <span className="font-medium">Konto utworzone!</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Przy kolejnej wizycie Twoje dane będą już wypełnione.
            </p>
          </div>
        )}

        {/* Beauty Calendar branding */}
        <div className="mt-8 text-center space-y-2">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Rezerwacje powered by Beauty Calendar
          </Link>
          <p className="text-[10px] text-muted-foreground">
            Chcesz taki kalendarz dla swojego salonu?{" "}
            <Link to="/" className="text-primary hover:underline">Zobacz więcej</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
