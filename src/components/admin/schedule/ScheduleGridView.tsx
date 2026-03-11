import { useState, useRef, useEffect, useMemo } from "react";
import { format, addDays, startOfWeek, addWeeks, subWeeks } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Copy, Check, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useSalonId } from "@/hooks/useSalonId";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  StaffMember, 
  StaffSchedule, 
  mockStaffMembers, 
  dayNames 
} from "./types";

interface EditingCell {
  staffId: string;
  dayIndex: number;
}

interface ScheduleGridViewProps {
  isDemo?: boolean;
  onWeekDuplicate?: (staffId: string, weekStart: Date, targetWeeks: number) => void;
}

export function ScheduleGridView({ isDemo = false, onWeekDuplicate }: ScheduleGridViewProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { salonId } = useSalonId();
  const { data: dbStaff } = useStaffMembers();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editValues, setEditValues] = useState({ startTime: "", endTime: "", isWorking: true });
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Staff list: demo vs real
  const staffMembers: StaffMember[] = useMemo(() => {
    if (isDemo) return mockStaffMembers;
    if (!dbStaff) return [];
    return dbStaff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role || "Specjalista",
      color: s.color || "#7c3aed",
    }));
  }, [isDemo, dbStaff]);

  // Fetch working_hours from DB
  const { data: dbWorkingHours } = useQuery({
    queryKey: ["working-hours-grid", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours")
        .select("*")
        .order("day_of_week");
      if (error) throw error;
      return data;
    },
    enabled: !isDemo && !!salonId,
  });

  // Build schedules from DB or mock
  const schedules = useMemo(() => {
    const result: Record<string, StaffSchedule[]> = {};
    
    staffMembers.forEach(staff => {
      result[staff.id] = Array.from({ length: 7 }, (_, i) => {
        const date = format(addDays(currentWeekStart, i), "yyyy-MM-dd");
        const dayOfWeek = (i + 1) % 7; // Monday=1..Sunday=0

        if (!isDemo && dbWorkingHours) {
          const wh = dbWorkingHours.find(
            h => h.staff_id === staff.id && h.day_of_week === dayOfWeek
          );
          if (wh) {
            return {
              staffId: staff.id,
              date,
              startTime: wh.start_time?.substring(0, 5) || "09:00",
              endTime: wh.end_time?.substring(0, 5) || "17:00",
              isWorking: wh.is_working,
            };
          }
        }

        // Default / demo fallback
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        return {
          staffId: staff.id,
          date,
          startTime: isWeekend ? "10:00" : "09:00",
          endTime: isWeekend ? "14:00" : "17:00",
          isWorking: !isWeekend,
        };
      });
    });
    return result;
  }, [staffMembers, currentWeekStart, isDemo, dbWorkingHours]);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const navigateWeek = (direction: number) => {
    setCurrentWeekStart(prev => 
      direction > 0 ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  const handleCellClick = (staffId: string, dayIndex: number) => {
    const schedule = schedules[staffId]?.[dayIndex];
    if (schedule) {
      setEditingCell({ staffId, dayIndex });
      setEditValues({
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        isWorking: schedule.isWorking,
      });
    }
  };

  const handleSaveEdit = async () => {
    if (!editingCell) return;
    
    const dayOfWeek = (editingCell.dayIndex + 1) % 7;

    if (!isDemo && salonId) {
      setIsSaving(true);
      try {
        // Check if record exists
        const { data: existing } = await supabase
          .from("working_hours")
          .select("id")
          .eq("staff_id", editingCell.staffId)
          .eq("day_of_week", dayOfWeek)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("working_hours")
            .update({
              start_time: editValues.startTime,
              end_time: editValues.endTime,
              is_working: editValues.isWorking,
            })
            .eq("id", existing.id);
        } else {
          await supabase
            .from("working_hours")
            .insert({
              staff_id: editingCell.staffId,
              day_of_week: dayOfWeek,
              start_time: editValues.startTime,
              end_time: editValues.endTime,
              is_working: editValues.isWorking,
            });
        }

        queryClient.invalidateQueries({ queryKey: ["working-hours-grid"] });
        queryClient.invalidateQueries({ queryKey: ["working-hours"] });
        toast({ title: "Zapisano", description: "Godziny pracy zostały zaktualizowane" });
      } catch {
        toast({ title: "Błąd", description: "Nie udało się zapisać godzin pracy", variant: "destructive" });
      } finally {
        setIsSaving(false);
      }
    } else if (isDemo) {
      toast({ title: "Tryb Demo", description: "Dane nie zostały zapisane" });
    }

    setEditingCell(null);
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const toggleWorking = () => {
    setEditValues(prev => ({ ...prev, isWorking: !prev.isWorking }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingCell]);

  const getScheduleForCell = (staffId: string, dayIndex: number): StaffSchedule | null => {
    return schedules[staffId]?.[dayIndex] || null;
  };

  const isToday = (date: Date) => {
    return format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
  };

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-serif font-semibold">Siatka grafiku</h2>
          <p className="text-sm text-muted-foreground">Kliknij w komórkę, aby edytować godziny pracy</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[200px] text-center">
            {format(weekDays[0], "d MMM", { locale: pl })} - {format(weekDays[6], "d MMM yyyy", { locale: pl })}
          </span>
          <Button variant="ghost" size="icon" onClick={() => navigateWeek(1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[800px]">
          <thead>
            <tr>
              <th className="p-3 text-left font-medium text-muted-foreground bg-muted/30 rounded-tl-lg w-48">
                Pracownik
              </th>
              {weekDays.map((day, index) => (
                <th 
                  key={index} 
                  className={cn(
                    "p-3 text-center font-medium bg-muted/30",
                    index === 6 && "rounded-tr-lg",
                    isToday(day) && "bg-primary/10"
                  )}
                >
                  <div className="text-xs text-muted-foreground uppercase">{dayNames[(index + 1) % 7]}</div>
                  <div className={cn(
                    "text-lg",
                    isToday(day) && "text-primary font-bold"
                  )}>
                    {format(day, "d")}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffMembers.map((staff) => (
              <tr key={staff.id} className="border-b border-border/50 last:border-b-0">
                <td className="p-3 bg-muted/10">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ backgroundColor: staff.color }}
                    >
                      {staff.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{staff.name}</p>
                      <p className="text-xs text-muted-foreground">{staff.role}</p>
                    </div>
                  </div>
                </td>
                {weekDays.map((day, dayIndex) => {
                  const schedule = getScheduleForCell(staff.id, dayIndex);
                  const isEditing = editingCell?.staffId === staff.id && editingCell?.dayIndex === dayIndex;
                  
                  return (
                    <td 
                      key={dayIndex} 
                      className={cn(
                        "p-2 text-center border-l border-border/30 transition-colors",
                        isToday(day) && "bg-primary/5",
                        !isEditing && "hover:bg-muted/40 cursor-pointer"
                      )}
                      onClick={() => !isEditing && handleCellClick(staff.id, dayIndex)}
                    >
                      {isEditing ? (
                        <div className="flex flex-col gap-2 p-1" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Input
                              ref={inputRef}
                              type="time"
                              value={editValues.startTime}
                              onChange={(e) => setEditValues(prev => ({ ...prev, startTime: e.target.value }))}
                              onKeyDown={handleKeyDown}
                              className="h-7 text-xs px-1"
                              disabled={!editValues.isWorking}
                            />
                            <span className="text-muted-foreground text-xs">-</span>
                            <Input
                              type="time"
                              value={editValues.endTime}
                              onChange={(e) => setEditValues(prev => ({ ...prev, endTime: e.target.value }))}
                              onKeyDown={handleKeyDown}
                              className="h-7 text-xs px-1"
                              disabled={!editValues.isWorking}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <button
                              onClick={toggleWorking}
                              className={cn(
                                "text-xs px-2 py-1 rounded transition-colors",
                                editValues.isWorking 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              )}
                            >
                              {editValues.isWorking ? "Pracuje" : "Wolne"}
                            </button>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={handleSaveEdit}
                                disabled={isSaving}
                              >
                                <Check className="w-3 h-3 text-green-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6" 
                                onClick={handleCancelEdit}
                              >
                                <X className="w-3 h-3 text-red-600" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="group relative">
                          {schedule?.isWorking ? (
                            <div 
                              className="px-2 py-1.5 rounded-md text-xs font-medium transition-all"
                              style={{ 
                                backgroundColor: `${staff.color}15`,
                                borderLeft: `3px solid ${staff.color}`
                              }}
                            >
                              {schedule.startTime} - {schedule.endTime}
                            </div>
                          ) : (
                            <div className="px-2 py-1.5 rounded-md text-xs text-muted-foreground bg-muted/30">
                              Wolne
                            </div>
                          )}
                          <Pencil className="w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity" />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick actions hint */}
      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Pencil className="w-3 h-3" />
          <span>Kliknij komórkę, aby edytować</span>
        </div>
        <div className="flex items-center gap-1">
          <Copy className="w-3 h-3" />
          <span>Enter = zapisz, Esc = anuluj</span>
        </div>
      </div>
    </div>
  );
}
