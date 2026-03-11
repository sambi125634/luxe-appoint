import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Mail, Phone, Calendar, User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { SectionGuide } from "./SectionGuide";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useServices } from "@/hooks/useServices";
import { useSalonId } from "@/hooks/useSalonId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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

const DEMO_SERVICES = [
  { id: "1", name: "Peeling kawitacyjny" },
  { id: "2", name: "Mezoterapia igłowa" },
  { id: "3", name: "Masaż relaksacyjny" },
  { id: "4", name: "Depilacja laserowa" },
  { id: "5", name: "Manicure hybrydowy" },
];

const colors = ["bg-primary", "bg-secondary", "bg-accent", "bg-chart-1", "bg-chart-2", "bg-chart-3"];

const DEMO_STAFF: StaffMember[] = [
  { id: "1", name: "Maria Nowakowska", role: "Kosmetolog", email: "maria@salon.pl", phone: "+48 123 456 789", color: "bg-primary", serviceIds: ["1", "2", "4"], workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })) },
  { id: "2", name: "Karolina Wiśniewska", role: "Stylistka brwi", email: "karolina@salon.pl", phone: "+48 987 654 321", color: "bg-secondary", serviceIds: ["1", "5"], workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })) },
  { id: "3", name: "Joanna Lewandowska", role: "Masażystka", email: "joanna@salon.pl", phone: "+48 111 222 333", color: "bg-accent", serviceIds: ["3"], workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 2 && h.dayOfWeek <= 6 })) },
  { id: "4", name: "Anna Kowalczyk", role: "Kosmetolog", email: "anna@salon.pl", phone: "+48 444 555 666", color: "bg-chart-1", serviceIds: ["2", "4", "5"], workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })) },
];

interface StaffManagementProps {
  isDemo?: boolean;
}

export function StaffManagement({ isDemo = false }: StaffManagementProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();

  const { data: dbStaff, isLoading: loadingStaff } = useStaffMembers();
  const { data: dbServices } = useServices();

  // Fetch staff_services assignments from DB
  const { data: staffServicesMap } = useQuery({
    queryKey: ["staff-services-map", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("staff_services")
        .select("staff_id, service_id");
      if (error) throw error;
      const map: Record<string, string[]> = {};
      (data || []).forEach((row) => {
        if (!map[row.staff_id]) map[row.staff_id] = [];
        map[row.staff_id].push(row.service_id);
      });
      return map;
    },
    enabled: !isDemo && !!salonId,
  });

  // Fetch working_hours from DB
  const { data: workingHoursMap } = useQuery({
    queryKey: ["working-hours-map", salonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("working_hours")
        .select("staff_id, day_of_week, start_time, end_time, is_working");
      if (error) throw error;
      const map: Record<string, WorkingHours[]> = {};
      (data || []).forEach((row) => {
        if (!map[row.staff_id]) map[row.staff_id] = [];
        map[row.staff_id].push({
          dayOfWeek: row.day_of_week,
          startTime: row.start_time,
          endTime: row.end_time,
          isWorking: row.is_working,
        });
      });
      return map;
    },
    enabled: !isDemo && !!salonId,
  });

  const staff: StaffMember[] = useMemo(() => {
    if (isDemo) return DEMO_STAFF;
    if (!dbStaff) return [];
    return dbStaff.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role || "Specjalista",
      email: s.email || "",
      phone: s.phone || "",
      color: s.color || "bg-primary",
      serviceIds: staffServicesMap?.[s.id] || [],
      workingHours: workingHoursMap?.[s.id]?.length
        ? defaultWorkingHours.map(dh => {
            const found = workingHoursMap[s.id].find(wh => wh.dayOfWeek === dh.dayOfWeek);
            return found || dh;
          })
        : defaultWorkingHours,
    }));
  }, [isDemo, dbStaff, staffServicesMap, workingHoursMap]);

  const servicesList = useMemo(() => {
    if (isDemo) return DEMO_SERVICES;
    if (!dbServices) return [];
    return dbServices.map(s => ({ id: s.id, name: s.name }));
  }, [isDemo, dbServices]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState<"info" | "hours">("info");

  const dayNames = [
    t('staff.days.sunday'), t('staff.days.monday'), t('staff.days.tuesday'),
    t('staff.days.wednesday'), t('staff.days.thursday'), t('staff.days.friday'), t('staff.days.saturday')
  ];

  const [form, setForm] = useState({
    name: "", role: "", email: "", phone: "", color: colors[0], serviceIds: [] as string[], workingHours: defaultWorkingHours,
  });

  const openDialog = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setForm({ name: member.name, role: member.role, email: member.email, phone: member.phone, color: member.color, serviceIds: member.serviceIds, workingHours: member.workingHours });
    } else {
      setEditingStaff(null);
      setForm({ name: "", role: "", email: "", phone: "", color: colors[0], serviceIds: [], workingHours: defaultWorkingHours });
    }
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const saveStaff = async () => {
    if (isDemo) {
      toast({ title: t('common.saved'), description: "Demo – dane nie zostały zapisane" });
      setIsDialogOpen(false);
      return;
    }

    if (!form.name.trim()) {
      toast({ title: t('common.error'), description: "Imię pracownika jest wymagane", variant: "destructive" });
      return;
    }

    try {
      let staffId = editingStaff?.id;

      if (editingStaff) {
        const { error } = await supabase
          .from("staff_members")
          .update({ name: form.name, role: form.role, email: form.email || null, phone: form.phone || null, color: form.color })
          .eq("id", editingStaff.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("staff_members")
          .insert({ name: form.name, role: form.role, email: form.email || null, phone: form.phone || null, color: form.color, salon_id: salonId! })
          .select("id")
          .single();
        if (error) throw error;
        staffId = data.id;
      }

      // Save working hours
      if (staffId) {
        await supabase.from("working_hours").delete().eq("staff_id", staffId);
        const workingDays = form.workingHours.filter(h => h.isWorking);
        if (workingDays.length > 0) {
          await supabase.from("working_hours").insert(
            workingDays.map(h => ({
              staff_id: staffId!,
              day_of_week: h.dayOfWeek,
              start_time: h.startTime,
              end_time: h.endTime,
              is_working: true,
            }))
          );
        }

        // Save service assignments
        await supabase.from("staff_services").delete().eq("staff_id", staffId);
        if (form.serviceIds.length > 0) {
          await supabase.from("staff_services").insert(
            form.serviceIds.map(serviceId => ({ staff_id: staffId!, service_id: serviceId }))
          );
        }
      }

      queryClient.invalidateQueries({ queryKey: ["staff-members", salonId] });
      setIsDialogOpen(false);
      toast({ title: t('common.saved') });
    } catch (err) {
      console.error(err);
      toast({ title: t('common.error'), description: "Nie udało się zapisać pracownika", variant: "destructive" });
    }
  };

  const deleteStaff = async (id: string) => {
    if (isDemo) return;
    try {
      const { error } = await supabase.from("staff_members").update({ is_active: false }).eq("id", id);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["staff-members", salonId] });
      toast({ title: t('common.deleted') });
    } catch {
      toast({ title: t('common.error'), description: "Nie udało się usunąć pracownika", variant: "destructive" });
    }
  };

  const toggleService = (serviceId: string) => {
    setForm(prev => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId) ? prev.serviceIds.filter(id => id !== serviceId) : [...prev.serviceIds, serviceId],
    }));
  };

  const updateWorkingHours = (dayOfWeek: number, field: keyof WorkingHours, value: string | boolean) => {
    setForm(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(h => h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h),
    }));
  };

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase();

  if (!isDemo && loadingStaff) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  // Empty state
  if (!isDemo && staff.length === 0) {
    return (
      <div className="space-y-6">
        <SectionGuide sectionKey="staff" />
        <div className="text-center py-16">
          <UserPlus className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-serif font-semibold mb-2">Brak pracowników</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Dodaj siebie lub członków zespołu. Bez pracowników kalendarz nie będzie działał i klientki nie będą mogły rezerwować wizyt.
          </p>
          <Button onClick={() => openDialog()} className="gap-2">
            <Plus className="w-4 h-4" />
            {t('staff.addStaff')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="staff" />
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
            <div key={member.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
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
                    {member.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        {member.email}
                      </div>
                    )}
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {member.phone}
                      </div>
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

          <div className="flex gap-2 border-b border-border pb-2">
            <Button variant={activeTab === "info" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("info")} className="gap-2">
              <User className="w-4 h-4" />
              {t('staff.data')}
            </Button>
            <Button variant={activeTab === "hours" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("hours")} className="gap-2">
              <Calendar className="w-4 h-4" />
              {t('staff.schedule')}
            </Button>
          </div>

          {activeTab === "info" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('staff.fullName')}</Label>
                  <Input value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Anna Kowalska" />
                </div>
                <div>
                  <Label>{t('staff.position')}</Label>
                  <Input value={form.role} onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))} placeholder="Kosmetolog" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('staff.email')}</Label>
                  <Input type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="anna@salon.pl" />
                </div>
                <div>
                  <Label>{t('staff.phone')}</Label>
                  <Input value={form.phone} onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="+48 123 456 789" />
                </div>
              </div>
              <div>
                <Label>{t('staff.calendarColor')}</Label>
                <div className="flex gap-2 mt-2">
                  {colors.map(color => (
                    <button key={color} type="button" className={cn("w-8 h-8 rounded-full transition-all", color, form.color === color ? "ring-2 ring-offset-2 ring-foreground" : "")} onClick={() => setForm(prev => ({ ...prev, color }))} />
                  ))}
                </div>
              </div>
              <div>
                <Label>{t('staff.performedServices')}</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {servicesList.map(service => (
                    <Button key={service.id} type="button" variant={form.serviceIds.includes(service.id) ? "default" : "outline"} size="sm" onClick={() => toggleService(service.id)}>
                      {service.name}
                    </Button>
                  ))}
                  {servicesList.length === 0 && <p className="text-sm text-muted-foreground">Dodaj usługi w zakładce Usługi</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {form.workingHours.map(hours => (
                <div key={hours.dayOfWeek} className="flex items-center gap-4">
                  <div className="w-28">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={hours.isWorking} onChange={(e) => updateWorkingHours(hours.dayOfWeek, "isWorking", e.target.checked)} className="rounded border-border" />
                      <span className={cn("text-sm", hours.isWorking ? "font-medium" : "text-muted-foreground")}>{dayNames[hours.dayOfWeek]}</span>
                    </label>
                  </div>
                  {hours.isWorking && (
                    <div className="flex items-center gap-2">
                      <Input type="time" value={hours.startTime} onChange={(e) => updateWorkingHours(hours.dayOfWeek, "startTime", e.target.value)} className="w-28" />
                      <span className="text-muted-foreground">–</span>
                      <Input type="time" value={hours.endTime} onChange={(e) => updateWorkingHours(hours.dayOfWeek, "endTime", e.target.value)} className="w-28" />
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
