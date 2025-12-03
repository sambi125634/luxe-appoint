import { Calendar, Clock, User, Sparkles, MapPin } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ClientData } from "./ClientForm";

interface BookingSummaryProps {
  service: { name: string; duration: number; price: number } | null;
  staff: { name: string } | null;
  date: Date | null;
  time: string | null;
  client: ClientData;
}

export function BookingSummary({ service, staff, date, time, client }: BookingSummaryProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Podsumowanie</h2>
        <p className="text-muted-foreground">Sprawdź szczegóły przed potwierdzeniem</p>
      </div>

      <div className="glass-card-elevated p-6 space-y-6">
        {/* Service */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Usługa</p>
            <p className="font-semibold text-lg">{service?.name}</p>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {service?.duration} min
              </span>
              <span className="font-semibold text-accent">{service?.price} zł</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Staff */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Specjalista</p>
            <p className="font-semibold text-lg">
              {staff ? staff.name : "Dowolny specjalista"}
            </p>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Date & Time */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
            <Calendar className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Termin</p>
            <p className="font-semibold text-lg">
              {date ? format(date, "EEEE, d MMMM yyyy", { locale: pl }) : "—"}
            </p>
            <p className="text-accent font-medium">{time}</p>
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* Client info */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
            <MapPin className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dane kontaktowe</p>
            <p className="font-semibold">{client.firstName} {client.lastName}</p>
            <p className="text-sm text-muted-foreground">{client.phone}</p>
            <p className="text-sm text-muted-foreground">{client.email}</p>
          </div>
        </div>

        {client.notes && (
          <>
            <div className="h-px bg-border" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Uwagi</p>
              <p className="text-sm">{client.notes}</p>
            </div>
          </>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl">
        <span className="font-medium">Do zapłaty na miejscu</span>
        <span className="text-2xl font-serif font-bold text-primary">{service?.price} zł</span>
      </div>
    </div>
  );
}
