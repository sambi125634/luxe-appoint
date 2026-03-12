import { Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AppointmentBlockData {
  id: string;
  time: string; // "HH:mm"
  duration: number; // minutes
  client: string;
  service: string;
  staff: string;
  staffId: string;
  status: "confirmed" | "pending" | "cancelled";
  price?: number;
  phone?: string;
}

interface AppointmentBlockProps {
  appointment: AppointmentBlockData;
  slotHeight: number; // px per 30-min slot
  dayStartHour: number;
  staffColor: string;
  isDragging?: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (apt: AppointmentBlockData, e: React.MouseEvent) => void;
}

export function AppointmentBlock({
  appointment,
  slotHeight,
  dayStartHour,
  staffColor,
  isDragging,
  onDragStart,
  onClick,
}: AppointmentBlockProps) {
  const [h, m] = appointment.time.split(":").map(Number);
  const minutesFromStart = (h - dayStartHour) * 60 + m;
  const top = (minutesFromStart / 30) * slotHeight;
  const height = Math.max((appointment.duration / 30) * slotHeight - 4, 28);

  const statusBorder =
    appointment.status === "pending"
      ? "border-l-warning"
      : appointment.status === "cancelled"
        ? "border-l-destructive"
        : "border-l-primary";

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={(e) => onDragStart(e, appointment.id)}
            onClick={(e) => onClick(appointment, e)}
            className={cn(
              "absolute left-1 right-1 rounded-md px-2 py-1 cursor-pointer transition-all",
              "hover:shadow-lg hover:scale-[1.02] hover:z-20",
              "border-l-[3px] bg-card shadow-sm",
              statusBorder,
              isDragging && "opacity-40 scale-95",
              appointment.status === "pending" && "opacity-80"
            )}
            style={{ top, height }}
          >
            <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
              {appointment.client}
            </p>
            {height > 40 && (
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {appointment.service}
              </p>
            )}
            {height > 60 && (
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{appointment.duration} min</span>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px]">
          <div className="space-y-1">
            <p className="font-semibold text-sm">{appointment.client}</p>
            <p className="text-xs text-muted-foreground">{appointment.service}</p>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="w-3 h-3" />
              <span>
                {appointment.time} – {appointment.duration} min
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <User className="w-3 h-3" />
              <span>{appointment.staff}</span>
            </div>
            {appointment.price != null && (
              <p className="text-xs font-medium">{appointment.price} zł</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
