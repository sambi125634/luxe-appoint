import { useState, useMemo } from "react";
import { format, addDays, startOfWeek, differenceInMinutes, parse } from "date-fns";
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
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

interface StaffItem {
  id: string;
  name: string;
  color: string;
  role: string | null;
}

// Mock data generators
const generateMockGaps = (staff: StaffItem[]): ScheduleGap[] => {
  const gaps: ScheduleGap[] = [];
  const today = new Date();
  
  staff.forEach(member => {
    // Generate 2-4 gaps per staff member for the week
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
      const totalMinutes = 480; // 8 hours
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

const generateSmartSlots = (): SmartSlot[] => {
  const slots: SmartSlot[] = [];
  const today = new Date();
  
  mockStaffMembers.forEach(staff => {
    for (let i = 0; i < 5; i++) {
      const dayOffset = Math.floor(Math.random() * 5);
      const hour = 9 + Math.floor(Math.random() * 9);
      const isRecommended = Math.random() > 0.5;
      
      slots.push({
        date: format(addDays(today, dayOffset), "yyyy-MM-dd"),
        time: `${hour.toString().padStart(2, '0')}:${Math.random() > 0.5 ? '00' : '30'}`,
        staffId: staff.id,
        staffName: staff.name,
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
  onSlotSelect?: (slot: SmartSlot) => void;
  onGapSelect?: (gap: ScheduleGap) => void;
}

export function SmartScheduleHelpers({ onSlotSelect, onGapSelect }: SmartScheduleHelpersProps) {
  const [activeTab, setActiveTab] = useState("gaps");
  const [minGapDuration, setMinGapDuration] = useState(30);
  const [selectedStaffFilter, setSelectedStaffFilter] = useState<string>("all");
  const [nextAvailableService, setNextAvailableService] = useState("");
  const [nextAvailableStaff, setNextAvailableStaff] = useState("");
  const [nextAvailablePreference, setNextAvailablePreference] = useState("");

  // Mock data
  const gaps = useMemo(() => generateMockGaps(), []);
  const occupancy = useMemo(() => generateMockOccupancy(), []);
  const smartSlots = useMemo(() => generateSmartSlots(), []);

  const filteredGaps = gaps.filter(gap => {
    if (gap.durationMinutes < minGapDuration) return false;
    if (selectedStaffFilter !== "all" && gap.staffId !== selectedStaffFilter) return false;
    return true;
  });

  const lowOccupancyDays = occupancy.filter(o => o.occupancyPercent < 30);
  
  const getStaffColor = (staffId: string) => {
    return mockStaffMembers.find(s => s.id === staffId)?.color || "hsl(var(--primary))";
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
                    {mockStaffMembers.map(s => (
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
              {mockStaffMembers.map(staff => {
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

            {lowOccupancyDays.length > 0 && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Uwaga:</strong> Wykryto {lowOccupancyDays.length} dni z obłożeniem poniżej 30%. 
                  Rozważ kampanię promocyjną.
                </p>
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

          {/* Next Available Tab */}
          <TabsContent value="next-available" className="mt-4 space-y-4">
            <div className="space-y-4">
              <div>
                <Label>Pracownik</Label>
                <Select value={nextAvailableStaff} onValueChange={setNextAvailableStaff}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Dowolny pracownik" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Dowolny</SelectItem>
                    {mockStaffMembers.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Usługa</Label>
                <Select value={nextAvailableService} onValueChange={setNextAvailableService}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Wybierz usługę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peeling">Peeling kawitacyjny (60 min)</SelectItem>
                    <SelectItem value="mezoterapia">Mezoterapia igłowa (90 min)</SelectItem>
                    <SelectItem value="masaz">Masaż relaksacyjny (60 min)</SelectItem>
                    <SelectItem value="depilacja">Depilacja laserowa (45 min)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Preferencja czasowa</Label>
                <Select value={nextAvailablePreference} onValueChange={setNextAvailablePreference}>
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

              <Button className="w-full gap-2" variant="luxury">
                <Search className="w-4 h-4" />
                Znajdź najbliższy termin
              </Button>

              {/* Mock result */}
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Najbliższy wolny termin:</p>
                    <p className="font-semibold text-green-700 dark:text-green-400">
                      Środa, 11 grudnia o 14:30
                    </p>
                    <p className="text-xs text-muted-foreground">Maria Nowakowska</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
