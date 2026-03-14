import { useState, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  services: unknown;
  staff_members: unknown;
  salons: unknown;
  [key: string]: unknown;
}

interface BookingsCalendarViewProps {
  bookings: Booking[];
  renderBookingCard: (booking: Booking) => React.ReactNode;
}

const WEEKDAY_LABELS = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];

export function BookingsCalendarView({ bookings, renderBookingCard }: BookingsCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of bookings) {
      if (b.status === "cancelled") continue;
      const key = format(parseISO(b.start_time), "yyyy-MM-dd");
      const arr = map.get(key) ?? [];
      arr.push(b);
      map.set(key, arr);
    }
    return map;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const start = startOfWeek(monthStart, { weekStartsOn: 1 });
    const end = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const selectedBookings = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "yyyy-MM-dd");
    return (bookingsByDate.get(key) ?? []).sort(
      (a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
    );
  }, [selectedDate, bookingsByDate]);

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="h-9 w-9"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="text-base font-bold text-foreground capitalize">
          {format(currentMonth, "LLLL yyyy", { locale: pl })}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="h-9 w-9"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[11px] font-semibold text-muted-foreground py-1">
            {label}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-px bg-border/30 rounded-xl overflow-hidden">
        {calendarDays.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const dayBookings = bookingsByDate.get(key);
          const hasBookings = !!dayBookings?.length;
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={key}
              onClick={() => setSelectedDate(selected ? null : day)}
              className={`
                relative flex flex-col items-center justify-center py-2.5 bg-background transition-colors
                active:scale-95 active:bg-accent/50
                ${!inMonth ? "opacity-30" : ""}
                ${selected ? "bg-primary/10 ring-1 ring-primary" : ""}
                ${today && !selected ? "ring-1 ring-primary/40" : ""}
              `}
            >
              <span
                className={`text-sm leading-none ${
                  today ? "font-bold text-primary" : "text-foreground"
                } ${selected ? "font-bold text-primary" : ""}`}
              >
                {format(day, "d")}
              </span>
              {hasBookings && (
                <div className="flex gap-0.5 mt-1">
                  {dayBookings.slice(0, 3).map((b) => {
                    const salon = b.salons as { theme_primary_color?: string | null } | null;
                    return (
                      <span
                        key={b.id}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          backgroundColor:
                            salon?.theme_primary_color ?? "hsl(var(--primary))",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day details */}
      {selectedDate && (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
          <p className="text-sm font-semibold text-foreground capitalize">
            {format(selectedDate, "EEEE, d MMMM", { locale: pl })}
          </p>
          {selectedBookings.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Brak wizyt w tym dniu</p>
            </div>
          ) : (
            selectedBookings.map((b) => (
              <div key={b.id}>{renderBookingCard(b)}</div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
