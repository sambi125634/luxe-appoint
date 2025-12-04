import { Clock, Sparkles, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type SlotType = 'recommended' | 'popular' | 'standard';

interface TimeSlotCardProps {
  time: string;
  endTime: string;
  isSelected: boolean;
  slotType: SlotType;
  onClick: () => void;
  animationDelay?: number;
  viewerCount?: number;
}

export function TimeSlotCard({
  time,
  endTime,
  isSelected,
  slotType,
  onClick,
  animationDelay = 0,
  viewerCount
}: TimeSlotCardProps) {
  const { t } = useTranslation();

  const slotStyles = {
    recommended: {
      base: "border-emerald-500/40 bg-gradient-to-br from-emerald-500/15 to-emerald-600/5",
      hover: "hover:border-emerald-500/70 hover:shadow-emerald-500/20",
      icon: <Sparkles className="w-3 h-3 text-emerald-500" />,
      badge: t('booking.slot.recommended'),
      badgeClass: "bg-emerald-500 text-white"
    },
    popular: {
      base: "border-amber-500/40 bg-gradient-to-br from-amber-500/15 to-amber-600/5",
      hover: "hover:border-amber-500/70 hover:shadow-amber-500/20",
      icon: <TrendingUp className="w-3 h-3 text-amber-500" />,
      badge: t('booking.slot.popular'),
      badgeClass: "bg-amber-500 text-white"
    },
    standard: {
      base: "border-border bg-card",
      hover: "hover:border-primary/50 hover:bg-muted/50",
      icon: null,
      badge: null,
      badgeClass: ""
    }
  };

  const style = slotStyles[slotType];

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-xl border-2 transition-all duration-300",
        "animate-scale-in flex flex-col items-center justify-center",
        "hover:scale-105 hover:shadow-lg active:scale-95",
        "min-h-[72px]",
        isSelected
          ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
          : cn(style.base, style.hover),
        slotType === 'recommended' && !isSelected && "animate-pulse-subtle"
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Badge */}
      {style.badge && !isSelected && (
        <span className={cn(
          "absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap",
          style.badgeClass
        )}>
          {style.badge}
        </span>
      )}
      
      {/* Time display */}
      <div className="flex items-center gap-1.5">
        {style.icon && !isSelected && style.icon}
        <span className="text-lg font-bold">{time}</span>
      </div>
      
      {/* End time */}
      <span className={cn(
        "text-xs flex items-center gap-1 mt-0.5",
        isSelected ? "text-primary-foreground/70" : "text-muted-foreground"
      )}>
        <Clock className="w-3 h-3" />
        {endTime}
      </span>
      
      {/* Viewer count indicator */}
      {viewerCount && viewerCount > 0 && !isSelected && (
        <div className={cn(
          "absolute -bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]",
          "bg-muted/80 text-muted-foreground"
        )}>
          <Users className="w-3 h-3" />
          {viewerCount}
        </div>
      )}
    </button>
  );
}

// Helper to determine slot type
export function getSlotType(time: string, recommendedSlots: string[], popularSlots: string[]): SlotType {
  if (recommendedSlots.includes(time)) return 'recommended';
  if (popularSlots.includes(time)) return 'popular';
  return 'standard';
}
