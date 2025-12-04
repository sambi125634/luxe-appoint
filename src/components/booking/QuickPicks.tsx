import { Zap, Star, Briefcase, Clock } from "lucide-react";
import { format, addDays, isToday, isTomorrow } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface QuickPickOption {
  id: string;
  date: Date;
  time: string;
  label: string;
  sublabel: string;
  icon: typeof Zap;
  variant: 'recommended' | 'popular' | 'afterWork';
}

interface QuickPicksProps {
  onSelect: (date: Date, time: string) => void;
  availableSlots: Record<string, string[]>;
}

export function QuickPicks({ onSelect, availableSlots }: QuickPicksProps) {
  const { t } = useTranslation();
  
  const getQuickPickOptions = (): QuickPickOption[] => {
    const options: QuickPickOption[] = [];
    const today = new Date();
    
    // Find nearest available slot
    for (let i = 0; i < 14; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = availableSlots[dateStr] || [];
      
      if (slots.length > 0) {
        const nearestSlot = slots[0];
        const dateLabel = isToday(date) 
          ? t('booking.quickPicks.today')
          : isTomorrow(date) 
          ? t('booking.quickPicks.tomorrow')
          : format(date, 'EEEE', { locale: pl });
        
        options.push({
          id: 'nearest',
          date,
          time: nearestSlot,
          label: t('booking.quickPicks.nearest'),
          sublabel: `${dateLabel}, ${nearestSlot}`,
          icon: Zap,
          variant: 'recommended'
        });
        break;
      }
    }
    
    // Find popular after-work slot (17:00-18:30)
    const afterWorkTimes = ['17:00', '17:30', '18:00', '18:30'];
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = availableSlots[dateStr] || [];
      
      const afterWorkSlot = afterWorkTimes.find(time => slots.includes(time));
      if (afterWorkSlot) {
        const dateLabel = isToday(date) 
          ? t('booking.quickPicks.today')
          : isTomorrow(date) 
          ? t('booking.quickPicks.tomorrow')
          : format(date, 'EEE d', { locale: pl });
        
        options.push({
          id: 'afterWork',
          date,
          time: afterWorkSlot,
          label: t('booking.quickPicks.afterWork'),
          sublabel: `${dateLabel}, ${afterWorkSlot}`,
          icon: Briefcase,
          variant: 'afterWork'
        });
        break;
      }
    }
    
    // Find popular midday slot
    const popularTimes = ['12:00', '12:30', '13:00', '11:00', '11:30'];
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const slots = availableSlots[dateStr] || [];
      
      const popularSlot = popularTimes.find(time => slots.includes(time));
      if (popularSlot && options.length < 3) {
        const dateLabel = isToday(date) 
          ? t('booking.quickPicks.today')
          : isTomorrow(date) 
          ? t('booking.quickPicks.tomorrow')
          : format(date, 'EEE d', { locale: pl });
        
        options.push({
          id: 'popular',
          date,
          time: popularSlot,
          label: t('booking.quickPicks.popular'),
          sublabel: `${dateLabel}, ${popularSlot}`,
          icon: Star,
          variant: 'popular'
        });
        break;
      }
    }
    
    return options;
  };

  const options = getQuickPickOptions();

  if (options.length === 0) return null;

  const variantStyles = {
    recommended: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 hover:border-emerald-500/60",
    popular: "bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-500/60",
    afterWork: "bg-gradient-to-br from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-500/60"
  };

  const iconStyles = {
    recommended: "text-emerald-500",
    popular: "text-amber-500",
    afterWork: "text-violet-500"
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <h3 className="font-medium text-sm">{t('booking.quickPicks.title')}</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {options.map((option, index) => (
          <button
            key={option.id}
            onClick={() => onSelect(option.date, option.time)}
            className={cn(
              "relative p-4 rounded-xl border-2 transition-all duration-300",
              "hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
              "animate-fade-in text-left group",
              variantStyles[option.variant]
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {option.variant === 'recommended' && (
              <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-white text-xs font-medium rounded-full animate-pulse">
                {t('booking.slot.recommended')}
              </span>
            )}
            
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg bg-background/50",
                iconStyles[option.variant]
              )}>
                <option.icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{option.label}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {option.sublabel}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
