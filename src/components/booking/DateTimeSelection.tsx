import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface DateTimeSelectionProps {
  onSelect: (date: Date, time: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
}

const generateTimeSlots = () => {
  const slots: string[] = [];
  for (let hour = 9; hour <= 19; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < 19) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

const timeSlots = generateTimeSlots();

// Simulate some busy slots
const busySlots: Record<string, string[]> = {
  [format(new Date(), 'yyyy-MM-dd')]: ['10:00', '11:30', '14:00'],
  [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ['09:00', '09:30', '15:00', '15:30'],
  [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: ['12:00', '12:30', '13:00'],
};

export function DateTimeSelection({ onSelect, selectedDate, selectedTime }: DateTimeSelectionProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const goToPreviousWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, -1));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  };

  const canGoPrevious = !isBefore(addWeeks(currentWeekStart, -1), startOfWeek(new Date(), { weekStartsOn: 1 }));

  const getAvailableSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const busy = busySlots[dateStr] || [];
    return timeSlots.filter(slot => !busy.includes(slot));
  };

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">Wybierz termin</h2>
        <p className="text-muted-foreground">Znajdź dogodną datę i godzinę wizyty</p>
      </div>

      {/* Week navigation */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousWeek}
            disabled={!canGoPrevious}
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-medium">
            {format(currentWeekStart, 'd MMM', { locale: pl })} - {format(addDays(currentWeekStart, 6), 'd MMM yyyy', { locale: pl })}
          </span>
          <Button variant="ghost" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const isPast = isBefore(day, new Date()) && !isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const dayAvailableSlots = getAvailableSlots(day);
            const hasAvailability = dayAvailableSlots.length > 0 && !isPast;

            return (
              <button
                key={day.toISOString()}
                onClick={() => !isPast && hasAvailability && onSelect(day, selectedTime || '')}
                disabled={isPast || !hasAvailability}
                className={cn(
                  "flex flex-col items-center p-3 rounded-xl transition-all duration-300",
                  "animate-fade-in",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : hasAvailability
                    ? "bg-card hover:bg-muted border border-border hover:border-primary/50"
                    : "bg-muted/50 text-muted-foreground cursor-not-allowed"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <span className="text-xs uppercase opacity-70">
                  {format(day, 'EEE', { locale: pl })}
                </span>
                <span className="text-lg font-semibold">
                  {format(day, 'd')}
                </span>
                {hasAvailability && (
                  <span className={cn(
                    "text-xs mt-1",
                    isSelected ? "text-primary-foreground/80" : "text-accent"
                  )}>
                    {dayAvailableSlots.length} terminów
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="animate-fade-in">
          <h3 className="font-medium mb-3">Dostępne godziny</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {availableSlots.map((time, index) => (
              <button
                key={time}
                onClick={() => onSelect(selectedDate, time)}
                className={cn(
                  "py-3 px-4 rounded-lg text-sm font-medium transition-all duration-300",
                  "animate-scale-in",
                  selectedTime === time
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card border border-border hover:border-primary/50 hover:bg-muted"
                )}
                style={{ animationDelay: `${index * 20}ms` }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
