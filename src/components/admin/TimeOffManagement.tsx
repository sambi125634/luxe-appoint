import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, parseISO } from "date-fns";
import { pl, enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Calendar, Palmtree, GraduationCap, Stethoscope, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { SectionGuide } from "./SectionGuide";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useSalonId } from "@/hooks/useSalonId";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface TimeOff {
  id: string;
  staffId: string;
  staffName: string;
  staffColor: string;
  type: "vacation" | "sick" | "training" | "other";
  startDate: string;
  endDate: string;
  note?: string;
}

interface StaffMember {
  id: string;
  name: string;
  color: string;
}

const mockStaff: StaffMember[] = [
  { id: "1", name: "Anna Kowalska", color: "#8B5CF6" },
  { id: "2", name: "Maria Nowak", color: "#EC4899" },
  { id: "3", name: "Katarzyna Wiśniewska", color: "#10B981" },
];

const mockTimeOffs: TimeOff[] = [
  {
    id: "1",
    staffId: "1",
    staffName: "Anna Kowalska",
    staffColor: "#8B5CF6",
    type: "vacation",
    startDate: "2025-12-20",
    endDate: "2025-12-27",
    note: "Urlop świąteczny",
  },
  {
    id: "2",
    staffId: "2",
    staffName: "Maria Nowak",
    staffColor: "#EC4899",
    type: "training",
    startDate: "2025-12-10",
    endDate: "2025-12-11",
    note: "Szkolenie z nowych technik makijażu",
  },
  {
    id: "3",
    staffId: "3",
    staffName: "Katarzyna Wiśniewska",
    staffColor: "#10B981",
    type: "sick",
    startDate: "2025-12-05",
    endDate: "2025-12-06",
  },
];

interface TimeOffManagementProps {
  isDemo?: boolean;
}

export function TimeOffManagement({ isDemo = false }: TimeOffManagementProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { salonId } = useSalonId();
  const { data: dbStaff } = useStaffMembers();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<TimeOff | null>(null);
  const [formData, setFormData] = useState({
    staffId: "",
    type: "vacation" as TimeOff["type"],
    startDate: "",
    endDate: "",
    note: "",
  });

  // Real data from DB for production mode
  const { data: dbTimeOffs } = useQuery({
    queryKey: ["time-off", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("time_off")
        .select("*, staff_members(name, color)")
        .order("start_date", { ascending: false });
      if (error) throw error;
      return (data || []).map((item: any) => ({
        id: item.id,
        staffId: item.staff_id,
        staffName: item.staff_members?.name || "—",
        staffColor: item.staff_members?.color || "#7c3aed",
        type: item.type as TimeOff["type"],
        startDate: item.start_date,
        endDate: item.end_date,
        note: item.note || undefined,
      }));
    },
    enabled: !isDemo && !!salonId,
  });

  // Use demo data or real data
  const timeOffs: TimeOff[] = isDemo ? mockTimeOffs : (dbTimeOffs || []);

  // Staff list: demo mock or real from DB
  const staffList: StaffMember[] = isDemo
    ? mockStaff
    : (dbStaff || []).map((s) => ({ id: s.id, name: s.name, color: s.color || "#7c3aed" }));

  // Mutations for production mode
  const createTimeOff = useMutation({
    mutationFn: async (data: { staffId: string; type: string; startDate: string; endDate: string; note?: string }) => {
      const { error } = await supabase.from("time_off").insert({
        staff_id: data.staffId,
        type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        note: data.note || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
      toast.success("Nieobecność została dodana");
    },
    onError: () => toast.error("Nie udało się dodać nieobecności"),
  });

  const updateTimeOff = useMutation({
    mutationFn: async (data: { id: string; staffId: string; type: string; startDate: string; endDate: string; note?: string }) => {
      const { error } = await supabase.from("time_off").update({
        staff_id: data.staffId,
        type: data.type,
        start_date: data.startDate,
        end_date: data.endDate,
        note: data.note || null,
      }).eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
      toast.success("Nieobecność została zaktualizowana");
    },
    onError: () => toast.error("Nie udało się zaktualizować nieobecności"),
  });

  const deleteTimeOffMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("time_off").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time-off"] });
      toast.success("Nieobecność została usunięta");
    },
    onError: () => toast.error("Nie udało się usunąć nieobecności"),
  });

  const locale = i18n.language === 'pl' ? pl : enUS;

  const typeLabels: Record<string, { label: string; icon: React.ElementType; className: string }> = {
    vacation: { label: t('timeOff.types.vacation'), icon: Palmtree, className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" },
    sick: { label: t('timeOff.types.sick'), icon: Stethoscope, className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
    training: { label: t('timeOff.types.training'), icon: GraduationCap, className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
    other: { label: t('timeOff.types.other'), icon: Calendar, className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400" },
  };

  const weekDays = [
    t('timeOff.weekDays.mon'),
    t('timeOff.weekDays.tue'),
    t('timeOff.weekDays.wed'),
    t('timeOff.weekDays.thu'),
    t('timeOff.weekDays.fri'),
    t('timeOff.weekDays.sat'),
    t('timeOff.weekDays.sun')
  ];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const firstDayOfWeek = monthStart.getDay();
  const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const getTimeOffsForDay = (date: Date) => {
    return timeOffs.filter((timeOff) => {
      const start = parseISO(timeOff.startDate);
      const end = parseISO(timeOff.endDate);
      return isWithinInterval(date, { start, end }) || isSameDay(date, start) || isSameDay(date, end);
    });
  };

  const openDialog = (timeOff?: TimeOff) => {
    if (timeOff) {
      setEditingTimeOff(timeOff);
      setFormData({
        staffId: timeOff.staffId,
        type: timeOff.type,
        startDate: timeOff.startDate,
        endDate: timeOff.endDate,
        note: timeOff.note || "",
      });
    } else {
      setEditingTimeOff(null);
      setFormData({
        staffId: "",
        type: "vacation",
        startDate: "",
        endDate: "",
        note: "",
      });
    }
    setIsDialogOpen(true);
  };

  const saveTimeOff = () => {
    const staff = staffList.find((s) => s.id === formData.staffId);
    if (!staff) return;

    if (isDemo) {
      // Demo mode - no persistence
      setIsDialogOpen(false);
      return;
    }

    if (editingTimeOff) {
      updateTimeOff.mutate({
        id: editingTimeOff.id,
        staffId: formData.staffId,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note || undefined,
      });
    } else {
      createTimeOff.mutate({
        staffId: formData.staffId,
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        note: formData.note || undefined,
      });
    }

    setIsDialogOpen(false);
  };

  const deleteTimeOff = (id: string) => {
    if (isDemo) return;
    deleteTimeOffMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <VideoTutorialCard
        title="Jak zarządzać nieobecnościami"
        voiceText="Tutaj zarządzasz urlopami i nieobecnościami pracowników. Kliknij 'Dodaj nieobecność', wybierz pracownika, typ (urlop, chorobowe, szkolenie) i daty. Nieobecności automatycznie blokują sloty w kalendarzu rezerwacji."
      />

      {/* Empty state for production with no staff */}
      {!isDemo && staffList.length === 0 && (
        <div className="glass-card p-12 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarOff className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-serif text-xl font-semibold mb-2">Brak pracowników</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Aby zarządzać nieobecnościami, najpierw dodaj pracowników w sekcji Pracownicy.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      {(isDemo || staffList.length > 0) && (<>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{t('timeOff.title')}</h2>
          <p className="text-muted-foreground">{t('timeOff.subtitle')}</p>
        </div>
        <Button onClick={() => openDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          {t('timeOff.addTimeOff')}
        </Button>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground capitalize">
          {format(currentMonth, "LLLL yyyy", { locale })}
        </h3>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Week days header */}
        <div className="grid grid-cols-7 border-b border-border">
          {weekDays.map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground bg-muted/50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {/* Padding for days before month starts */}
          {Array.from({ length: paddingDays }).map((_, i) => (
            <div key={`padding-${i}`} className="min-h-24 p-2 border-b border-r border-border bg-muted/20" />
          ))}

          {days.map((day, index) => {
            const dayTimeOffs = getTimeOffsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "min-h-24 p-2 border-b border-r border-border transition-colors",
                  !isSameMonth(day, currentMonth) && "bg-muted/30",
                  isToday && "bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "text-sm font-medium mb-1",
                    isToday && "text-primary font-bold",
                    !isToday && "text-foreground"
                  )}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayTimeOffs.slice(0, 2).map((timeOff) => {
                    const TypeIcon = typeLabels[timeOff.type].icon;
                    return (
                      <div
                        key={timeOff.id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${timeOff.staffColor}20`, borderLeft: `3px solid ${timeOff.staffColor}` }}
                        onClick={() => openDialog(timeOff)}
                        title={`${timeOff.staffName} - ${typeLabels[timeOff.type].label}`}
                      >
                        <div className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3 flex-shrink-0" style={{ color: timeOff.staffColor }} />
                          <span className="truncate" style={{ color: timeOff.staffColor }}>
                            {timeOff.staffName.split(" ")[0]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {dayTimeOffs.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayTimeOffs.length - 2} {t('timeOff.more')}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(typeLabels).map(([key, { label, icon: Icon, className }]) => (
          <Badge key={key} variant="secondary" className={cn("gap-1", className)}>
            <Icon className="w-3 h-3" />
            {label}
          </Badge>
        ))}
      </div>

      {/* Time Off List */}
      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-foreground">{t('timeOff.absenceList')}</h3>
        </div>
        <div className="divide-y divide-border">
          {timeOffs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {t('timeOff.noAbsences')}
            </div>
          ) : (
            timeOffs.map((timeOff) => {
              const TypeIcon = typeLabels[timeOff.type].icon;
              return (
                <div key={timeOff.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                      style={{ backgroundColor: timeOff.staffColor }}
                    >
                      {timeOff.staffName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{timeOff.staffName}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(timeOff.startDate), "d MMM", { locale })} -{" "}
                        {format(parseISO(timeOff.endDate), "d MMM yyyy", { locale })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className={cn("gap-1 hidden sm:flex", typeLabels[timeOff.type].className)}>
                      <TypeIcon className="w-3 h-3" />
                      {typeLabels[timeOff.type].label}
                    </Badge>
                    {timeOff.note && (
                      <span className="text-sm text-muted-foreground hidden md:block max-w-48 truncate">
                        {timeOff.note}
                      </span>
                    )}
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(timeOff)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteTimeOff(timeOff.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      </>)}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingTimeOff ? t('timeOff.editTimeOff') : t('timeOff.addTimeOff')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('timeOff.employee')}</Label>
              <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('timeOff.selectEmployee')} />
                </SelectTrigger>
                <SelectContent>
                  {staffList.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: staff.color }} />
                        {staff.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('timeOff.absenceType')}</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as TimeOff["type"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([key, { label, icon: Icon }]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('timeOff.startDate')}</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('timeOff.endDate')}</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('timeOff.note')}</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder={t('timeOff.notePlaceholder')}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              onClick={saveTimeOff}
              disabled={!formData.staffId || !formData.startDate || !formData.endDate}
            >
              {editingTimeOff ? t('timeOff.saveChanges') : t('common.add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
