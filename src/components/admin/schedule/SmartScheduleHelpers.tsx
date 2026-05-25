import { useState, useMemo, useCallback } from "react";
import { format, addDays, startOfWeek, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { 
  Lightbulb, 
  Search, 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  Sparkles,
  Calendar,
  User,
  ChevronRight,
  Filter,
  Star,
  MessageSquare,
  Tag,
  ArrowRightLeft,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  ScheduleGap, 
  SmartSlot, 
  OccupancyData, 
  mockStaffMembers 
} from "./types";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";

interface StaffItem {
  id: string;
  name: string;
  color: string;
  role: string | null;
}

// Demo service definitions for search
const DEMO_SERVICES: { id: string; name: string; duration: number }[] = [
  { id: "peeling", name: "Peeling kawitacyjny", duration: 60 },
  { id: "mezoterapia", name: "Mezoterapia igłowa", duration: 90 },
  { id: "masaz", name: "Masaż relaksacyjny", duration: 60 },
  { id: "depilacja", name: "Depilacja laserowa", duration: 45 },
  { id: "brwi", name: "Stylizacja brwi", duration: 30 },
  { id: "rzesy", name: "Przedłużanie rzęs", duration: 120 },
];

// Mock data generators
const generateMockGaps = (staff: StaffItem[]): ScheduleGap[] => {
  const gaps: ScheduleGap[] = [];
  const today = new Date();
  
  staff.forEach(member => {
    const gapCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < gapCount; i++) {
      const dayOffset = Math.floor(Math.random() * 5);
      const startHour = 9 + Math.floor(Math.random() * 8);
      const duration = [30, 45, 60, 75, 90][Math.floor(Math.random() * 5)];
      
      gaps.push({
        staffId: member.id,
        staffName: member.name,
        date: format(addDays(today, dayOffset), "yyyy-MM-dd"),
        startTime: `${startHour.toString().padStart(2, '0')}:00`,
        endTime: `${Math.floor((startHour * 60 + duration) / 60).toString().padStart(2, '0')}:${((startHour * 60 + duration) % 60).toString().padStart(2, '0')}`,
        durationMinutes: duration,
      });
    }
  });
  
  return gaps.sort((a, b) => b.durationMinutes - a.durationMinutes);
};

const generateMockOccupancy = (staff: StaffItem[]): OccupancyData[] => {
  const data: OccupancyData[] = [];
  const today = new Date();
  
  staff.forEach(member => {
    for (let i = 0; i < 7; i++) {
      const totalMinutes = 480;
      const bookedMinutes = Math.floor(Math.random() * 400) + 80;
      data.push({
        staffId: member.id,
        staffName: member.name,
        date: format(addDays(today, i), "yyyy-MM-dd"),
        occupancyPercent: Math.round((bookedMinutes / totalMinutes) * 100),
        totalMinutes,
        bookedMinutes,
      });
    }
  });
  
  return data;
};

const generateSmartSlots = (staff: StaffItem[]): SmartSlot[] => {
  const slots: SmartSlot[] = [];
  const today = new Date();
  
  staff.forEach(member => {
    for (let i = 0; i < 5; i++) {
      const dayOffset = Math.floor(Math.random() * 5);
      const hour = 9 + Math.floor(Math.random() * 9);
      const isRecommended = Math.random() > 0.5;
      
      slots.push({
        date: format(addDays(today, dayOffset), "yyyy-MM-dd"),
        time: `${hour.toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
        staffId: member.id,
        staffName: member.name,
        isRecommended,
        fillsGap: isRecommended && Math.random() > 0.3,
        occupancyBefore: Math.floor(Math.random() * 40) + 30,
        occupancyAfter: Math.floor(Math.random() * 30) + 60,
      });
    }
  });
  
  return slots.filter(s => s.isRecommended).sort((a, b) => b.occupancyAfter - a.occupancyBefore);
};

interface SmartScheduleHelpersProps {
  isDemo?: boolean;
  salonSlug?: string | null;
  onNavigate?: (tab: string) => void;
  onSlotSelect?: (slot: SmartSlot) => void;
  onGapSelect?: (gap: ScheduleGap) => void;
}

interface SearchResult {
  date: string;
  time: string;
  staffName: string;
  staffId: string;
  serviceName: string;
  serviceDuration: number;
}

export function SmartScheduleHelpers({ onSlotSelect, onGapSelect, isDemo = false, salonSlug, onNavigate }: SmartScheduleHelpersProps) {
  const { data: dbStaff } = useStaffMembers();
  const staffMembers: StaffItem[] = isDemo 
    ? mockStaffMembers 
    : (dbStaff || []).map(s => ({ id: s.id, name: s.name, color: s.color || '#7c3aed', role: s.role }));
  const [activeTab, setActiveTab] = useState("gaps");
  const [minGapDuration, setMinGapDuration] = useState(30);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");
  const [nextAvailableService, setNextAvailableService] = useState("");
  const [nextAvailableStaff, setNextAvailableStaff] = useState("");
  const [nextAvailablePreference, setNextAvailablePreference] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ── REAL DATA (admin mode) ─────────────────────────────────────────────
  const { salonId } = useSalonId();
  const staffIds = useMemo(() => staffMembers.map(s => s.id), [staffMembers]);

  const horizonDays = 7;
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);
  const horizonEnd = useMemo(() => addDays(today, horizonDays - 1), [today]);

  // Working hours (cyclic)
  const { data: workingHoursDb = [] } = useQuery({
    queryKey: ["sa-working-hours", salonId, staffIds],
    queryFn: async () => {
      if (staffIds.length === 0) return [];
      const { data, error } = await supabase
        .from("working_hours")
        .select("staff_id, day_of_week, start_time, end_time, is_working")
        .in("staff_id", staffIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId && staffIds.length > 0,
  });

  // Per-day exceptions
  const { data: exceptionsDb = [] } = useQuery({
    queryKey: ["sa-wh-exceptions", salonId, staffIds, format(today, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours_exceptions")
        .select("staff_id, date, start_time, end_time, is_working")
        .eq("salon_id", salonId!)
        .in("staff_id", staffIds)
        .gte("date", format(today, "yyyy-MM-dd"))
        .lte("date", format(horizonEnd, "yyyy-MM-dd"));
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId && staffIds.length > 0,
  });

  // Appointments in horizon
  const { data: appointmentsDb = [] } = useQuery({
    queryKey: ["sa-appointments", salonId, format(today, "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("staff_id, start_time, end_time, status")
        .eq("salon_id", salonId!)
        .gte("start_time", today.toISOString())
        .lte("start_time", new Date(horizonEnd.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .neq("status", "cancelled");
      if (error) throw error;
      return data ?? [];
    },
    enabled: !isDemo && !!salonId,
  });

  // Services (for "next available" search)
  const { data: servicesDb = [] } = useQuery({
    queryKey: ["sa-services", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, duration")
        .eq("salon_id", salonId!)
        .eq("is_active", true);
      if (error) throw error;
      return (data ?? []).map(s => ({
        id: s.id as string,
        name: s.name as string,
        duration: Number(s.duration ?? 60),
      }));
    },
    enabled: !isDemo && !!salonId,
  });

  const searchableServices = isDemo ? DEMO_SERVICES : servicesDb;

  // Helpers to compute analytics from DB
  const timeStrToMin = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const minToTimeStr = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  // Build a window {start,end} (minutes from midnight) for staff on a given Date
  const getStaffWindow = useCallback(
    (staffId: string, day: Date): { start: number; end: number } | null => {
      const dateStr = format(day, "yyyy-MM-dd");
      const exc = exceptionsDb.find(
        e => e.staff_id === staffId && (e.date as string) === dateStr,
      );
      if (exc) {
        if (!exc.is_working) return null;
        return {
          start: timeStrToMin(exc.start_time as string),
          end: timeStrToMin(exc.end_time as string),
        };
      }
      const dow = day.getDay();
      const wh = workingHoursDb.find(
        w => w.staff_id === staffId && w.day_of_week === dow,
      );
      if (!wh || !wh.is_working) return null;
      return {
        start: timeStrToMin(wh.start_time as string),
        end: timeStrToMin(wh.end_time as string),
      };
    },
    [workingHoursDb, exceptionsDb],
  );

  // Compute real gaps, occupancy, smart slots
  const realAnalytics = useMemo(() => {
    if (isDemo) {
      return {
        gaps: [] as ScheduleGap[],
        occupancy: [] as OccupancyData[],
        smartSlots: [] as SmartSlot[],
      };
    }
    const gaps: ScheduleGap[] = [];
    const occupancy: OccupancyData[] = [];
    const smartSlots: SmartSlot[] = [];

    for (const staff of staffMembers) {
      for (let i = 0; i < horizonDays; i++) {
        const day = addDays(today, i);
        const dateStr = format(day, "yyyy-MM-dd");
        const win = getStaffWindow(staff.id, day);
        if (!win) {
          occupancy.push({
            staffId: staff.id,
            staffName: staff.name,
            date: dateStr,
            occupancyPercent: 0,
            totalMinutes: 0,
            bookedMinutes: 0,
          });
          continue;
        }

        const totalMinutes = Math.max(0, win.end - win.start);

        const dayAppts = appointmentsDb
          .filter(a => {
            if (a.staff_id !== staff.id) return false;
            const s = parseISO(a.start_time as string);
            return format(s, "yyyy-MM-dd") === dateStr;
          })
          .map(a => {
            const s = parseISO(a.start_time as string);
            const e = parseISO(a.end_time as string);
            return {
              start: Math.max(win.start, s.getHours() * 60 + s.getMinutes()),
              end: Math.min(win.end, e.getHours() * 60 + e.getMinutes()),
            };
          })
          .filter(a => a.end > a.start)
          .sort((a, b) => a.start - b.start);

        const bookedMinutes = dayAppts.reduce((sum, a) => sum + (a.end - a.start), 0);
        const occupancyPercent =
          totalMinutes > 0 ? Math.round((bookedMinutes / totalMinutes) * 100) : 0;
        occupancy.push({
          staffId: staff.id,
          staffName: staff.name,
          date: dateStr,
          occupancyPercent,
          totalMinutes,
          bookedMinutes,
        });

        // Compute free windows
        let cursor = win.start;
        const freeWindows: { start: number; end: number; fillsGap: boolean }[] = [];
        for (let idx = 0; idx < dayAppts.length; idx++) {
          const a = dayAppts[idx];
          if (a.start > cursor) {
            freeWindows.push({
              start: cursor,
              end: a.start,
              fillsGap: idx > 0, // between two appts → fills gap
            });
          }
          cursor = Math.max(cursor, a.end);
        }
        if (cursor < win.end) {
          freeWindows.push({ start: cursor, end: win.end, fillsGap: false });
        }

        for (const fw of freeWindows) {
          const dur = fw.end - fw.start;
          if (dur < 15) continue;
          gaps.push({
            staffId: staff.id,
            staffName: staff.name,
            date: dateStr,
            startTime: minToTimeStr(fw.start),
            endTime: minToTimeStr(fw.end),
            durationMinutes: dur,
          });
          // Smart slot at the start of each free window
          smartSlots.push({
            date: dateStr,
            time: minToTimeStr(fw.start),
            staffId: staff.id,
            staffName: staff.name,
            isRecommended: fw.fillsGap || dur >= 60,
            fillsGap: fw.fillsGap,
            occupancyBefore: occupancyPercent,
            occupancyAfter: Math.min(
              100,
              occupancyPercent + (totalMinutes > 0 ? Math.round((dur / totalMinutes) * 100) : 0),
            ),
          });
        }
      }
    }

    gaps.sort((a, b) => b.durationMinutes - a.durationMinutes);
    smartSlots.sort((a, b) => {
      // Prioritize gap-fillers, then bigger occupancy gain
      if (a.fillsGap !== b.fillsGap) return a.fillsGap ? -1 : 1;
      return (b.occupancyAfter - b.occupancyBefore) - (a.occupancyAfter - a.occupancyBefore);
    });

    return { gaps, occupancy, smartSlots };
  }, [
    isDemo,
    staffMembers,
    today,
    appointmentsDb,
    getStaffWindow,
  ]);

  // Use real data when not demo; mocks in demo mode (keeps showcase intact)
  const gaps = isDemo ? generateMockGaps(staffMembers) : realAnalytics.gaps;
  const occupancy = isDemo ? generateMockOccupancy(staffMembers) : realAnalytics.occupancy;
  const smartSlots = isDemo ? generateSmartSlots(staffMembers) : realAnalytics.smartSlots;

  const filteredGaps = gaps.filter(gap => {
    if (gap.durationMinutes < minGapDuration) return false;
    if (selectedStaffFilter !== "all" && gap.staffId !== selectedStaffFilter) return false;
    return true;
  });

  const lowOccupancyDays = occupancy.filter(o => o.occupancyPercent < 30);
  
  // Group low occupancy by day for detailed view
  const lowOccupancyByDay = useMemo(() => {
    const grouped: Record<string, { date: string; staff: { name: string; percent: number }[] }> = {};
    lowOccupancyDays.forEach(day => {
      if (!grouped[day.date]) {
        grouped[day.date] = { date: day.date, staff: [] };
      }
      grouped[day.date].staff.push({ name: day.staffName, percent: day.occupancyPercent });
    });
    return Object.values(grouped).slice(0, 4);
  }, [lowOccupancyDays]);

  const getStaffColor = (staffId: string) => {
    return staffMembers.find(s => s.id === staffId)?.color || "hsl(var(--primary))";
  };

  // Dynamic search logic
  const handleSearch = useCallback(() => {
    setIsSearching(true);
    setHasSearched(true);

    // Find best matching free window
    setTimeout(() => {
      const service = searchableServices.find(s => s.id === nextAvailableService) || searchableServices[0];
      const serviceName = service?.name ?? "Usługa";
      const serviceDuration = service?.duration ?? 60;

      // Build candidate list from real gaps in admin mode, mock otherwise
      const sourceGaps = isDemo ? generateMockGaps(staffMembers) : realAnalytics.gaps;

      // Filter by staff
      let candidates = sourceGaps.filter(g => g.durationMinutes >= serviceDuration);
      if (nextAvailableStaff && nextAvailableStaff !== "any") {
        candidates = candidates.filter(g => g.staffId === nextAvailableStaff);
      }

      // Filter by time preference
      const inRange = (timeStr: string, fromH: number, toH: number) => {
        const [h] = timeStr.split(":").map(Number);
        return h >= fromH && h < toH;
      };
      switch (nextAvailablePreference) {
        case "morning":
          candidates = candidates.filter(g => inRange(g.startTime, 8, 12));
          break;
        case "afternoon":
          candidates = candidates.filter(g => inRange(g.startTime, 12, 17));
          break;
        case "evening":
          candidates = candidates.filter(g => inRange(g.startTime, 17, 23));
          break;
        case "friday":
          candidates = candidates.filter(g => parseISO(g.date).getDay() === 5);
          break;
        case "weekend":
          candidates = candidates.filter(g => {
            const dow = parseISO(g.date).getDay();
            return dow === 0 || dow === 6;
          });
          break;
        default:
          break;
      }

      // Pick earliest (by date then by time)
      candidates.sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1;
        return a.startTime < b.startTime ? -1 : 1;
      });
      const best = candidates[0];

      if (!best) {
        setSearchResult(null);
        setIsSearching(false);
        return;
      }

      setSearchResult({
        date: best.date,
        time: best.startTime,
        staffName: best.staffName,
        staffId: best.staffId,
        serviceName,
        serviceDuration,
      });
      setIsSearching(false);
    }, 200);
  }, [
    nextAvailableService,
    nextAvailableStaff,
    nextAvailablePreference,
    searchableServices,
    realAnalytics.gaps,
    isDemo,
    staffMembers,
  ]);

  const handleSlotClick = () => {
    if (!searchResult) return;

    const targetSlug = isDemo ? "demo-salon" : (salonSlug || "demo-salon");
    window.open(`/book/${targetSlug}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold">Inteligentny asystent grafiku</h2>
            <p className="text-sm text-muted-foreground">
              Optymalizuj grafik, znajdź luki i zwiększ obłożenie
            </p>
          </div>
        </div>

        {/* Value proposition banner */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
          <p className="text-sm font-medium text-foreground mb-1">
            💡 Dlaczego to zmienia zasady gry?
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ten moduł analizuje Twój grafik i pokazuje, gdzie tracisz pieniądze — puste sloty, niskie obłożenie, 
            nieoptymalne rozkładanie wizyt. Salony odzyskują średnio <strong className="text-foreground">15-25% obłożenia</strong> dzięki 
            inteligentnym rekomendacjom. To jak dodatkowy pracownik, który pilnuje każdej wolnej minuty.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="gaps" className="gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Luki</span>
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Obłożenie</span>
            </TabsTrigger>
            <TabsTrigger value="smart-slots" className="gap-2">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Polecane</span>
            </TabsTrigger>
            <TabsTrigger value="next-available" className="gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Szukaj</span>
            </TabsTrigger>
          </TabsList>

          {/* Gaps Tab */}
          <TabsContent value="gaps" className="mt-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <Label className="text-xs">Min. czas trwania</Label>
                <Select value={minGapDuration.toString()} onValueChange={(v) => setMinGapDuration(parseInt(v))}>
                  <SelectTrigger className="w-32 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[15, 30, 45, 60, 90].map(m => (
                      <SelectItem key={m} value={m.toString()}>{m} min</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Pracownik</Label>
                <Select value={selectedStaffFilter} onValueChange={setSelectedStaffFilter}>
                  <SelectTrigger className="w-40 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszyscy</SelectItem>
                    {staffMembers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredGaps.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Brak luk spełniających kryteria</p>
                </div>
              ) : (
                filteredGaps.map((gap, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors flex items-center justify-between"
                    onClick={() => onGapSelect?.(gap)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-1 h-10 rounded-full"
                        style={{ backgroundColor: getStaffColor(gap.staffId) }}
                      />
                      <div>
                        <p className="font-medium text-sm">{gap.staffName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(gap.date), "EEEE, d MMM", { locale: pl })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{gap.startTime} - {gap.endTime}</p>
                        <Badge variant={gap.durationMinutes >= 60 ? "destructive" : "secondary"} className="text-xs">
                          {gap.durationMinutes} min
                        </Badge>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredGaps.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Tip:</strong> Znaleziono {filteredGaps.length} luk w grafiku. Rozważ promocję na te terminy lub przyspiesz rezerwacje.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Occupancy Tab */}
          <TabsContent value="occupancy" className="mt-4 space-y-4">
            <div className="grid gap-3">
              {staffMembers.map(staff => {
                const staffOccupancy = occupancy.filter(o => o.staffId === staff.id);
                const avgOccupancy = Math.round(
                  staffOccupancy.reduce((sum, o) => sum + o.occupancyPercent, 0) / staffOccupancy.length
                );
                
                return (
                  <div key={staff.id} className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
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
                      <div className="text-right">
                        <p className={cn(
                          "text-lg font-bold",
                          avgOccupancy < 30 ? "text-red-500" : avgOccupancy < 60 ? "text-amber-500" : "text-green-500"
                        )}>
                          {avgOccupancy}%
                        </p>
                        <p className="text-xs text-muted-foreground">śr. obłożenie</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {staffOccupancy.map((day, i) => (
                        <div 
                          key={i} 
                          className="flex-1 h-8 rounded relative overflow-hidden"
                          title={`${format(new Date(day.date), "EEEE", { locale: pl })}: ${day.occupancyPercent}%`}
                        >
                          <div className="absolute inset-0 bg-muted/50" />
                          <div 
                            className={cn(
                              "absolute bottom-0 left-0 right-0 transition-all",
                              day.occupancyPercent < 30 ? "bg-red-400" : 
                              day.occupancyPercent < 60 ? "bg-amber-400" : "bg-green-400"
                            )}
                            style={{ height: `${day.occupancyPercent}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium">
                            {format(new Date(day.date), "EE", { locale: pl })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── ROZBUDOWANE OSTRZEŻENIE O NISKIM OBŁOŻENIU ── */}
            {lowOccupancyByDay.length > 0 && (
              <div className="space-y-3">
                {/* Szczegóły — które dni, którzy pracownicy */}
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                      Wykryto {lowOccupancyDays.length} slotów z obłożeniem &lt;30%
                    </p>
                  </div>
                  <div className="space-y-2">
                    {lowOccupancyByDay.map((day, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-red-700 dark:text-red-300">
                          {format(new Date(day.date), "EEEE, d MMM", { locale: pl })}
                        </span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {day.staff.map((s, j) => (
                            <Badge key={j} variant="outline" className="text-xs border-red-300 dark:border-red-700 text-red-700 dark:text-red-300">
                              {s.name.split(" ")[0]}: {s.percent}%
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3 konkretne akcje */}
                <div className="grid gap-2">
                  <button
                    onClick={() => onNavigate?.("retention")}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Wyślij SMS do klientek z ostatniego miesiąca</p>
                      <p className="text-xs text-muted-foreground">Przypomnienie o wolnych terminach zwiększa zapisy o ~18%</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => onNavigate?.("widgets")}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Dodaj promocję -20% na puste dni</p>
                      <p className="text-xs text-muted-foreground">Stwórz widget z rabatem na konkretne terminy</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>

                  <button
                    onClick={() => onNavigate?.("calendar")}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                      <ArrowRightLeft className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">Przenieś wizytę z pełnego dnia</p>
                      <p className="text-xs text-muted-foreground">Równoważ grafik — klientki z przepełnionych dni mogą preferować luźniejszy termin</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
                  </button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Smart Slots Tab */}
          <TabsContent value="smart-slots" className="mt-4 space-y-4">
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium">Inteligentne sloty</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Terminy które najlepiej "dopychają" grafik i minimalizują luki
              </p>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {smartSlots.slice(0, 8).map((slot, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => onSlotSelect?.(slot)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: getStaffColor(slot.staffId) }}
                        >
                          {slot.staffName.charAt(0)}
                        </div>
                        {slot.fillsGap && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                            <Star className="w-2.5 h-2.5 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{slot.staffName}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(slot.date), "EEEE, d MMM", { locale: pl })} o {slot.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <TrendingUp className="w-3 h-3" />
                        +{slot.occupancyAfter - slot.occupancyBefore}% obłożenia
                      </div>
                      {slot.fillsGap && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          Wypełnia lukę
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Next Available Tab — DYNAMIC SEARCH */}
          <TabsContent value="next-available" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Pracownik</Label>
                <Select value={nextAvailableStaff} onValueChange={(v) => { setNextAvailableStaff(v); setHasSearched(false); setSearchResult(null); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Dowolny pracownik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Dowolny</SelectItem>
                    {staffMembers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Usługa</Label>
                <Select value={nextAvailableService} onValueChange={(v) => { setNextAvailableService(v); setHasSearched(false); setSearchResult(null); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Wybierz usługę" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEMO_SERVICES.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name} ({s.duration} min)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferencja czasowa</Label>
                <Select value={nextAvailablePreference} onValueChange={(v) => { setNextAvailablePreference(v); setHasSearched(false); setSearchResult(null); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Dowolna pora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Dowolna pora</SelectItem>
                    <SelectItem value="morning">Rano (8:00-12:00)</SelectItem>
                    <SelectItem value="afternoon">Popołudnie (12:00-17:00)</SelectItem>
                    <SelectItem value="evening">Wieczór (17:00-20:00)</SelectItem>
                    <SelectItem value="friday">Tylko piątki</SelectItem>
                    <SelectItem value="weekend">Weekend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full gap-2" 
                variant="luxury" 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Szukam...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Znajdź najbliższy termin
                  </>
                )}
              </Button>

              {/* Dynamic result */}
              {hasSearched && searchResult && (
                <div 
                  className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors group"
                  onClick={handleSlotClick}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Najbliższy wolny termin:</p>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        {format(new Date(searchResult.date), "EEEE, d MMMM", { locale: pl })} o {searchResult.time}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {searchResult.staffName} • {searchResult.serviceName} ({searchResult.serviceDuration} min)
                      </p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ExternalLink className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform" />
                      <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Zarezerwuj</span>
                    </div>
                  </div>
                </div>
              )}

              {hasSearched && !searchResult && !isSearching && (
                <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                  <p className="text-sm text-muted-foreground">Nie znaleziono wolnego terminu spełniającego kryteria</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
