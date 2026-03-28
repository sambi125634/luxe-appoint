import { useState, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, Mail, Phone, Calendar, User, UserPlus, Star, TrendingUp, Camera, Clock, Sparkles, Eye, EyeOff, Coffee, Award, FileText, Percent, Users, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { SectionGuide } from "./SectionGuide";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useServices } from "@/hooks/useServices";
import { useSalonId } from "@/hooks/useSalonId";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { StaffInviteTab } from "./staff/StaffInviteTab";
import { StaffPermissionsTab } from "./staff/StaffPermissionsTab";

import demoMaria from "@/assets/demo-staff-maria.jpg";
import demoKasia from "@/assets/demo-staff-kasia.jpg";
import demoAnna from "@/assets/demo-staff-anna.jpg";

type CompensationType = 'commission' | 'salary' | 'hourly' | 'salary_plus_commission' | 'flat_per_service';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  color: string;
  serviceIds: string[];
  workingHours: WorkingHours[];
  avatar_url?: string | null;
  bio?: string | null;
  specializations?: string[];
  started_at?: string | null;
  contract_type?: string | null;
  commission_rate?: number | null;
  certifications?: string[];
  visible_in_widget?: boolean;
  break_start?: string | null;
  break_duration?: number | null;
  compensation_type?: CompensationType;
  base_salary?: number | null;
  hourly_rate?: number | null;
  salary_bonus_threshold?: number | null;
  salary_bonus_rate?: number | null;
  flat_rate_per_service?: number | null;
  invitation_status?: string | null;
  staff_role?: string | null;
}

const COMPENSATION_TYPES: { value: CompensationType; label: string; description: string }[] = [
  { value: "commission", label: "Prowizja od wizyty", description: "X% od wartości każdej wykonanej usługi" },
  { value: "salary", label: "Stała pensja miesięczna", description: "Stała kwota wypłacana co miesiąc" },
  { value: "hourly", label: "Stawka godzinowa", description: "Stawka × przepracowane godziny z kalendarza" },
  { value: "salary_plus_commission", label: "Pensja + premia od wyników", description: "Stała podstawa + % od nadwyżki ponad próg" },
  { value: "flat_per_service", label: "Stała stawka za zabieg", description: "Stała kwota za każdy wykonany zabieg" },
];

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

const STAFF_COLORS = [
  { value: "#6366f1", label: "Indigo" },
  { value: "#ec4899", label: "Róż" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#10b981", label: "Szmaragd" },
  { value: "#8b5cf6", label: "Fiolet" },
  { value: "#ef4444", label: "Czerwień" },
  { value: "#06b6d4", label: "Cyan" },
  { value: "#f97316", label: "Pomarańcz" },
  { value: "#84cc16", label: "Limonka" },
  { value: "#64748b", label: "Szary" },
  { value: "#d946ef", label: "Fuksja" },
  { value: "#14b8a6", label: "Morski" },
];

const CONTRACT_TYPES = [
  { value: "employment", label: "Umowa o pracę" },
  { value: "b2b", label: "B2B" },
  { value: "mandate", label: "Umowa zlecenie" },
  { value: "internship", label: "Staż" },
];

const DEMO_STAFF: StaffMember[] = [
  {
    id: "1", name: "Maria Nowakowska", role: "Kosmetolog", email: "maria@salon.pl", phone: "+48 123 456 789",
    color: "#6366f1", serviceIds: ["1", "2", "4"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })),
    avatar_url: demoMaria,
    bio: "Doświadczona kosmetolog z 8-letnim stażem. Specjalizuje się w zabiegach anti-aging i pielęgnacji skóry problemowej.",
    specializations: ["Anti-aging", "Peelingi chemiczne", "Mezoterapia"],
    started_at: "2016-03-15",
  },
  {
    id: "2", name: "Karolina Wiśniewska", role: "Stylistka brwi", email: "karolina@salon.pl", phone: "+48 987 654 321",
    color: "#ec4899", serviceIds: ["1", "5"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })),
    avatar_url: demoKasia,
    bio: "Certyfikowana stylistka brwi i rzęs. Ukończyła kurs PhiBrows i laminacji.",
    specializations: ["Brwi", "Rzęsy", "Henna"],
    started_at: "2020-09-01",
  },
  {
    id: "3", name: "Joanna Lewandowska", role: "Masażystka", email: "joanna@salon.pl", phone: "+48 111 222 333",
    color: "#10b981", serviceIds: ["3"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 2 && h.dayOfWeek <= 6 })),
    avatar_url: null,
    bio: "Fizjoterapeutka z dyplomem AWF. Specjalizuje się w masażach leczniczych i relaksacyjnych.",
    specializations: ["Masaż leczniczy", "Drenaż limfatyczny"],
    started_at: "2021-01-10",
  },
  {
    id: "4", name: "Anna Kowalczyk", role: "Kosmetolog", email: "anna@salon.pl", phone: "+48 444 555 666",
    color: "#f59e0b", serviceIds: ["2", "4", "5"],
    workingHours: defaultWorkingHours.map(h => ({ ...h, isWorking: h.dayOfWeek >= 1 && h.dayOfWeek <= 5 })),
    avatar_url: demoAnna,
    bio: "Kosmetolog i podolog. Wykonuje zabiegi laserowe i manicure hybrydowy.",
    specializations: ["Laser", "Podologia", "Manicure"],
    started_at: "2019-06-01",
  },
];

const DEMO_STATS: Record<string, { visits: number; rating: number }> = {
  "1": { visits: 142, rating: 4.9 },
  "2": { visits: 98, rating: 4.8 },
  "3": { visits: 67, rating: 5.0 },
  "4": { visits: 115, rating: 4.7 },
};

interface StaffManagementProps {
  isDemo?: boolean;
}

function getScheduleSummary(workingHours: WorkingHours[]): string {
  const dayShort = ["Nd", "Pon", "Wt", "Śr", "Czw", "Pt", "Sob"];
  const working = workingHours.filter(h => h.isWorking).sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  if (working.length === 0) return "Brak grafiku";

  const firstDay = working[0];
  const lastDay = working[working.length - 1];
  const allSameTime = working.every(h => h.startTime === firstDay.startTime && h.endTime === firstDay.endTime);

  if (allSameTime) {
    return `${dayShort[firstDay.dayOfWeek]}–${dayShort[lastDay.dayOfWeek]} ${firstDay.startTime}–${firstDay.endTime}`;
  }
  return `${dayShort[firstDay.dayOfWeek]}–${dayShort[lastDay.dayOfWeek]} (różne godziny)`;
}

function getTenure(startedAt: string | null | undefined): string | null {
  if (!startedAt) return null;
  const start = new Date(startedAt);
  const now = new Date();
  const years = Math.floor((now.getTime() - start.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  if (years < 1) {
    const months = Math.floor((now.getTime() - start.getTime()) / (30.44 * 24 * 60 * 60 * 1000));
    return `${months} mies.`;
  }
  return `${years} ${years === 1 ? "rok" : years < 5 ? "lata" : "lat"}`;
}

export function StaffManagement({ isDemo = false }: StaffManagementProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { salonId } = useSalonId();
  const queryClient = useQueryClient();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const { data: dbStaff, isLoading: loadingStaff } = useStaffMembers();
  const { data: dbServices } = useServices();

  const { data: staffServicesMap } = useQuery({
    queryKey: ["staff-services-map", salonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_services").select("staff_id, service_id");
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

  const { data: workingHoursMap } = useQuery({
    queryKey: ["working-hours-map", salonId],
    queryFn: async () => {
      const { data, error } = await supabase.from("working_hours").select("staff_id, day_of_week, start_time, end_time, is_working");
      if (error) throw error;
      const map: Record<string, WorkingHours[]> = {};
      (data || []).forEach((row) => {
        if (!map[row.staff_id]) map[row.staff_id] = [];
        map[row.staff_id].push({ dayOfWeek: row.day_of_week, startTime: row.start_time, endTime: row.end_time, isWorking: row.is_working });
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
      color: s.color || STAFF_COLORS[0].value,
      avatar_url: s.avatar_url,
      bio: s.bio,
      specializations: Array.isArray(s.specializations) ? (s.specializations as string[]) : [],
      started_at: s.started_at,
      contract_type: s.contract_type,
      commission_rate: s.commission_rate,
      certifications: s.certifications || [],
      visible_in_widget: s.visible_in_widget ?? true,
      break_start: s.break_start,
      break_duration: s.break_duration,
      compensation_type: (s.compensation_type as CompensationType) || "commission",
      base_salary: s.base_salary,
      hourly_rate: s.hourly_rate,
      salary_bonus_threshold: s.salary_bonus_threshold,
      salary_bonus_rate: s.salary_bonus_rate,
      flat_rate_per_service: s.flat_rate_per_service,
      invitation_status: s.invitation_status,
      staff_role: s.staff_role,
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
  const [activeTab, setActiveTab] = useState<"info" | "hours" | "profile">("info");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [newSpecialization, setNewSpecialization] = useState("");

  const dayNames = [
    t('staff.days.sunday'), t('staff.days.monday'), t('staff.days.tuesday'),
    t('staff.days.wednesday'), t('staff.days.thursday'), t('staff.days.friday'), t('staff.days.saturday')
  ];

  const [form, setForm] = useState({
    name: "", role: "", email: "", phone: "", color: STAFF_COLORS[0].value, serviceIds: [] as string[],
    workingHours: defaultWorkingHours, bio: "", specializations: [] as string[], started_at: "",
    contract_type: "", commission_rate: "" as string, certifications: [] as string[], visible_in_widget: true,
    break_start: "", break_duration: "" as string,
    compensation_type: "commission" as CompensationType,
    base_salary: "" as string, hourly_rate: "" as string,
    salary_bonus_threshold: "" as string, salary_bonus_rate: "" as string,
    flat_rate_per_service: "" as string,
  });
  const [newCertification, setNewCertification] = useState("");

  const openDialog = (member?: StaffMember) => {
    if (member) {
      setEditingStaff(member);
      setForm({
        name: member.name, role: member.role, email: member.email, phone: member.phone,
        color: member.color, serviceIds: member.serviceIds, workingHours: member.workingHours,
        bio: member.bio || "", specializations: member.specializations || [], started_at: member.started_at || "",
        contract_type: member.contract_type || "", commission_rate: member.commission_rate?.toString() || "",
        certifications: member.certifications || [], visible_in_widget: member.visible_in_widget ?? true,
        break_start: member.break_start || "", break_duration: member.break_duration?.toString() || "",
        compensation_type: member.compensation_type || "commission",
        base_salary: member.base_salary?.toString() || "", hourly_rate: member.hourly_rate?.toString() || "",
        salary_bonus_threshold: member.salary_bonus_threshold?.toString() || "", salary_bonus_rate: member.salary_bonus_rate?.toString() || "",
        flat_rate_per_service: member.flat_rate_per_service?.toString() || "",
      });
      setAvatarPreview(member.avatar_url || null);
    } else {
      setEditingStaff(null);
      setForm({ name: "", role: "", email: "", phone: "", color: STAFF_COLORS[0].value, serviceIds: [], workingHours: defaultWorkingHours, bio: "", specializations: [], started_at: "", contract_type: "", commission_rate: "", certifications: [], visible_in_widget: true, break_start: "", break_duration: "", compensation_type: "commission", base_salary: "", hourly_rate: "", salary_bonus_threshold: "", salary_bonus_rate: "", flat_rate_per_service: "" });
      setAvatarPreview(null);
    }
    setAvatarFile(null);
    setNewSpecialization("");
    setActiveTab("info");
    setIsDialogOpen(true);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Za duży plik", description: "Maksymalny rozmiar zdjęcia to 10 MB", variant: "destructive" });
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async (staffId: string): Promise<string | null> => {
    if (!avatarFile) return null;
    const ext = avatarFile.name.split(".").pop();
    const path = `staff-avatars/${staffId}.${ext}`;
    const { error } = await supabase.storage.from("salon-media").upload(path, avatarFile, { upsert: true });
    if (error) throw error;
    const { data: urlData } = supabase.storage.from("salon-media").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const addSpecialization = () => {
    const val = newSpecialization.trim();
    if (val && !form.specializations.includes(val)) {
      setForm(prev => ({ ...prev, specializations: [...prev.specializations, val] }));
    }
    setNewSpecialization("");
  };

  const removeSpecialization = (spec: string) => {
    setForm(prev => ({ ...prev, specializations: prev.specializations.filter(s => s !== spec) }));
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
      let avatarUrl: string | null = null;

      if (editingStaff) {
        if (avatarFile) avatarUrl = await uploadAvatar(editingStaff.id);
        const updateData: Record<string, unknown> = {
          name: form.name, role: form.role, email: form.email || null, phone: form.phone || null, color: form.color,
          bio: form.bio || null, specializations: form.specializations, started_at: form.started_at || null,
          contract_type: form.contract_type || null, commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
          certifications: form.certifications, visible_in_widget: form.visible_in_widget,
          break_start: form.break_start || null, break_duration: form.break_duration ? parseInt(form.break_duration) : null,
          compensation_type: form.compensation_type,
          base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
          hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
          salary_bonus_threshold: form.salary_bonus_threshold ? parseFloat(form.salary_bonus_threshold) : null,
          salary_bonus_rate: form.salary_bonus_rate ? parseFloat(form.salary_bonus_rate) : null,
          flat_rate_per_service: form.flat_rate_per_service ? parseFloat(form.flat_rate_per_service) : null,
        };
        if (avatarUrl) updateData.avatar_url = avatarUrl;
        const { error } = await supabase.from("staff_members").update(updateData as never).eq("id", editingStaff.id);
        if (error) throw error;
      } else {
        const insertData: Record<string, unknown> = {
          name: form.name, role: form.role, email: form.email || null, phone: form.phone || null,
          color: form.color, salon_id: salonId!,
          bio: form.bio || null, specializations: form.specializations, started_at: form.started_at || null,
          contract_type: form.contract_type || null, commission_rate: form.commission_rate ? parseFloat(form.commission_rate) : null,
          certifications: form.certifications, visible_in_widget: form.visible_in_widget,
          break_start: form.break_start || null, break_duration: form.break_duration ? parseInt(form.break_duration) : null,
          compensation_type: form.compensation_type,
          base_salary: form.base_salary ? parseFloat(form.base_salary) : null,
          hourly_rate: form.hourly_rate ? parseFloat(form.hourly_rate) : null,
          salary_bonus_threshold: form.salary_bonus_threshold ? parseFloat(form.salary_bonus_threshold) : null,
          salary_bonus_rate: form.salary_bonus_rate ? parseFloat(form.salary_bonus_rate) : null,
          flat_rate_per_service: form.flat_rate_per_service ? parseFloat(form.flat_rate_per_service) : null,
        };
        const { data, error } = await supabase
          .from("staff_members")
          .insert(insertData as never)
          .select("id")
          .single();
        if (error) throw error;
        staffId = data.id;
        if (avatarFile && staffId) {
          avatarUrl = await uploadAvatar(staffId);
          if (avatarUrl) {
            await supabase.from("staff_members").update({ avatar_url: avatarUrl } as never).eq("id", staffId);
          }
        }
      }

      if (staffId) {
        await supabase.from("working_hours").delete().eq("staff_id", staffId);
        const workingDays = form.workingHours.filter(h => h.isWorking);
        if (workingDays.length > 0) {
          await supabase.from("working_hours").insert(
            workingDays.map(h => ({ staff_id: staffId!, day_of_week: h.dayOfWeek, start_time: h.startTime, end_time: h.endTime, is_working: true }))
          );
        }
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

  const getServiceNames = (serviceIds: string[]) => {
    return serviceIds.map(id => servicesList.find(s => s.id === id)?.name).filter(Boolean) as string[];
  };

  if (!isDemo && loadingStaff) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

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

  const getInvitationBadge = (member: StaffMember) => {
    const status = member.invitation_status;
    switch (status) {
      case "active": return <Badge variant="default" className="text-[10px] bg-green-500/10 text-green-600 border-green-200">✅ Aktywny</Badge>;
      case "invited": return <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-200">⏳ Oczekuje</Badge>;
      case "accepted": return <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-200">🔵 Zaakceptowany</Badge>;
      default: return <Badge variant="outline" className="text-[10px]">📧 Nie zaproszony</Badge>;
    }
  };

  const hasOwner = staff.some(m => m.staff_role === "owner");

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="staff" />
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <Users className="w-4 h-4" />
            👥 Pracownicy
          </TabsTrigger>
          <TabsTrigger value="invite" className="gap-2">
            <UserPlus className="w-4 h-4" />
            ➕ Zaproś pracownika
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Shield className="w-4 h-4" />
            📋 Role i uprawnienia
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-semibold">{t('staff.title')} ({staff.length})</h3>
              <Button variant="luxury" size="sm" className="gap-2" onClick={() => openDialog()}>
                <Plus className="w-4 h-4" />
                {t('staff.addStaff')}
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {staff.map((member, index) => {
                const services = getServiceNames(member.serviceIds);
                const schedule = getScheduleSummary(member.workingHours);
                const demoStats = isDemo ? DEMO_STATS[member.id] : null;
                const tenure = getTenure(member.started_at);

                return (
                  <div key={member.id} className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14 ring-2 ring-border">
                        {member.avatar_url && <AvatarImage src={member.avatar_url} alt={member.name} className="object-cover" />}
                        <AvatarFallback className="font-serif text-lg" style={{ backgroundColor: member.color, color: 'white' }}>
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{member.name}</p>
                              {!isDemo && getInvitationBadge(member)}
                            </div>
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

                        <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {schedule}
                          {tenure && <span className="ml-2 text-muted-foreground/70">· staż {tenure}</span>}
                        </div>

                        {services.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {services.slice(0, 3).map(name => (
                              <Badge key={name} variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                                {name}
                              </Badge>
                            ))}
                            {services.length > 3 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-normal">
                                +{services.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        {member.specializations && member.specializations.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {member.specializations.map(spec => (
                              <span key={spec} className="inline-flex items-center gap-0.5 text-[10px] text-primary/80">
                                <Sparkles className="w-2.5 h-2.5" />
                                {spec}
                              </span>
                            ))}
                          </div>
                        )}

                        {demoStats && (
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3.5 h-3.5" />
                              {demoStats.visits} wizyt/mies.
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {demoStats.rating}
                            </span>
                          </div>
                        )}

                        <div className="mt-2 space-y-0.5">
                          {member.email && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              {member.email}
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Phone className="w-3 h-3" />
                              {member.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="invite">
          <StaffInviteTab salonId={salonId} isDemo={isDemo} hasOwner={hasOwner} />
        </TabsContent>

        <TabsContent value="permissions">
          <StaffPermissionsTab isDemo={isDemo} />
        </TabsContent>
      </Tabs>

      {/* Staff Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif">
              {editingStaff ? t('staff.editStaff') : t('staff.newStaff')}
            </DialogTitle>
          </DialogHeader>

          {/* Avatar upload */}
          <div className="flex items-center gap-4 pb-2">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <Avatar className="w-16 h-16 ring-2 ring-border">
                {avatarPreview && <AvatarImage src={avatarPreview} alt="Avatar" className="object-cover" />}
                <AvatarFallback className="font-serif text-xl" style={{ backgroundColor: form.color, color: 'white' }}>
                  {form.name ? getInitials(form.name) : <Camera className="w-6 h-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 rounded-full bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-5 h-5 text-background" />
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <div className="text-sm">
              <p className="font-medium">{form.name || "Nowy pracownik"}</p>
              <p className="text-muted-foreground text-xs">Kliknij zdjęcie, aby zmienić (max 10 MB)</p>
            </div>
          </div>

          <div className="flex gap-2 border-b border-border pb-2">
            <Button variant={activeTab === "info" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("info")} className="gap-2">
              <User className="w-4 h-4" />
              {t('staff.data')}
            </Button>
            <Button variant={activeTab === "profile" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("profile")} className="gap-2">
              <Sparkles className="w-4 h-4" />
              Profil
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
                <div className="flex flex-wrap gap-2 mt-2">
                  {STAFF_COLORS.map(c => (
                    <button key={c.value} type="button" title={c.label} className={cn("w-8 h-8 rounded-full transition-all", form.color === c.value ? "ring-2 ring-offset-2 ring-foreground" : "")} style={{ backgroundColor: c.value }} onClick={() => setForm(prev => ({ ...prev, color: c.value }))} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Typ umowy</Label>
                <Select value={form.contract_type} onValueChange={(v) => setForm(prev => ({ ...prev, contract_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Wybierz..." /></SelectTrigger>
                  <SelectContent>
                    {CONTRACT_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* 💰 Model rozliczeń */}
              <div className="border-t border-border pt-4 mt-2">
                <Label className="flex items-center gap-1 text-base font-semibold mb-3">💰 Model rozliczeń</Label>
                <Select value={form.compensation_type} onValueChange={(v) => setForm(prev => ({ ...prev, compensation_type: v as CompensationType }))}>
                  <SelectTrigger><SelectValue placeholder="Wybierz model..." /></SelectTrigger>
                  <SelectContent>
                    {COMPENSATION_TYPES.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1 italic">
                  {COMPENSATION_TYPES.find(ct => ct.value === form.compensation_type)?.description}
                </p>

                <div className="mt-3 space-y-3">
                  {form.compensation_type === "commission" && (
                    <div>
                      <Label className="flex items-center gap-1"><Percent className="w-3.5 h-3.5" /> Prowizja (%)</Label>
                      <Input type="number" min={0} max={100} step={0.5} value={form.commission_rate} onChange={(e) => setForm(prev => ({ ...prev, commission_rate: e.target.value }))} placeholder="np. 30" />
                    </div>
                  )}

                  {form.compensation_type === "salary" && (
                    <div>
                      <Label>Pensja miesięczna (zł brutto)</Label>
                      <Input type="number" min={0} step={100} value={form.base_salary} onChange={(e) => setForm(prev => ({ ...prev, base_salary: e.target.value }))} placeholder="np. 4500" />
                    </div>
                  )}

                  {form.compensation_type === "hourly" && (
                    <div>
                      <Label>Stawka godzinowa (zł)</Label>
                      <Input type="number" min={0} step={1} value={form.hourly_rate} onChange={(e) => setForm(prev => ({ ...prev, hourly_rate: e.target.value }))} placeholder="np. 40" />
                    </div>
                  )}

                  {form.compensation_type === "salary_plus_commission" && (
                    <>
                      <div>
                        <Label>Podstawa miesięczna (zł)</Label>
                        <Input type="number" min={0} step={100} value={form.base_salary} onChange={(e) => setForm(prev => ({ ...prev, base_salary: e.target.value }))} placeholder="np. 3500" />
                      </div>
                      <div>
                        <Label>Próg przychodów (zł)</Label>
                        <Input type="number" min={0} step={100} value={form.salary_bonus_threshold} onChange={(e) => setForm(prev => ({ ...prev, salary_bonus_threshold: e.target.value }))} placeholder="np. 8000" />
                        <p className="text-xs text-muted-foreground mt-0.5">Powyżej jakiego przychodu nalicza się premia</p>
                      </div>
                      <div>
                        <Label>Premia powyżej progu (%)</Label>
                        <Input type="number" min={0} max={100} step={1} value={form.salary_bonus_rate} onChange={(e) => setForm(prev => ({ ...prev, salary_bonus_rate: e.target.value }))} placeholder="np. 10" />
                      </div>
                    </>
                  )}

                  {form.compensation_type === "flat_per_service" && (
                    <div>
                      <Label>Stawka za zabieg (zł)</Label>
                      <Input type="number" min={0} step={10} value={form.flat_rate_per_service} onChange={(e) => setForm(prev => ({ ...prev, flat_rate_per_service: e.target.value }))} placeholder="np. 100" />
                    </div>
                  )}
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
          ) : activeTab === "profile" ? (
            <div className="space-y-4">
              <div>
                <Label>Bio / Opis</Label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Krótki opis specjalizacji, doświadczenia i certyfikatów..."
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">{form.bio.length}/500 znaków · Widoczne dla klientek w widgecie rezerwacji</p>
              </div>

              <div>
                <Label>Specjalizacje</Label>
                <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                  {form.specializations.map(spec => (
                    <Badge key={spec} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => removeSpecialization(spec)}>
                      {spec} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="np. Mezoterapia, Brwi..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialization(); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={addSpecialization} disabled={!newSpecialization.trim()}>
                    Dodaj
                  </Button>
                </div>
              </div>

              <div>
                <Label>Pracuje od</Label>
                <Input
                  type="date"
                  value={form.started_at}
                  onChange={(e) => setForm(prev => ({ ...prev, started_at: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Staż wyświetlany na karcie pracownika</p>
              </div>

              <div>
                <Label className="flex items-center gap-1"><Award className="w-3.5 h-3.5" /> Certyfikaty / Uprawnienia</Label>
                <div className="flex flex-wrap gap-1.5 mt-2 mb-2">
                  {form.certifications.map(cert => (
                    <Badge key={cert} variant="outline" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => setForm(prev => ({ ...prev, certifications: prev.certifications.filter(c => c !== cert) }))}>
                      <Award className="w-3 h-3" /> {cert} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    placeholder="np. PhiBrows, Laser klasa IV..."
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const val = newCertification.trim(); if (val && !form.certifications.includes(val)) { setForm(prev => ({ ...prev, certifications: [...prev.certifications, val] })); } setNewCertification(""); } }}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={() => { const val = newCertification.trim(); if (val && !form.certifications.includes(val)) { setForm(prev => ({ ...prev, certifications: [...prev.certifications, val] })); } setNewCertification(""); }} disabled={!newCertification.trim()}>
                    Dodaj
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  {form.visible_in_widget ? <Eye className="w-4 h-4 text-primary" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">Widoczność w rezerwacjach</p>
                    <p className="text-xs text-muted-foreground">Czy klientki widzą tę osobę w widgecie rezerwacji</p>
                  </div>
                </div>
                <Switch checked={form.visible_in_widget} onCheckedChange={(v) => setForm(prev => ({ ...prev, visible_in_widget: v }))} />
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

              <div className="border-t border-border pt-3 mt-3">
                <Label className="flex items-center gap-1 mb-2"><Coffee className="w-3.5 h-3.5" /> Przerwa obiadowa</Label>
                <div className="flex items-center gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Godzina</Label>
                    <Input type="time" value={form.break_start} onChange={(e) => setForm(prev => ({ ...prev, break_start: e.target.value }))} className="w-28" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Czas trwania (min)</Label>
                    <Input type="number" min={0} max={120} step={5} value={form.break_duration} onChange={(e) => setForm(prev => ({ ...prev, break_duration: e.target.value }))} className="w-24" placeholder="30" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Przerwa blokuje slot w kalendarzu automatycznie</p>
              </div>
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
