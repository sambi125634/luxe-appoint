import { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addDays, isSameDay, isToday, isTomorrow, isBefore, startOfDay } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface DaySelectorProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  getAvailableSlots: (date: Date) => string[];
  daysToShow?: number;
}

export function DaySelector({ 
  selectedDate, 
  onSelect, 
  getAvailableSlots,
  daysToShow = 14 
}: DaySelectorProps) {
  const { t, i18n } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const locale = i18n.language === 'pl' ? pl : enUS;
  
  const days = Array.from({ length: daysToShow }, (_, i) => addDays(new Date(), i));

  const scrollToSelected = () => {
    if (selectedDate && scrollRef.current) {
      const selectedIndex = days.findIndex(d => isSameDay(d, selectedDate));
      if (selectedIndex > -1) {
        const cardWidth = 80; // approximate width + gap
        scrollRef.current.scrollTo({
          left: Math.max(0, selectedIndex * cardWidth - 100),
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    scrollToSelected();
  }, [selectedDate]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getAvailabilityLevel = (slotsCount: number) => {
    if (slotsCount === 0) return 'none';
    if (slotsCount <= 3) return 'low';
    if (slotsCount <= 8) return 'medium';
    return 'high';
  };

  const availabilityColors = {
    none: 'bg-muted/50',
    low: 'bg-gradient-to-t from-amber-500/20 to-transparent',
    medium: 'bg-gradient-to-t from-emerald-500/30 to-transparent',
    high: 'bg-gradient-to-t from-emerald-500/50 to-transparent'
  };

  const getDayLabel = (date: Date): string => {
    if (isToday(date)) return t('booking.day.today');
    if (isTomorrow(date)) return t('booking.day.tomorrow');
    return format(date, 'EEE', { locale });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm text-muted-foreground">{t('booking.selectDay')}</span>
      </div>
      
      <div className="relative group">
        {/* Left scroll button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {/* Scrollable container */}
        <div 
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth pb-2 px-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {days.map((day, index) => {
            const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
            const availableSlots = getAvailableSlots(day);
            const hasAvailability = availableSlots.length > 0 && !isPast;
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const availability = getAvailabilityLevel(availableSlots.length);
            const isSpecialDay = isToday(day) || isTomorrow(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => hasAvailability && onSelect(day)}
                disabled={!hasAvailability}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center justify-center w-[72px] h-[88px] rounded-2xl transition-all duration-300",
                  "animate-fade-in relative overflow-hidden",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg scale-105"
                    : hasAvailability
                    ? "bg-card border border-border hover:border-primary/50 hover:scale-105 hover:shadow-md"
                    : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
                )}
                style={{ animationDelay: `${index * 30}ms` }}
              >
                {/* Availability indicator gradient */}
                {!isSelected && hasAvailability && (
                  <div className={cn(
                    "absolute inset-0 pointer-events-none",
                    availabilityColors[availability]
                  )} />
                )}
                
                {/* Special day badge */}
                {isSpecialDay && !isSelected && hasAvailability && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-medium rounded-full">
                    {isToday(day) ? '!' : '★'}
                  </span>
                )}
                
                <span className={cn(
                  "text-xs font-medium uppercase",
                  isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                )}>
                  {getDayLabel(day)}
                </span>
                
                <span className={cn(
                  "text-2xl font-bold mt-1",
                  isSelected ? "text-primary-foreground" : ""
                )}>
                  {format(day, 'd')}
                </span>
                
                {hasAvailability && (
                  <span className={cn(
                    "text-[10px] mt-1",
                    isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {availableSlots.length} {t('booking.slots')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right scroll button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Availability legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-emerald-500/50 to-emerald-500/10" />
          <span>{t('booking.availability.high')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gradient-to-t from-amber-500/30 to-amber-500/5" />
          <span>{t('booking.availability.low')}</span>
        </div>
      </div>
    </div>
  );
}
