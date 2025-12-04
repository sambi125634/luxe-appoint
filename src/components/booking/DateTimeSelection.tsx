import { useState, useMemo } from "react";
import { Sun, Sunset, Moon, Info, Users, Clock } from "lucide-react";
import { format, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { QuickPicks } from "./QuickPicks";
import { DaySelector } from "./DaySelector";
import { TimeSlotCard, getSlotType } from "./TimeSlotCard";

interface DateTimeSelectionProps {
  onSelect: (date: Date, time: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  serviceDuration?: number;
  onProceed?: () => void;
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

const allTimeSlots = generateTimeSlots();

// Simulate busy slots (in real app, this comes from API)
const generateBusySlots = () => {
  const busy: Record<string, string[]> = {};
  for (let i = 0; i < 14; i++) {
    const date = addDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    // Random busy slots
    const numBusy = Math.floor(Math.random() * 6) + 2;
    const busyTimes: string[] = [];
    for (let j = 0; j < numBusy; j++) {
      const randomIndex = Math.floor(Math.random() * allTimeSlots.length);
      busyTimes.push(allTimeSlots[randomIndex]);
    }
    busy[dateStr] = busyTimes;
  }
  return busy;
};

const busySlots = generateBusySlots();

// Slots that fill gaps in schedule (recommended for salon)
const recommendedSlots = ['10:00', '14:00', '14:30'];
// Popular after-work slots
const popularSlots = ['17:00', '17:30', '18:00', '18:30'];

type TimeOfDay = 'morning' | 'afternoon' | 'evening';

const getTimeOfDay = (time: string): TimeOfDay => {
  const hour = parseInt(time.split(':')[0]);
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

export function DateTimeSelection({ 
  onSelect, 
  selectedDate, 
  selectedTime,
  serviceDuration = 60,
  onProceed
}: DateTimeSelectionProps) {
  const { t } = useTranslation();
  const [activeTimeOfDay, setActiveTimeOfDay] = useState<TimeOfDay | 'all'>('all');
  const [showAllSlots, setShowAllSlots] = useState(false);
  const [viewingUsers] = useState(Math.floor(Math.random() * 3) + 1);

  const getAvailableSlots = (date: Date): string[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const busy = busySlots[dateStr] || [];
    return allTimeSlots.filter(slot => !busy.includes(slot));
  };

  // Build available slots map for QuickPicks
  const availableSlotsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (let i = 0; i < 14; i++) {
      const date = addDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      map[dateStr] = getAvailableSlots(date);
    }
    return map;
  }, []);

  const handleQuickSelect = (date: Date, time: string) => {
    onSelect(date, time);
    setTimeout(() => {
      onProceed?.();
    }, 200);
  };

  const handleDaySelect = (date: Date) => {
    onSelect(date, selectedTime || '');
  };

  const handleTimeSelect = (time: string) => {
    if (selectedDate) {
      onSelect(selectedDate, time);
      setTimeout(() => {
        onProceed?.();
      }, 150);
    }
  };

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];
  
  const filteredSlots = activeTimeOfDay === 'all' 
    ? availableSlots 
    : availableSlots.filter(slot => getTimeOfDay(slot) === activeTimeOfDay);

  // Sort slots: recommended first, then popular, then standard
  const sortedSlots = [...filteredSlots].sort((a, b) => {
    const typeA = getSlotType(a, recommendedSlots, popularSlots);
    const typeB = getSlotType(b, recommendedSlots, popularSlots);
    const order = { recommended: 0, popular: 1, standard: 2 };
    return order[typeA] - order[typeB];
  });

  const displayedSlots = showAllSlots ? sortedSlots : sortedSlots.slice(0, 6);

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + serviceDuration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const timeOfDayFilters = [
    { key: 'all' as const, label: t('booking.filter.all'), icon: Clock },
    { key: 'morning' as const, label: t('booking.filter.morning'), icon: Sun },
    { key: 'afternoon' as const, label: t('booking.filter.afternoon'), icon: Sunset },
    { key: 'evening' as const, label: t('booking.filter.evening'), icon: Moon },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">{t('booking.selectDateTime')}</h2>
        <p className="text-muted-foreground">{t('booking.findConvenientTime')}</p>
      </div>

      {/* Quick Picks Section */}
      <QuickPicks 
        onSelect={handleQuickSelect}
        availableSlots={availableSlotsMap}
      />

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{t('booking.orChooseManually')}</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Day Selector */}
      <DaySelector
        selectedDate={selectedDate}
        onSelect={handleDaySelect}
        getAvailableSlots={getAvailableSlots}
      />

      {/* Time Slots */}
      {selectedDate && (
        <div className="space-y-4 animate-fade-in">
          {/* Social proof */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{t('booking.availableSlots')}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{t('booking.social.watching', { count: viewingUsers })}</span>
            </div>
          </div>

          {/* Time of day filters */}
          <div className="flex gap-1.5 flex-wrap">
            {timeOfDayFilters.map(({ key, label, icon: Icon }) => (
              <Badge 
                key={key}
                variant={activeTimeOfDay === key ? 'default' : 'secondary'}
                className={cn(
                  "cursor-pointer gap-1.5 transition-all",
                  activeTimeOfDay === key && "shadow-md"
                )}
                onClick={() => setActiveTimeOfDay(key)}
              >
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </Badge>
            ))}
          </div>

          {/* Time slots grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {displayedSlots.map((time, index) => (
              <TimeSlotCard
                key={time}
                time={time}
                endTime={getEndTime(time)}
                isSelected={selectedTime === time}
                slotType={getSlotType(time, recommendedSlots, popularSlots)}
                onClick={() => handleTimeSelect(time)}
                animationDelay={index * 30}
                viewerCount={getSlotType(time, recommendedSlots, popularSlots) === 'popular' ? 
                  Math.floor(Math.random() * 2) + 1 : undefined}
              />
            ))}
          </div>

          {/* Show all toggle */}
          {sortedSlots.length > 6 && (
            <button
              onClick={() => setShowAllSlots(!showAllSlots)}
              className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors flex items-center justify-center gap-2"
            >
              {showAllSlots 
                ? t('booking.showLess')
                : t('booking.showAll', { count: sortedSlots.length - 6 })
              }
            </button>
          )}

          {/* Slot type legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-emerald-500/30 to-emerald-500/10 border border-emerald-500/40" />
              <span>{t('booking.slot.recommendedDesc')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-gradient-to-br from-amber-500/30 to-amber-500/10 border border-amber-500/40" />
              <span>{t('booking.slot.popularDesc')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Booking policy info */}
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <p>
          {t('booking.cancellationPolicy')}
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="text-primary underline ml-1">{t('booking.moreInfo')}</button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>{t('booking.cancellationPolicyFull')}</p>
            </TooltipContent>
          </Tooltip>
        </p>
      </div>
    </div>
  );
}
