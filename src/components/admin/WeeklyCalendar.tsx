import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Appointment {
  id: string;
  time: string;
  duration: number;
  client: string;
  service: string;
  staff: string;
  staffId: string;
  status: "confirmed" | "pending" | "cancelled";
}

const mockAppointments: Appointment[] = [
  { id: "1", time: "09:00", duration: 60, client: "Anna Kowalska", service: "Peeling kawitacyjny", staff: "Maria N.", staffId: "1", status: "confirmed" },
  { id: "2", time: "10:30", duration: 45, client: "Joanna Nowak", service: "Stylizacja brwi", staff: "Karolina W.", staffId: "2", status: "confirmed" },
  { id: "3", time: "12:00", duration: 90, client: "Magdalena Wiśniewska", service: "Masaż relaksacyjny", staff: "Joanna L.", staffId: "3", status: "pending" },
  { id: "4", time: "14:00", duration: 60, client: "Katarzyna Dąbrowska", service: "Mezoterapia igłowa", staff: "Anna K.", staffId: "1", status: "confirmed" },
  { id: "5", time: "16:00", duration: 45, client: "Agnieszka Lewandowska", service: "Depilacja laserowa", staff: "Maria N.", staffId: "1", status: "confirmed" },
];

const staff = [
  { id: "1", name: "Maria N.", color: "bg-primary" },
  { id: "2", name: "Karolina W.", color: "bg-secondary" },
  { id: "3", name: "Joanna L.", color: "bg-accent" },
  { id: "4", name: "Anna K.", color: "bg-chart-1" },
];

const hours = Array.from({ length: 12 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

interface WeeklyCalendarProps {
  onNewAppointment?: () => void;
}

export function WeeklyCalendar({ onNewAppointment }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState(mockAppointments);
  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null);

  const getWeekDays = (date: Date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay() + 1);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      return day;
    });
  };

  const weekDays = getWeekDays(currentDate);

  const navigateWeek = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + direction * 7);
    setCurrentDate(newDate);
  };

  const handleDragStart = (e: React.DragEvent, appointmentId: string) => {
    setDraggedAppointment(appointmentId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, hour: string) => {
    e.preventDefault();
    if (draggedAppointment) {
      setAppointments(prev =>
        prev.map(apt =>
          apt.id === draggedAppointment ? { ...apt, time: hour } : apt
        )
      );
      setDraggedAppointment(null);
    }
  };

  const getAppointmentsForSlot = (dayIndex: number, hour: string) => {
    return appointments.filter(apt => apt.time === hour);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pl-PL", { day: "numeric" });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString("pl-PL", { weekday: "short" });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-serif font-semibold">Kalendarz</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {weekDays[0].toLocaleDateString("pl-PL", { day: "numeric", month: "long" })} - {weekDays[6].toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <Button variant="luxury" size="sm" className="gap-2" onClick={onNewAppointment}>
          <Plus className="w-4 h-4" />
          Nowa wizyta
        </Button>
      </div>

      {/* Staff legend */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
        {staff.map(s => (
          <div key={s.id} className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", s.color)} />
            <span className="text-sm text-muted-foreground">{s.name}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="overflow-auto">
        <div className="min-w-[800px]">
          {/* Days header */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-1 mb-2">
            <div />
            {weekDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "text-center py-2 rounded-lg",
                  isToday(day) && "bg-primary/10"
                )}
              >
                <p className="text-xs text-muted-foreground uppercase">{formatDayName(day)}</p>
                <p className={cn(
                  "text-lg font-semibold",
                  isToday(day) && "text-primary"
                )}>
                  {formatDate(day)}
                </p>
              </div>
            ))}
          </div>

          {/* Time slots */}
          <div className="space-y-1">
            {hours.map(hour => (
              <div key={hour} className="grid grid-cols-[80px_repeat(7,1fr)] gap-1">
                <div className="text-sm text-muted-foreground py-2 text-right pr-3">
                  {hour}
                </div>
                {weekDays.map((_, dayIndex) => {
                  const slotAppointments = getAppointmentsForSlot(dayIndex, hour);
                  return (
                    <div
                      key={dayIndex}
                      className="min-h-[60px] border border-border/50 rounded-lg p-1 bg-muted/20 hover:bg-muted/40 transition-colors"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayIndex, hour)}
                    >
                      {slotAppointments.map(apt => {
                        const staffMember = staff.find(s => s.id === apt.staffId);
                        return (
                          <div
                            key={apt.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, apt.id)}
                            className={cn(
                              "p-2 rounded-md text-xs cursor-move transition-all hover:scale-[1.02]",
                              staffMember?.color || "bg-primary",
                              "text-primary-foreground",
                              draggedAppointment === apt.id && "opacity-50"
                            )}
                          >
                            <p className="font-medium truncate">{apt.client}</p>
                            <p className="opacity-80 truncate">{apt.service}</p>
                            <div className="flex items-center gap-1 mt-1 opacity-70">
                              <Clock className="w-3 h-3" />
                              <span>{apt.duration} min</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
