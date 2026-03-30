import { useState, useMemo, useRef, useEffect } from "react";
import { Sun, Sunset, Moon, Info, Users, ChevronLeft, ChevronRight, Zap, User } from "lucide-react";
import { format, addDays, isSameDay, isBefore, startOfDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import { QuickPicks } from "./QuickPicks";
import { TimeSlotCard, getSlotType } from "./TimeSlotCard";
import { motion, AnimatePresence } from "framer-motion";
import { useSmartSlots } from "@/hooks/useSmartSlots";

const DEMO_STAFF = [
  { id: "s1", name: "Anna K.", initials: "AK", role: "Kosmetolog", rating: 4.9, nextAvailable: "Dziś" },
  { id: "s2", name: "Karolina W.", initials: "KW", role: "Stylistka brwi", rating: 5.0, nextAvailable: "Dziś" },
  { id: "s3", name: "Maria N.", initials: "MN", role: "Specjalistka depilacji", rating: 4.8, nextAvailable: "Jutro" },
  { id: "s4", name: "Joanna L.", initials: "JL", role: "Masażystka", rating: 4.7, nextAvailable: "Jutro" },
];

interface DateTimeSelectionProps {
  onSelect: (date: Date, time: string) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  serviceDuration?: number;
  onProceed?: () => void;
  onStaffSelect?: (staffId: string | null, staffName: string | null) => void;
  salonId?: string | null;
  serviceId?: string;
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

// Fallback slots for demo mode
const fallbackRecommendedSlots = ['10:00', '14:00', '14:30'];
const fallbackPopularSlots = ['17:00', '17:30', '18:00', '18:30'];

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
  onProceed,
  onStaffSelect
}: DateTimeSelectionProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === 'pl' ? pl : enUS;
  const [viewingUsers] = useState(Math.floor(Math.random() * 3) + 1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const timeSlotsRef = useRef<HTMLDivElement>(null);
  const [staffMode, setStaffMode] = useState<'fastest' | 'pick'>('fastest');
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string | null>(null);

  // Smooth scroll to time slots when date is selected
  useEffect(() => {
    if (selectedDate && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [selectedDate]);

  const getAvailableSlots = (date: Date): string[] => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const busy = busySlots[dateStr] || [];
    return allTimeSlots.filter(slot => !busy.includes(slot));
  };

  // Build available slots map for QuickPicks
  const availableSlotsMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (let i = 0; i < 60; i++) {
      const date = addDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      map[dateStr] = getAvailableSlots(date);
    }
    return map;
  }, []);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    // Add padding days at the start (Monday = 0)
    const startDayOfWeek = getDay(start);
    const paddingStart = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;
    const paddingDays: (Date | null)[] = Array(paddingStart).fill(null);
    
    return [...paddingDays, ...days];
  }, [currentMonth]);

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

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const canGoPrevious = !isBefore(startOfMonth(currentMonth), startOfMonth(new Date()));

  const getAvailabilityLevel = (date: Date) => {
    const slots = getAvailableSlots(date);
    if (slots.length === 0) return 'none';
    if (slots.length <= 3) return 'low';
    if (slots.length <= 8) return 'medium';
    return 'high';
  };

  const weekDays = i18n.language === 'pl' 
    ? ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd']
    : ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

  const availableSlots = selectedDate ? getAvailableSlots(selectedDate) : [];

  // Group slots by time of day
  const groupedSlots = useMemo(() => {
    const groups: Record<TimeOfDay, string[]> = {
      morning: [],
      afternoon: [],
      evening: []
    };
    
    availableSlots.forEach(slot => {
      const timeOfDay = getTimeOfDay(slot);
      groups[timeOfDay].push(slot);
    });
    
    return groups;
  }, [availableSlots]);

  const getEndTime = (startTime: string) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + serviceDuration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const timeOfDaySections = [
    { 
      key: 'morning' as TimeOfDay, 
      label: t('booking.filter.morning'), 
      sublabel: '9:00 - 12:00',
      icon: Sun,
      gradient: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-500'
    },
    { 
      key: 'afternoon' as TimeOfDay, 
      label: t('booking.filter.afternoon'), 
      sublabel: '12:00 - 17:00',
      icon: Sunset,
      gradient: 'from-orange-500/20 to-rose-500/10',
      iconColor: 'text-orange-500'
    },
    { 
      key: 'evening' as TimeOfDay, 
      label: t('booking.filter.evening'), 
      sublabel: '17:00 - 19:00',
      icon: Moon,
      gradient: 'from-violet-500/20 to-indigo-500/10',
      iconColor: 'text-violet-500'
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-2">{t('booking.selectDateTime')}</h2>
        <p className="text-muted-foreground">{t('booking.findConvenientTime')}</p>
      </div>

      {/* ── Staff mode toggle ── */}
      <div className="flex gap-2 p-1 bg-muted rounded-xl">
        <button
          onClick={() => {
            setStaffMode('fastest');
            setSelectedStaffFilter(null);
            onStaffSelect?.(null, null);
          }}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            staffMode === 'fastest'
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className={cn("w-4 h-4", staffMode === 'fastest' ? "text-primary" : "text-muted-foreground")} />
          Najszybszy termin
        </button>
        <button
          onClick={() => setStaffMode('pick')}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
            staffMode === 'pick'
              ? "bg-background shadow-sm text-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <User className={cn("w-4 h-4", staffMode === 'pick' ? "text-primary" : "text-muted-foreground")} />
          Wybieram specjalistę
        </button>
      </div>

      {/* ── Staff list (pick mode) ── */}
      <AnimatePresence>
        {staffMode === 'pick' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-xs text-muted-foreground mb-2">Wybierz specjalistę:</p>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedStaffFilter(null);
                  onStaffSelect?.(null, null);
                }}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-xl border-2 whitespace-nowrap transition-all flex-shrink-0 text-sm",
                  selectedStaffFilter === null
                    ? "border-primary bg-primary/5 text-primary font-medium"
                    : "border-border text-muted-foreground"
                )}
              >
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-3 h-3 text-primary" />
                </div>
                Dowolny
              </button>
              {DEMO_STAFF.map(staff => (
                <button
                  key={staff.id}
                  onClick={() => {
                    setSelectedStaffFilter(staff.id);
                    onStaffSelect?.(staff.id, staff.name);
                  }}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-xl border-2 whitespace-nowrap transition-all flex-shrink-0 text-sm",
                    selectedStaffFilter === staff.id
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-border text-muted-foreground"
                  )}
                >
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                    {staff.initials}
                  </div>
                  <span>{staff.name}</span>
                  <span className="text-xs text-muted-foreground">⭐ {staff.rating}</span>
                  {staff.nextAvailable && (
                    <span className="text-xs text-emerald-600 font-medium">{staff.nextAvailable}</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fastest available slot highlight */}
      {staffMode === 'fastest' && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-sm text-emerald-800 dark:text-emerald-200">Najbliższy wolny termin</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Dziś, 14:00 — Anna K.</p>
            </div>
          </div>
          <button
            onClick={() => {
              const today = new Date();
              onSelect(today, '14:00');
              setTimeout(() => onProceed?.(), 200);
            }}
            className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
          >
            Zarezerwuj →
          </button>
        </motion.div>
      )}

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

      {/* Monthly Calendar */}
      <div className="bg-card rounded-xl sm:rounded-2xl border border-border p-3 sm:p-4 shadow-sm">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPreviousMonth}
            disabled={!canGoPrevious}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
          <h3 className="font-semibold text-base sm:text-lg capitalize">
            {format(currentMonth, 'LLLL yyyy', { locale })}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNextMonth}
            className="h-7 w-7 sm:h-8 sm:w-8"
          >
            <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1 sm:py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {calendarDays.map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const availableSlots = getAvailableSlots(day);
            const hasAvailability = availableSlots.length > 0 && !isPast;
            const availability = getAvailabilityLevel(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => hasAvailability && handleDaySelect(day)}
                disabled={!hasAvailability}
                className={cn(
                  "aspect-square rounded-lg sm:rounded-xl flex flex-col items-center justify-center transition-all duration-200 relative p-0.5",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-lg scale-105 z-10"
                    : hasAvailability
                    ? "hover:bg-muted hover:scale-105 cursor-pointer"
                    : "text-muted-foreground/40 cursor-not-allowed",
                  isToday && !isSelected && "ring-1 sm:ring-2 ring-primary/30"
                )}
              >
                <span className={cn(
                  "text-xs sm:text-sm font-medium",
                  isSelected && "font-bold"
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Availability indicator */}
                {hasAvailability && !isSelected && (
                  <div className="flex gap-0.5 mt-0.5">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      availability === 'high' && "bg-emerald-500",
                      availability === 'medium' && "bg-amber-500",
                      availability === 'low' && "bg-rose-400"
                    )} />
                  </div>
                )}
                
                {isSelected && (
                  <span className="text-[8px] sm:text-[10px] opacity-80">{availableSlots.length} {t('booking.slots')}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border text-[10px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" />
            <span>{t('booking.availability.high')}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" />
            <span>{t('booking.availability.medium')}</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
            <span>{t('booking.availability.low')}</span>
          </div>
        </div>
      </div>

      {/* Time Slots - Grouped by time of day */}
      {selectedDate && (
        <div ref={timeSlotsRef} className="space-y-6 scroll-mt-4">
          {/* Header with social proof */}
          <div 
            className="flex items-center justify-between animate-fade-in"
            style={{ animationDelay: '0ms' }}
          >
            <h3 className="font-semibold text-lg">{t('booking.availableSlots')}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
              <Users className="w-3.5 h-3.5" />
              <span>{t('booking.social.watching', { count: viewingUsers })}</span>
            </div>
          </div>

          {/* Time of day sections */}
          {timeOfDaySections.map(({ key, label, sublabel, icon: Icon, gradient, iconColor }, sectionIndex) => {
            const slots = groupedSlots[key];
            if (slots.length === 0) return null;
            
            return (
              <div 
                key={key} 
                className="space-y-3 animate-fade-in"
                style={{ animationDelay: `${(sectionIndex + 1) * 100}ms` }}
              >
                {/* Section header */}
                <div className={cn(
                  "flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r border border-border/50",
                  gradient
                )}>
                  <div className={cn(
                    "w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center shadow-sm",
                    iconColor
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">{label}</h4>
                    <p className="text-xs text-muted-foreground">{sublabel} • {slots.length} {t('booking.slots')}</p>
                  </div>
                </div>

                {/* Time slots grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5 pl-1">
                  {slots.map((time, index) => (
                    <TimeSlotCard
                      key={time}
                      time={time}
                      endTime={getEndTime(time)}
                      isSelected={selectedTime === time}
                      slotType={getSlotType(time, recommendedSlots, popularSlots)}
                      onClick={() => handleTimeSelect(time)}
                      animationDelay={(sectionIndex * 100) + (index * 30)}
                      viewerCount={getSlotType(time, recommendedSlots, popularSlots) === 'popular' ? 
                        Math.floor(Math.random() * 2) + 1 : undefined}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Slot type legend */}
          <div 
            className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground pt-2 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
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
