import { useState } from "react";
import { format, addWeeks, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { Copy, Check, Calendar, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { mockStaffMembers } from "./types";
import { useStaffMembers } from "@/hooks/useStaffMembers";

interface StaffItem {
  id: string;
  name: string;
  color: string;
  role: string | null;
}

interface WeekDuplicationProps {
  isDemo?: boolean;
  onDuplicate?: (staffIds: string[], sourceWeek: Date, targetWeeksCount: number, includeExceptions: boolean) => void;
}

export function WeekDuplication({ onDuplicate, isDemo = false }: WeekDuplicationProps) {
  const { data: dbStaff } = useStaffMembers();
  const staffMembers: StaffItem[] = isDemo 
    ? mockStaffMembers 
    : (dbStaff || []).map(s => ({ id: s.id, name: s.name, color: s.color || '#7c3aed', role: s.role }));
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [sourceWeek, setSourceWeek] = useState(() => 
    format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd")
  );
  const [targetWeeksCount, setTargetWeeksCount] = useState(4);
  const [includeExceptions, setIncludeExceptions] = useState(true);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const openDialog = () => {
    setStep(1);
    setSelectedStaff([]);
    setTargetWeeksCount(4);
    setIncludeExceptions(true);
    setIsDuplicating(false);
    setIsDone(false);
    setIsDialogOpen(true);
  };

  const toggleStaff = (staffId: string) => {
    setSelectedStaff(prev => 
      prev.includes(staffId) 
        ? prev.filter(id => id !== staffId)
        : [...prev, staffId]
    );
  };

  const selectAllStaff = () => {
    if (selectedStaff.length === mockStaffMembers.length) {
      setSelectedStaff([]);
    } else {
      setSelectedStaff(mockStaffMembers.map(s => s.id));
    }
  };

  const handleDuplicate = () => {
    setIsDuplicating(true);
    
    // Simulate duplication process
    setTimeout(() => {
      onDuplicate?.(selectedStaff, new Date(sourceWeek), targetWeeksCount, includeExceptions);
      setIsDuplicating(false);
      setIsDone(true);
    }, 1500);
  };

  const getTargetWeeksPreview = () => {
    const source = new Date(sourceWeek);
    return Array.from({ length: Math.min(targetWeeksCount, 6) }, (_, i) => {
      const targetWeek = addWeeks(source, i + 1);
      return format(targetWeek, "d MMM", { locale: pl });
    });
  };

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Copy className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-serif font-semibold">Duplikacja tygodnia</h3>
            <p className="text-sm text-muted-foreground">
              Skopiuj grafik z wybranego tygodnia na kolejne tygodnie jednym kliknięciem
            </p>
          </div>
          <Button variant="luxury" className="gap-2" onClick={openDialog}>
            <Copy className="w-4 h-4" />
            Duplikuj tydzień
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif flex items-center gap-2">
              <Copy className="w-5 h-5" />
              Duplikacja grafiku
            </DialogTitle>
          </DialogHeader>

          {isDone ? (
            <div className="py-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="text-lg font-medium mb-2">Grafik został zduplikowany!</h4>
              <p className="text-muted-foreground text-sm">
                Skopiowano grafik dla {selectedStaff.length} pracowników na {targetWeeksCount} tygodni.
              </p>
              <Button className="mt-6" onClick={() => setIsDialogOpen(false)}>
                Zamknij
              </Button>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3].map(s => (
                  <div key={s} className="flex items-center">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      step >= s 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted text-muted-foreground"
                    )}>
                      {s}
                    </div>
                    {s < 3 && (
                      <ChevronRight className={cn(
                        "w-4 h-4 mx-1",
                        step > s ? "text-primary" : "text-muted-foreground"
                      )} />
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: Select staff */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Wybierz pracowników</Label>
                    <Button variant="ghost" size="sm" onClick={selectAllStaff}>
                      {selectedStaff.length === mockStaffMembers.length ? "Odznacz wszystkich" : "Zaznacz wszystkich"}
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {mockStaffMembers.map(staff => (
                      <label
                        key={staff.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                          selectedStaff.includes(staff.id) 
                            ? "bg-primary/10 border border-primary/30" 
                            : "bg-muted/30 hover:bg-muted/50"
                        )}
                      >
                        <Checkbox
                          checked={selectedStaff.includes(staff.id)}
                          onCheckedChange={() => toggleStaff(staff.id)}
                        />
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
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select source and target */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <Label>Tydzień źródłowy</Label>
                    <Input
                      type="week"
                      value={sourceWeek.substring(0, 4) + "-W" + getWeekNumber(new Date(sourceWeek)).toString().padStart(2, "0")}
                      onChange={(e) => {
                        const [year, week] = e.target.value.split("-W");
                        const date = getDateFromWeek(parseInt(year), parseInt(week));
                        setSourceWeek(format(date, "yyyy-MM-dd"));
                      }}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Tydzień: {format(new Date(sourceWeek), "d MMM", { locale: pl })} - {format(addWeeks(new Date(sourceWeek), 0).setDate(new Date(sourceWeek).getDate() + 6), "d MMM yyyy", { locale: pl })}
                    </p>
                  </div>

                  <div>
                    <Label>Liczba tygodni do skopiowania</Label>
                    <Select 
                      value={targetWeeksCount.toString()} 
                      onValueChange={(v) => setTargetWeeksCount(parseInt(v))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 6, 8, 12].map(n => (
                          <SelectItem key={n} value={n.toString()}>
                            {n} {n === 1 ? "tydzień" : n < 5 ? "tygodnie" : "tygodni"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/30">
                    <p className="text-sm font-medium mb-2">Podgląd kopiowania:</p>
                    <div className="flex flex-wrap gap-2">
                      {getTargetWeeksPreview().map((week, i) => (
                        <span 
                          key={i} 
                          className="text-xs px-2 py-1 rounded bg-primary/10 text-primary"
                        >
                          {week}
                        </span>
                      ))}
                      {targetWeeksCount > 6 && (
                        <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                          +{targetWeeksCount - 6} więcej
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-muted/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Pracownicy</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedStaff.length} wybranych
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Okres kopiowania</p>
                        <p className="text-xs text-muted-foreground">
                          {targetWeeksCount} tygodni od {format(new Date(sourceWeek), "d MMM", { locale: pl })}
                        </p>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={includeExceptions}
                      onCheckedChange={(checked) => setIncludeExceptions(!!checked)}
                    />
                    <span className="text-sm">
                      Uwzględnij wyjątki (np. stałe wolne dni)
                    </span>
                  </label>

                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <strong>Uwaga:</strong> Ta operacja nadpisze istniejące grafiki dla wybranych pracowników w docelowych tygodniach.
                    </p>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-4">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(s => s - 1)}>
                    Wstecz
                  </Button>
                )}
                {step < 3 ? (
                  <Button 
                    variant="luxury" 
                    onClick={() => setStep(s => s + 1)}
                    disabled={step === 1 && selectedStaff.length === 0}
                  >
                    Dalej
                  </Button>
                ) : (
                  <Button 
                    variant="luxury" 
                    onClick={handleDuplicate}
                    disabled={isDuplicating}
                    className="gap-2"
                  >
                    {isDuplicating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Kopiowanie...
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Duplikuj grafik
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper functions
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getDateFromWeek(year: number, week: number): Date {
  const jan1 = new Date(year, 0, 1);
  const days = (week - 1) * 7 - jan1.getDay() + 1;
  return new Date(year, 0, days + 1);
}
