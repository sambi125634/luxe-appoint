import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, Sun, Sunset, Moon, Info, Sparkles } from "lucide-react";
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday, isBefore } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface DateTimeSelectionProps {
  onSelect: (date: Date, time: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  serviceDuration?: number;
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

// Popular/recommended hours
const popularHours = ['17:00', '17:30', '18:00', '18:30'];

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const getTimeOfDay = (time: string): TimeOfDay => {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const timeOfDayLabels: Record<TimeOfDay, { label: string; icon: typeof Sun }> = {
  morning: { label: 'Poranek', icon: Sun },
  afternoon: { label: 'Popołudnie', icon: Sunset },
  evening: { label: 'Wieczór', icon: Moon },
};

export function DateTimeSelection({ 
  onSelect, 
  selectedDate, 
  selectedTime,
  serviceDuration = 60 
}: DateTimeSelectionProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [activeTimeOfDay, setActiveTimeOfDay] = useState<TimeOfDay | 'all'>('all');

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
  
  const filteredSlots = activeTimeOfDay === 'all' 
    ? availableSlots 
    : availableSlots.filter(slot => getTimeOfDay(slot) === activeTimeOfDay);

  const groupedSlots = {
    morning: availableSlots.filter(s => getTimeOfDay(s) === 'morning'),
    afternoon: availableSlots.filter(s => getTimeOfDay(s) === 'afternoon'),
    evening: availableSlots.filter(s => getTimeOfDay(s) === 'evening'),
  };

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + serviceDuration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

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
        <div className="animate-fade-in space-y-4">
          {/* Time of day filter */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Dostępne godziny</h3>
            <div className="flex gap-1">
              <Badge 
                variant={activeTimeOfDay === 'all' ? 'default' : 'secondary'}
                className="cursor-pointer"
                onClick={() => setActiveTimeOfDay('all')}
              >
                Wszystkie
              </Badge>
              {Object.entries(timeOfDayLabels).map(([key, { label, icon: Icon }]) => (
                <Badge 
                  key={key}
                  variant={activeTimeOfDay === key ? 'default' : 'secondary'}
                  className="cursor-pointer gap-1"
                  onClick={() => setActiveTimeOfDay(key as TimeOfDay)}
                >
                  <Icon className="w-3 h-3" />
                  <span className="hidden sm:inline">{label}</span>
                </Badge>
              ))}
            </div>
          </div>

          {/* Grouped time slots */}
          {activeTimeOfDay === 'all' ? (
            <div className="space-y-4">
              {Object.entries(groupedSlots).map(([period, slots]) => {
                if (slots.length === 0) return null;
                const { label, icon: Icon } = timeOfDayLabels[period as TimeOfDay];
                
                return (
                  <div key={period}>
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                      <span className="text-xs">({slots.length} terminów)</span>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {slots.map((time, index) => {
                        const isPopular = popularHours.includes(time);
                        return (
                          <button
                            key={time}
                            onClick={() => onSelect(selectedDate, time)}
                            className={cn(
                              "relative py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300",
                              "animate-scale-in flex flex-col items-center",
                              selectedTime === time
                                ? "bg-primary text-primary-foreground shadow-soft"
                                : "bg-card border border-border hover:border-primary/50 hover:bg-muted"
                            )}
                            style={{ animationDelay: `${index * 20}ms` }}
                          >
                            {isPopular && selectedTime !== time && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                            )}
                            <span className="font-semibold">{time}</span>
                            <span className={cn(
                              "text-xs",
                              selectedTime === time ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}>
                              — {getEndTime(time)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredSlots.map((time, index) => {
                const isPopular = popularHours.includes(time);
                return (
                  <button
                    key={time}
                    onClick={() => onSelect(selectedDate, time)}
                    className={cn(
                      "relative py-3 px-2 rounded-lg text-sm font-medium transition-all duration-300",
                      "animate-scale-in flex flex-col items-center",
                      selectedTime === time
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-card border border-border hover:border-primary/50 hover:bg-muted"
                    )}
                    style={{ animationDelay: `${index * 20}ms` }}
                  >
                    {isPopular && selectedTime !== time && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full" />
                    )}
                    <span className="font-semibold">{time}</span>
                    <span className={cn(
                      "text-xs",
                      selectedTime === time ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      — {getEndTime(time)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Popular hours hint */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-accent rounded-full" />
            <span>Popularne godziny</span>
          </div>
        </div>
      )}

      {/* No-show rules */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          Rezerwacja bezpłatna. W razie potrzeby zmiany terminu prosimy o kontakt min. 24h przed wizytą. 
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-primary underline ml-1">Więcej info</button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Nieodwołane wizyty bez uprzedzenia mogą skutkować koniecznością wpłaty depozytu przy kolejnych rezerwacjach.</p>
            </TooltipContent>
          </Tooltip>
        </p>
      </div>
    </div>
  );
}
