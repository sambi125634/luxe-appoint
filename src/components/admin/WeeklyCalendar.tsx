import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, CheckCircle, AlertCircle, XCircle, Filter, Phone, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AppointmentModal } from "./AppointmentModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Appointment {
  id: string;
  time: string;
  duration: number;
  client: string;
  clientPhone?: string;
  service: string;
  staff: string;
  staffId: string;
  status: "confirmed" | "pending" | "cancelled" | "no-show" | "completed";
}

const mockAppointments: Appointment[] = [
  { id: "1", time: "09:00", duration: 60, client: "Anna Kowalska", clientPhone: "+48 123 456 789", service: "Peeling kawitacyjny", staff: "Maria N.", staffId: "1", status: "confirmed" },
  { id: "2", time: "10:30", duration: 45, client: "Joanna Nowak", clientPhone: "+48 987 654 321", service: "Stylizacja brwi", staff: "Karolina W.", staffId: "2", status: "confirmed" },
  { id: "3", time: "12:00", duration: 90, client: "Magdalena Wiśniewska", clientPhone: "+48 555 123 456", service: "Masaż relaksacyjny", staff: "Joanna L.", staffId: "3", status: "pending" },
  { id: "4", time: "14:00", duration: 60, client: "Katarzyna Dąbrowska", clientPhone: "+48 111 222 333", service: "Mezoterapia igłowa", staff: "Anna K.", staffId: "4", status: "confirmed" },
  { id: "5", time: "16:00", duration: 45, client: "Agnieszka Lewandowska", clientPhone: "+48 444 555 666", service: "Depilacja laserowa", staff: "Maria N.", staffId: "1", status: "no-show" },
  { id: "6", time: "11:00", duration: 30, client: "Zofia Kowalczyk", clientPhone: "+48 777 888 999", service: "Manicure", staff: "Karolina W.", staffId: "2", status: "completed" },
];

const staff = [
  { id: "1", name: "Maria N.", color: "bg-violet-500" },
  { id: "2", name: "Karolina W.", color: "bg-rose-500" },
  { id: "3", name: "Joanna L.", color: "bg-amber-500" },
  { id: "4", name: "Anna K.", color: "bg-emerald-500" },
];

const hours = Array.from({ length: 12 }, (_, i) => `${(8 + i).toString().padStart(2, "0")}:00`);

const statusConfig = {
  confirmed: { label: "Potwierdzona", icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/10 border-green-500/30" },
  pending: { label: "Oczekuje", icon: AlertCircle, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" },
  cancelled: { label: "Anulowana", icon: XCircle, color: "text-gray-400", bg: "bg-gray-500/10 border-gray-500/30" },
  "no-show": { label: "No-show", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" },
  completed: { label: "Zakończona", icon: CheckCircle, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30" },
};

interface WeeklyCalendarProps {
  onNewAppointment?: () => void;
}

export function WeeklyCalendar({ onNewAppointment }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState(mockAppointments);
  const [draggedAppointment, setDraggedAppointment] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | null>(null);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string | null>(null);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);

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
      toast.success("Wizyta została przeniesiona");
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    if (selectedStaffFilter && apt.staffId !== selectedStaffFilter) return false;
    if (selectedStatusFilter && apt.status !== selectedStatusFilter) return false;
    return true;
  });

  const getAppointmentsForSlot = (dayIndex: number, hour: string) => {
    return filteredAppointments.filter(apt => apt.time === hour);
  };

  const handleSlotClick = (dayIndex: number, hour: string) => {
    const date = weekDays[dayIndex];
    setSelectedSlot({ date, time: hour });
    setEditingAppointment(null);
    setIsModalOpen(true);
  };

  const handleAppointmentClick = (apt: Appointment, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAppointment(apt);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = (appointmentId: string, newStatus: Appointment["status"]) => {
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
    toast.success(`Status zmieniony na: ${statusConfig[newStatus].label}`);
  };

  const handleSaveAppointment = (appointmentData: any) => {
    if (editingAppointment) {
      setAppointments(prev => prev.map(apt => 
        apt.id === editingAppointment.id 
          ? { ...apt, ...appointmentData, client: appointmentData.clientName, service: appointmentData.serviceName, staff: appointmentData.staffName }
          : apt
      ));
    } else {
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        time: appointmentData.time,
        duration: appointmentData.duration,
        client: appointmentData.clientName,
        clientPhone: appointmentData.clientPhone,
        service: appointmentData.serviceName,
        staff: appointmentData.staffName,
        staffId: appointmentData.staffId,
        status: appointmentData.status,
      };
      setAppointments(prev => [...prev, newAppointment]);
    }
    setIsModalOpen(false);
  };

  const handleOpenNewAppointment = () => {
    setEditingAppointment(null);
    setSelectedSlot({ date: new Date(), time: "09:00" });
    setIsModalOpen(true);
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

  const clearFilters = () => {
    setSelectedStaffFilter(null);
    setSelectedStatusFilter(null);
  };

  const hasActiveFilters = selectedStaffFilter || selectedStatusFilter;

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
        <Button variant="luxury" size="sm" className="gap-2" onClick={handleOpenNewAppointment}>
          <Plus className="w-4 h-4" />
          Nowa wizyta
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4 pb-4 border-b border-border">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="w-4 h-4" />
          <span>Filtry:</span>
        </div>
        
        {/* Staff filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={selectedStaffFilter ? "secondary" : "outline"} size="sm">
              {selectedStaffFilter ? staff.find(s => s.id === selectedStaffFilter)?.name : "Specjalista"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedStaffFilter(null)}>
              Wszyscy
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {staff.map(s => (
              <DropdownMenuItem key={s.id} onClick={() => setSelectedStaffFilter(s.id)}>
                <div className={cn("w-3 h-3 rounded-full mr-2", s.color)} />
                {s.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={selectedStatusFilter ? "secondary" : "outline"} size="sm">
              {selectedStatusFilter ? statusConfig[selectedStatusFilter as keyof typeof statusConfig].label : "Status"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setSelectedStatusFilter(null)}>
              Wszystkie
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {Object.entries(statusConfig).map(([key, config]) => (
              <DropdownMenuItem key={key} onClick={() => setSelectedStatusFilter(key)}>
                <config.icon className={cn("w-4 h-4 mr-2", config.color)} />
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Wyczyść filtry
          </Button>
        )}

        {/* Staff legend */}
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {staff.map(s => (
            <div key={s.id} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full", s.color)} />
              <span className="text-xs text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status legend */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
        {Object.entries(statusConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <config.icon className={cn("w-3.5 h-3.5", config.color)} />
            <span className="text-muted-foreground">{config.label}</span>
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
                      className="min-h-[70px] border border-border/50 rounded-lg p-1 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, dayIndex, hour)}
                      onClick={() => handleSlotClick(dayIndex, hour)}
                    >
                      {slotAppointments.map(apt => {
                        const staffMember = staff.find(s => s.id === apt.staffId);
                        const status = statusConfig[apt.status];
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={apt.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, apt.id)}
                            onClick={(e) => handleAppointmentClick(apt, e)}
                            className={cn(
                              "p-2 rounded-md text-xs cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] border",
                              status.bg,
                              draggedAppointment === apt.id && "opacity-50 scale-95"
                            )}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <p className="font-semibold truncate text-foreground">{apt.client}</p>
                              <div className="flex items-center gap-1">
                                <StatusIcon className={cn("w-3.5 h-3.5 flex-shrink-0", status.color)} />
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <button className="p-0.5 hover:bg-foreground/10 rounded">
                                      <MoreHorizontal className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(apt.id, "confirmed"); }}>
                                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                                      Potwierdź
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(apt.id, "completed"); }}>
                                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                                      Zakończona
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange(apt.id, "no-show"); }}>
                                      <XCircle className="w-4 h-4 mr-2 text-red-500" />
                                      No-show
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    {apt.clientPhone && (
                                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); window.open(`tel:${apt.clientPhone}`); }}>
                                        <Phone className="w-4 h-4 mr-2" />
                                        Zadzwoń
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-muted-foreground truncate">{apt.service}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{apt.duration} min</span>
                              </div>
                              <div className={cn("w-2 h-2 rounded-full", staffMember?.color)} />
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

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveAppointment}
        appointment={editingAppointment ? {
          id: editingAppointment.id,
          clientId: "",
          clientName: editingAppointment.client,
          serviceId: "",
          serviceName: editingAppointment.service,
          staffId: editingAppointment.staffId,
          staffName: editingAppointment.staff,
          date: currentDate.toISOString().split('T')[0],
          time: editingAppointment.time,
          duration: editingAppointment.duration,
          notes: "",
          status: editingAppointment.status,
        } : null}
        selectedDate={selectedSlot?.date}
        selectedTime={selectedSlot?.time}
      />
    </div>
  );
}
