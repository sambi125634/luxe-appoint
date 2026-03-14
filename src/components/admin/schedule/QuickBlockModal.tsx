import { useState } from "react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Clock, Coffee, Lock, GraduationCap, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ScheduleBlock, mockStaffMembers } from "./types";
import { useStaffMembers } from "@/hooks/useStaffMembers";

interface QuickBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (block: Omit<ScheduleBlock, 'id'>) => void;
  selectedDate?: Date;
  selectedStaffId?: string;
  isDemo?: boolean;
}

const blockTypes = [
  { id: 'break', label: 'Przerwa', icon: Coffee, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  { id: 'block', label: 'Blokada', icon: Lock, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  { id: 'training', label: 'Szkolenie', icon: GraduationCap, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  { id: 'meeting', label: 'Spotkanie', icon: Users, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
] as const;

const quickDurations = [15, 30, 45, 60, 90, 120];

export function QuickBlockModal({ 
  isOpen, 
  onClose, 
  onSave, 
  selectedDate,
  selectedStaffId,
  isDemo = false
}: QuickBlockModalProps) {
  const { data: dbStaff } = useStaffMembers();
  const staffList = isDemo 
    ? mockStaffMembers 
    : (dbStaff || []).map(s => ({ id: s.id, name: s.name, color: s.color || '#7c3aed', role: s.role }));
  const [form, setForm] = useState({
    staffId: selectedStaffId || "",
    date: selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    startTime: "12:00",
    endTime: "12:30",
    type: "break" as ScheduleBlock['type'],
    note: "",
  });

  const [quickMode, setQuickMode] = useState(true);

  const handleQuickDuration = (minutes: number) => {
    const [hours, mins] = form.startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const endHours = Math.floor(totalMinutes / 60);
    const endMins = totalMinutes % 60;
    setForm(prev => ({
      ...prev,
      endTime: `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
    }));
  };

  const handleSave = () => {
    onSave({
      staffId: form.staffId,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      note: form.note || undefined,
    });
    onClose();
  };

  const getDurationMinutes = () => {
    const [startH, startM] = form.startTime.split(':').map(Number);
    const [endH, endM] = form.endTime.split(':').map(Number);
    return (endH * 60 + endM) - (startH * 60 + startM);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Szybka blokada / przerwa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Block type selection */}
          <div>
            <Label className="mb-2 block">Typ</Label>
            <div className="grid grid-cols-4 gap-2">
              {blockTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: type.id }))}
                    className={cn(
                      "flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all",
                      form.type === type.id 
                        ? "border-primary bg-primary/5" 
                        : "border-transparent bg-muted/30 hover:bg-muted/50"
                    )}
                  >
                    <div className={cn("p-2 rounded-full", type.color)}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staff selection */}
          <div>
            <Label>Pracownik</Label>
            <Select value={form.staffId} onValueChange={(v) => setForm(prev => ({ ...prev, staffId: v }))}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Wybierz pracownika" />
              </SelectTrigger>
              <SelectContent>
                {mockStaffMembers.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: staff.color }} 
                      />
                      {staff.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div>
            <Label>Data</Label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="mt-1"
            />
          </div>

          {/* Time selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Godziny</Label>
              <button
                type="button"
                onClick={() => setQuickMode(!quickMode)}
                className="text-xs text-primary hover:underline"
              >
                {quickMode ? "Ustaw ręcznie" : "Tryb szybki"}
              </button>
            </div>

            {quickMode ? (
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Początek</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Czas trwania</Label>
                  <div className="flex flex-wrap gap-2">
                    {quickDurations.map(minutes => (
                      <Button
                        key={minutes}
                        type="button"
                        variant={getDurationMinutes() === minutes ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleQuickDuration(minutes)}
                      >
                        {minutes} min
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Od</Label>
                  <Input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm(prev => ({ ...prev, startTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Do</Label>
                  <Input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm(prev => ({ ...prev, endTime: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="p-3 rounded-lg bg-muted/30 flex items-center gap-3">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <div className="text-sm">
              <span className="font-medium">
                {format(new Date(form.date), "EEEE, d MMMM", { locale: pl })}
              </span>
              <span className="text-muted-foreground ml-2">
                {form.startTime} - {form.endTime} ({getDurationMinutes()} min)
              </span>
            </div>
          </div>

          {/* Note */}
          <div>
            <Label>Notatka (opcjonalnie)</Label>
            <Textarea
              value={form.note}
              onChange={(e) => setForm(prev => ({ ...prev, note: e.target.value }))}
              placeholder="np. Szkolenie z nowych produktów"
              rows={2}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button 
            variant="luxury" 
            onClick={handleSave}
            disabled={!form.staffId}
          >
            Dodaj blokadę
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
