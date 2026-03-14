import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { AppointmentBlockData } from "./AppointmentBlock";

interface StaffInfo {
  id: string;
  name: string;
  color: string;
}

interface MonthGridViewProps {
  date: Date;
  staff: StaffInfo[];
  appointments: AppointmentBlockData[];
  onDayClick: (day: Date) => void;
  onAppointmentClick: (apt: AppointmentBlockData, e: React.MouseEvent) => void;
  locale: string;
}

const DAY_NAMES_PL = ["Pn", "Wt", "Śr", "Cz", "Pt", "Sb", "Nd"];
const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthGridView({
  date,
  staff,
  appointments,
  onDayClick,
  onAppointmentClick,
  locale,
}: MonthGridViewProps) {
  const dayNames = locale.startsWith("pl") ? DAY_NAMES_PL : DAY_NAMES_EN;

  const { weeks, monthStart } = useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStart = new Date(year, month, 1);
    // Monday-based: 0=Mon ... 6=Sun
    const startDow = (monthStart.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const calendarStart = new Date(year, month, 1 - startDow);
    const totalCells = Math.ceil((startDow + daysInMonth) / 7) * 7;

    const weeks: Date[][] = [];
    for (let i = 0; i < totalCells; i++) {
      if (i % 7 === 0) weeks.push([]);
      const d = new Date(calendarStart);
      d.setDate(calendarStart.getDate() + i);
      weeks[weeks.length - 1].push(d);
    }
    return { weeks, monthStart };
  }, [date]);

  // Group appointments by date string
  const aptsByDate = useMemo(() => {
    const map: Record<string, AppointmentBlockData[]> = {};
    appointments.forEach((apt) => {
      const key = apt.time; // We'll use a different approach below
    });
    // appointments have dayOffset relative to week start — but for month view
    // we receive all appointments with actual date info encoded differently
    // We rely on the parent passing appointments with a computed dateKey
    return map;
  }, [appointments]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMonth = date.getMonth();

  return (
    <div>
      {/* Staff legend */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border flex-wrap">
        {staff.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", s.color)} />
            <span className="text-sm text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((name) => (
          <div key={name} className="text-center text-xs font-medium text-muted-foreground py-2">
            {name}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="grid gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-1">
            {week.map((day) => {
              const isCurrentMonth = day.getMonth() === currentMonth;
              const isToday = day.toDateString() === today.toDateString();
              // Find appointments for this day
              const dayApts = appointments.filter((apt) => {
                // apt has a _date field injected by parent
                return (apt as AppointmentBlockData & { _date?: string })._date === 
                  `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
              });

              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[90px] border border-border/50 rounded-lg p-1.5 cursor-pointer transition-colors hover:bg-muted/40",
                    !isCurrentMonth && "opacity-40 bg-muted/10",
                    isCurrentMonth && "bg-muted/20",
                    isToday && "ring-2 ring-primary ring-inset bg-primary/5"
                  )}
                  onClick={() => onDayClick(day)}
                >
                  <p
                    className={cn(
                      "text-xs font-medium mb-1",
                      isToday && "text-primary font-bold",
                      !isCurrentMonth && "text-muted-foreground"
                    )}
                  >
                    {day.getDate()}
                  </p>
                  <div className="space-y-0.5">
                    {dayApts.slice(0, 3).map((apt) => {
                      const staffMember = staff.find((s) => s.id === apt.staffId);
                      return (
                        <div
                          key={apt.id}
                          className={cn(
                            "text-[10px] leading-tight px-1 py-0.5 rounded truncate cursor-pointer",
                            staffMember?.color || "bg-primary",
                            "text-primary-foreground"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(apt, e);
                          }}
                          title={`${apt.time} ${apt.client} — ${apt.service}`}
                        >
                          <span className="font-medium">{apt.time}</span>{" "}
                          {apt.client}
                        </div>
                      );
                    })}
                    {dayApts.length > 3 && (
                      <p className="text-[10px] text-muted-foreground pl-1">
                        +{dayApts.length - 3} więcej
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
