import { useState } from "react";
import { Plus, Pencil, Trash2, Check, Copy, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ScheduleTemplate, 
  WorkingHours, 
  mockStaffMembers,
  defaultTemplates, 
  dayNamesFull 
} from "./types";
import { useStaffMembers } from "@/hooks/useStaffMembers";

interface ScheduleTemplatesProps {
  isDemo?: boolean;
  onApplyTemplate?: (staffId: string, templateId: string, startDate: string, endDate: string) => void;
}

export function ScheduleTemplates({ onApplyTemplate, isDemo = false }: ScheduleTemplatesProps) {
  const { data: dbStaff } = useStaffMembers();
  const staffList = isDemo 
    ? mockStaffMembers 
    : (dbStaff || []).map(s => ({ id: s.id, name: s.name, color: s.color || '#7c3aed', role: s.role }));
  const [templates, setTemplates] = useState<ScheduleTemplate[]>(defaultTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ScheduleTemplate | null>(null);
  const [selectedTemplateForApply, setSelectedTemplateForApply] = useState<ScheduleTemplate | null>(null);

  const [form, setForm] = useState<Omit<ScheduleTemplate, 'id'>>({
    name: "",
    description: "",
    workingHours: defaultTemplates[0].workingHours.map(h => ({ ...h })),
  });

  const [applyForm, setApplyForm] = useState({
    staffId: "",
    startDate: "",
    endDate: "",
  });

  const openEditDialog = (template?: ScheduleTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setForm({
        name: template.name,
        description: template.description,
        workingHours: template.workingHours.map(h => ({ ...h })),
      });
    } else {
      setEditingTemplate(null);
      setForm({
        name: "",
        description: "",
        workingHours: defaultTemplates[0].workingHours.map(h => ({ ...h, isWorking: false })),
      });
    }
    setIsDialogOpen(true);
  };

  const openApplyDialog = (template: ScheduleTemplate) => {
    setSelectedTemplateForApply(template);
    setApplyForm({
      staffId: "",
      startDate: "",
      endDate: "",
    });
    setIsApplyDialogOpen(true);
  };

  const saveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === editingTemplate.id ? { ...t, ...form } : t
      ));
    } else {
      const newTemplate: ScheduleTemplate = {
        ...form,
        id: Date.now().toString(),
      };
      setTemplates(prev => [...prev, newTemplate]);
    }
    setIsDialogOpen(false);
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const duplicateTemplate = (template: ScheduleTemplate) => {
    const newTemplate: ScheduleTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (kopia)`,
      isDefault: false,
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const updateWorkingHours = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(h =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      ),
    }));
  };

  const applyTemplate = () => {
    if (selectedTemplateForApply && applyForm.staffId && applyForm.startDate && applyForm.endDate) {
      onApplyTemplate?.(applyForm.staffId, selectedTemplateForApply.id, applyForm.startDate, applyForm.endDate);
      setIsApplyDialogOpen(false);
    }
  };

  const getWorkingDaysCount = (template: ScheduleTemplate) => {
    return template.workingHours.filter(h => h.isWorking).length;
  };

  const getTotalHours = (template: ScheduleTemplate) => {
    return template.workingHours
      .filter(h => h.isWorking)
      .reduce((total, h) => {
        const start = parseInt(h.startTime.split(':')[0]);
        const end = parseInt(h.endTime.split(':')[0]);
        return total + (end - start);
      }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-serif font-semibold">Szablony grafików</h3>
          <p className="text-sm text-muted-foreground">Predefiniowane wzorce pracy do szybkiego zastosowania</p>
        </div>
        <Button variant="luxury" size="sm" className="gap-2" onClick={() => openEditDialog()}>
          <Plus className="w-4 h-4" />
          Nowy szablon
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {templates.map((template, index) => (
          <div
            key={template.id}
            className="glass-card p-4 animate-fade-in"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{template.name}</h4>
                  {template.isDefault && (
                    <Badge variant="secondary" className="text-xs">Domyślny</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => duplicateTemplate(template)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(template)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                {!template.isDefault && (
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTemplate(template.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="flex gap-1 mb-3">
              {template.workingHours.map((h, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 h-8 rounded text-xs flex items-center justify-center font-medium",
                    h.isWorking 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted/50 text-muted-foreground"
                  )}
                  title={h.isWorking ? `${h.startTime}-${h.endTime}` : "Wolne"}
                >
                  {dayNamesFull[h.dayOfWeek].substring(0, 2)}
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {getWorkingDaysCount(template)} dni/tydz.
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  ~{getTotalHours(template)}h/tydz.
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => openApplyDialog(template)}
              >
                <Check className="w-3 h-3" />
                Zastosuj
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Template Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingTemplate ? "Edytuj szablon" : "Nowy szablon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Nazwa szablonu</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="np. Standardowy, Wakacyjny"
              />
            </div>

            <div>
              <Label>Opis</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Krótki opis tego szablonu..."
                rows={2}
              />
            </div>

            <div>
              <Label className="mb-3 block">Godziny pracy</Label>
              <div className="space-y-2">
                {form.workingHours.map(hours => (
                  <div key={hours.dayOfWeek} className="flex items-center gap-3">
                    <div className="w-28">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hours.isWorking}
                          onChange={(e) => updateWorkingHours(hours.dayOfWeek, "isWorking", e.target.checked)}
                          className="rounded border-border"
                        />
                        <span className={cn(
                          "text-sm",
                          hours.isWorking ? "font-medium" : "text-muted-foreground"
                        )}>
                          {dayNamesFull[hours.dayOfWeek]}
                        </span>
                      </label>
                    </div>
                    {hours.isWorking && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.startTime}
                          onChange={(e) => updateWorkingHours(hours.dayOfWeek, "startTime", e.target.value)}
                          className="w-28"
                        />
                        <span className="text-muted-foreground">–</span>
                        <Input
                          type="time"
                          value={hours.endTime}
                          onChange={(e) => updateWorkingHours(hours.dayOfWeek, "endTime", e.target.value)}
                          className="w-28"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Anuluj</Button>
            <Button variant="luxury" onClick={saveTemplate} disabled={!form.name}>
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Template Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">
              Zastosuj szablon: {selectedTemplateForApply?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Pracownik</Label>
              <Select value={applyForm.staffId} onValueChange={(v) => setApplyForm(prev => ({ ...prev, staffId: v }))}>
                <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Od daty</Label>
                <Input
                  type="date"
                  value={applyForm.startDate}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div>
                <Label>Do daty</Label>
                <Input
                  type="date"
                  value={applyForm.endDate}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            {selectedTemplateForApply && (
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground mb-2">Podgląd szablonu:</p>
                <div className="flex gap-1">
                  {selectedTemplateForApply.workingHours.map((h, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex-1 py-1 rounded text-xs text-center",
                        h.isWorking ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {h.isWorking ? `${h.startTime.substring(0, 5)}` : "-"}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Anuluj
            </Button>
            <Button 
              variant="luxury" 
              onClick={applyTemplate}
              disabled={!applyForm.staffId || !applyForm.startDate || !applyForm.endDate}
            >
              Zastosuj szablon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
