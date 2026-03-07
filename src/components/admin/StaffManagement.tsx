import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Mail, Phone, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { VideoTutorialCard } from "./VideoTutorialCard";

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  color: string;
  serviceIds: string[];
  workingHours: WorkingHours[];
}

interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

const defaultWorkingHours: WorkingHours[] = [
  { dayOfWeek: 0, startTime: "09:00", endTime: "17:00", isWorking: false },
  { dayOfWeek: 1, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 2, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 3, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 4, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 5, startTime: "09:00", endTime: "17:00", isWorking: true },
  { dayOfWeek: 6, startTime: "10:00", endTime: "14:00", isWorking: false },
];

const mockServices = [
  { id: "1", name: "Peeling kawitacyjny" },
  { id: "2", name: "Mezoterapia igłowa" },
  { id: "3", name: "Masaż relaksacyjny" },
  { id: "4", name: "Depilacja laserowa" },
  { id: "5", name: "Manicure hybrydowy" },
];

const colors = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
];

const mockStaff: StaffMember[] = [
  { 
    id: "1", 
    name: "Maria Nowakowska", 
    role: "Kosmetolog", 
    email: "maria@salon.pl", 
    phone: "+48 123 456 789",
    color: "bg-primary",
    serviceIds: ["1", "2", "4"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })),
  },
  { 
    id: "2", 
    name: "Karolina Wiśniewska", 
    role: "Stylistka brwi", 
    email: "karolina@salon.pl", 
    phone: "+48 987 654 321",
    color: "bg-secondary",
    serviceIds: ["1", "5"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })),
  },
  { 
    id: "3", 
    name: "Joanna Lewandowska", 
    role: "Masażystka", 
    email: "joanna@salon.pl", 
    phone: "+48 111 222 333",
    color: "bg-accent",
    serviceIds: ["3"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 2 && h.dayOfWeek <= 6 })),
  },
  { 
    id: "4", 
    name: "Anna Kowalczyk", 
    role: "Kosmetolog", 
    email: "anna@salon.pl", 
    phone: "+48 444 555 666",
    color: "bg-chart-1",
    serviceIds: ["2", "4", "5"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })),
  },
];

export function StaffManagement() {
  const { t } = useTranslation();
  const [staff, setStaff] = useState(mockStaff);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "hours">("info");

  const dayNames = [
    t('staff.days.sunday'),
    t('staff.days.monday'),
    t('staff.days.tuesday'),
    t('staff.days.wednesday'),
    t('staff.days.thursday'),
    t('staff.days.friday'),
    t('staff.days.saturday')
  ];

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    color: colors[0],
    serviceIds: [] as string[],
    workingHours: defaultWorkingHours,
  });

  const openDialog = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setForm({
        name: member.name,
        role: member.role,
        email: member.email,
        phone: member.phone,
        color: member.color,
        serviceIds: member.serviceIds,
        workingHours: member.workingHours,
      });
    } else {
      setEditingStaff(null);
      setForm({
        name: "",
        role: "",
        email: "",
        phone: "",
        color: colors[0],
        serviceIds: [],
        workingHours: defaultWorkingHours,
      });
    }
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const saveStaff = () => {
    if (editingStaff) {
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...s, ...form } : s));
    } else {
      setStaff(prev => [...prev, { ...form, id: Date.now().toString() }]);
    }
    setIsDialogOpen(false);
  };

  const deleteStaff = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const toggleService = (serviceId: string) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter(id => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const updateWorkingHours = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(h =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h
      ),
    }));
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className="space-y-6">
      <VideoTutorialCard
        title="Jak zarządzać zespołem"
        voiceText="Dodaj członków zespołu, przypisz im usługi i ustaw godziny pracy. Każdy pracownik ma swój kolor w kalendarzu. Jeśli pracujesz sama, dodaj siebie jako jedynego pracownika — to konieczne, żeby kalendarz działał."
      />
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-serif font-semibold">{t('staff.title')} ({staff.length})</h3>
          <Button variant="luxury" size="sm" className="gap-2" onClick={() => openDialog()}>
            <Plus className="w-4 h-4" />
            {t('staff.addStaff')}
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {staff.map((member, index) => (
            <div
              key={member.id}
              className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={cn(member.color, "text-primary-foreground font-serif")}>
                    {getInitials(member.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDialog(member)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteStaff(member.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="w-4 h-4" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {member.phone}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {member.serviceIds.slice(0, 3).map(serviceId => {
                      const service = mockServices.find(s => s.id === serviceId);
                      return service ? (
                        <span key={serviceId} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                          {service.name}
                        </span>
                      ) : null;
                    })}
                    {member.serviceIds.length > 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        +{member.serviceIds.length - 3} {t('staff.more')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingStaff ? t('staff.editStaff') : t('staff.newStaff')}
            </DialogTitle>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-border pb-2">
            <Button
              variant={activeTab === "info" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("info")}
              className="gap-2"
            >
              <User className="w-4 h-4" />
              {t('staff.data')}
            </Button>
            <Button
              variant={activeTab === "hours" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("hours")}
              className="gap-2"
            >
              <Calendar className="w-4 h-4" />
              {t('staff.schedule')}
            </Button>
          </div>

          {activeTab === "info" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('staff.fullName')}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Anna Kowalska"
                  />
                </div>
                <div>
                  <Label>{t('staff.position')}</Label>
                  <Input
                    value={form.role}
                    onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Kosmetolog"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('staff.email')}</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="anna@salon.pl"
                  />
                </div>
                <div>
                  <Label>{t('staff.phone')}</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+48 123 456 789"
                  />
                </div>
              </div>
              <div>
                <Label>{t('staff.calendarColor')}</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={cn(
                        "w-8 h-8 rounded-full transition-all",
                        color,
                        form.color === color ? "ring-2 ring-offset-2 ring-foreground" : ""
                      )}
                      onClick={() => setForm(prev => ({ ...prev, color }))}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>{t('staff.performedServices')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mockServices.map(service => (
                    <Button
                      key={service.id}
                      type="button"
                      variant={form.serviceIds.includes(service.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleService(service.id)}
                    >
                      {service.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {form.workingHours.map(hours => (
                <div key={hours.dayOfWeek} className="flex items-center gap-4">
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
                        {dayNames[hours.dayOfWeek]}
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
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button variant="luxury" onClick={saveStaff}>{t('common.save')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
