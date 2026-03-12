import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { AppointmentBlock, type AppointmentBlockData } from "./AppointmentBlock";
import { NowLine } from "./NowLine";

interface StaffInfo {
  id: string;
  name: string;
  color: string;
}

interface DayColumnViewProps {
  date: Date;
  staff: StaffInfo[];
  appointments: AppointmentBlockData[];
  draggedId: string | null;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDropOnStaff: (e: React.DragEvent, staffId: string, time: string) => void;
  onSlotClick: (staffId: string, time: string) => void;
  onAppointmentClick: (apt: AppointmentBlockData, e: React.MouseEvent) => void;
}

const DAY_START = 8;
const DAY_END = 20;
const SLOT_HEIGHT = 48; // px per 30 min
const SLOTS = Array.from({ length: (DAY_END - DAY_START) * 2 }, (_, i) => {
  const totalMin = DAY_START * 60 + i * 30;
  const hh = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const mm = (totalMin % 60).toString().padStart(2, "0");
  return `${hh}:${mm}`;
});

export function DayColumnView({
  date,
  staff,
  appointments,
  draggedId,
  onDragStart,
  onDropOnStaff,
  onSlotClick,
  onAppointmentClick,
}: DayColumnViewProps) {
  const appointmentsByStaff = useMemo(() => {
    const map: Record<string, AppointmentBlockData[]> = {};
    staff.forEach((s) => (map[s.id] = []));
    appointments.forEach((a) => {
      if (map[a.staffId]) map[a.staffId].push(a);
    });
    return map;
  }, [appointments, staff]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const getTimeFromY = (e: React.DragEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.max(0, Math.min(SLOTS.length - 1, Math.floor(y / SLOT_HEIGHT)));
    return SLOTS[slotIndex];
  };

  const totalHeight = SLOTS.length * SLOT_HEIGHT;

  return (
    <div className="overflow-auto">
      <div className="min-w-[600px]">
        {/* Staff header */}
        <div
          className="grid gap-px bg-border sticky top-0 z-10"
          style={{ gridTemplateColumns: `64px repeat(${staff.length}, 1fr)` }}
        >
          <div className="bg-background" />
          {staff.map((s) => (
            <div
              key={s.id}
              className="bg-background text-center py-3 border-b-2"
              style={{
                borderBottomColor: `hsl(var(--${s.color.replace("bg-", "")}))`,
              }}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-bold text-primary-foreground",
                  s.color
                )}
              >
                {s.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <p className="text-xs font-medium text-foreground truncate px-1">
                {s.name}
              </p>
            </div>
          ))}
        </div>

        {/* Grid body */}
        <div
          className="grid gap-px bg-border"
          style={{ gridTemplateColumns: `64px repeat(${staff.length}, 1fr)` }}
        >
          {/* Time labels column */}
          <div className="bg-background relative" style={{ height: totalHeight }}>
            {SLOTS.map((time, i) => (
              <div
                key={time}
                className="absolute left-0 right-0 flex items-start justify-end pr-2"
                style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
              >
                {i % 2 === 0 && (
                  <span className="text-[11px] text-muted-foreground -mt-[7px]">
                    {time}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Staff columns */}
          {staff.map((s) => (
            <div
              key={s.id}
              className="bg-background relative"
              style={{ height: totalHeight }}
              onDragOver={handleDragOver}
              onDrop={(e) => {
                const time = getTimeFromY(e, e.currentTarget as HTMLElement);
                onDropOnStaff(e, s.id, time);
              }}
            >
              {/* Slot grid lines */}
              {SLOTS.map((time, i) => (
                <div
                  key={time}
                  className={cn(
                    "absolute left-0 right-0 border-t cursor-pointer hover:bg-primary/5 transition-colors",
                    i % 2 === 0 ? "border-border" : "border-border/30"
                  )}
                  style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT }}
                  onClick={() => onSlotClick(s.id, time)}
                />
              ))}

              {/* Appointment blocks */}
              {(appointmentsByStaff[s.id] || []).map((apt) => (
                <AppointmentBlock
                  key={apt.id}
                  appointment={apt}
                  slotHeight={SLOT_HEIGHT}
                  dayStartHour={DAY_START}
                  staffColor={s.color}
                  isDragging={draggedId === apt.id}
                  onDragStart={onDragStart}
                  onClick={onAppointmentClick}
                />
              ))}

              {/* Now line */}
              <NowLine dayStartHour={DAY_START} slotHeight={SLOT_HEIGHT} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
