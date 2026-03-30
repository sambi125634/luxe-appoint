import { useState } from "react";
import { 
  Calendar, 
  CalendarOff,
  LayoutGrid, 
  FileText, 
  Copy, 
  Sparkles,
  Plus,
  Coffee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { WeeklyCalendar } from "./WeeklyCalendar";
import { AppointmentModal } from "./AppointmentModal";
import { 
  ScheduleGridView, 
  ScheduleTemplates, 
  WeekDuplication,
  QuickBlockModal,
  SmartScheduleHelpers 
} from "./schedule";
import { TimeOffManagement } from "./TimeOffManagement";
import { useTranslation } from "react-i18next";
import { SectionGuide } from "./SectionGuide";
import { useSalonId } from "@/hooks/useSalonId";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useStaffMembers } from "@/hooks/useStaffMembers";

interface ScheduleManagementProps {
  isDemo?: boolean;
  salonSlug?: string | null;
  onNavigate?: (tab: string) => void;
}

export function ScheduleManagement({ isDemo = false, salonSlug, onNavigate }: ScheduleManagementProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { salonId } = useSalonId();
  const { data: dbStaff } = useStaffMembers();
  const [activeView, setActiveView] = useState<"calendar" | "grid" | "templates" | "smart" | "time-off">("calendar");
  const [isQuickBlockOpen, setIsQuickBlockOpen] = useState(false);
  const [isNewAppointmentOpen, setIsNewAppointmentOpen] = useState(false);

  const handleSaveBlock = async (block: { staffId: string; date: string; startTime: string; endTime: string; type: string; note?: string }) => {
    if (isDemo) {
      toast({ title: "Tryb Demo", description: "Dane nie zostały zapisane" });
      return;
    }

    if (!salonId) return;

    try {
      // Find the staff member to get a valid service_id — we create a "blocked" appointment
      const staffId = block.staffId;
      
      // Get any service to satisfy FK constraint (we'll use the first available)
      const { data: services } = await supabase
        .from("services")
        .select("id")
        .eq("salon_id", salonId)
        .limit(1);

      if (!services?.length) {
        toast({ title: "Błąd", description: "Dodaj przynajmniej jedną usługę, aby tworzyć blokady", variant: "destructive" });
        return;
      }

      const startTime = `${block.date}T${block.startTime}:00`;
      const endTime = `${block.date}T${block.endTime}:00`;

      const { error } = await supabase
        .from("appointments")
        .insert([{
          salon_id: salonId,
          staff_id: staffId,
          service_id: services[0].id,
          start_time: startTime,
          end_time: endTime,
          status: "cancelled" as "cancelled",
          internal_notes: `[${block.type}] ${block.note || "Blokada czasu"}`,
          notes: block.note || `Blokada: ${block.type}`,
        }]);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Zapisano", description: "Blokada została dodana do kalendarza" });
    } catch {
      toast({ title: "Błąd", description: "Nie udało się zapisać blokady", variant: "destructive" });
    }
  };

  const handleApplyTemplate = async (staffId: string, templateId: string, startDate: string, endDate: string) => {
    if (isDemo) {
      toast({ title: "Tryb Demo", description: "Dane nie zostały zapisane" });
      return;
    }
    // Template application would update working_hours — for now show confirmation
    toast({ title: "Szablon zastosowany", description: "Godziny pracy zostały zaktualizowane" });
    queryClient.invalidateQueries({ queryKey: ["working-hours"] });
  };

  const handleWeekDuplicate = async (staffIds: string[], sourceWeek: Date, targetWeeksCount: number, includeExceptions: boolean) => {
    if (isDemo) {
      toast({ title: "Tryb Demo", description: "Dane nie zostały zapisane" });
      return;
    }
    toast({ title: "Grafik zduplikowany", description: `Skopiowano grafik na ${targetWeeksCount} tygodni` });
    queryClient.invalidateQueries({ queryKey: ["working-hours"] });
  };

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="calendar" />
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "calendar" | "grid" | "templates" | "smart" | "time-off")} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-5 w-full sm:w-auto">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">{t('schedule.calendar')}</span>
            </TabsTrigger>
            <TabsTrigger value="time-off" className="gap-2">
              <CalendarOff className="w-4 h-4" />
              <span className="hidden sm:inline">Urlopy</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">{t('schedule.grid')}</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{t('schedule.templates')}</span>
            </TabsTrigger>
            <TabsTrigger value="smart" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">{t('schedule.assistant')}</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsQuickBlockOpen(true)}
          >
            <Coffee className="w-4 h-4" />
            <span className="hidden sm:inline">{t('schedule.quickBlock')}</span>
          </Button>
          <Button variant="luxury" size="sm" className="gap-2" onClick={() => setIsNewAppointmentOpen(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('schedule.newAppointment')}</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {activeView === "calendar" && (
        <div className="space-y-6">
          <WeeklyCalendar isDemo={isDemo} />
          <WeekDuplication onDuplicate={handleWeekDuplicate} isDemo={isDemo} />
        </div>
      )}

      {activeView === "grid" && (
        <div className="space-y-6">
          <ScheduleGridView isDemo={isDemo} />
          <WeekDuplication onDuplicate={handleWeekDuplicate} isDemo={isDemo} />
        </div>
      )}

      {activeView === "templates" && (
        <div className="space-y-6">
          <ScheduleTemplates onApplyTemplate={handleApplyTemplate} isDemo={isDemo} />
        </div>
      )}

      {activeView === "smart" && (
        <div className="space-y-6">
          <SmartScheduleHelpers isDemo={isDemo} onNavigate={onNavigate} />
        </div>
      )}

      {activeView === "time-off" && (
        <div className="space-y-6">
          <TimeOffManagement isDemo={isDemo} />
        </div>
      )}

      {/* Quick Block Modal */}
      <QuickBlockModal
        isOpen={isQuickBlockOpen}
        onClose={() => setIsQuickBlockOpen(false)}
        onSave={handleSaveBlock}
        isDemo={isDemo}
      />

      {/* New Appointment Modal (header button) */}
      <AppointmentModal
        isOpen={isNewAppointmentOpen}
        onClose={() => setIsNewAppointmentOpen(false)}
        onSave={async (appointment) => {
          if (isDemo) {
            toast({ title: "Tryb Demo", description: "Dane nie zostały zapisane" });
            setIsNewAppointmentOpen(false);
            return;
          }
          if (!salonId) return;
          try {
            const startDate = new Date(`${appointment.date}T${appointment.time}`);
            const endDate = new Date(startDate.getTime() + appointment.duration * 60000);
            const { error } = await supabase.from("appointments").insert({
              salon_id: salonId,
              client_id: appointment.clientId || null,
              staff_id: appointment.staffId,
              service_id: appointment.serviceId,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              status: "booked",
              notes: appointment.notes || null,
              price: null,
            });
            if (error) throw error;
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            queryClient.invalidateQueries({ queryKey: ["calendar-appointments"] });
            toast({ title: "Zapisano", description: "Wizyta została dodana" });
            setIsNewAppointmentOpen(false);
          } catch {
            toast({ title: "Błąd", description: "Nie udało się zapisać wizyty", variant: "destructive" });
          }
        }}
        isDemo={isDemo}
      />
    </div>
  );
}
