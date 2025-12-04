import { useState } from "react";
import { 
  Calendar, 
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
import { 
  ScheduleGridView, 
  ScheduleTemplates, 
  WeekDuplication,
  QuickBlockModal,
  SmartScheduleHelpers 
} from "./schedule";

export function ScheduleManagement() {
  const [activeView, setActiveView] = useState<"calendar" | "grid" | "templates" | "smart">("calendar");
  const [isQuickBlockOpen, setIsQuickBlockOpen] = useState(false);

  const handleSaveBlock = (block: any) => {
    console.log("Saving block:", block);
    // In real app, save to database
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-4 w-full sm:w-auto">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Kalendarz</span>
            </TabsTrigger>
            <TabsTrigger value="grid" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Siatka</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Szablony</span>
            </TabsTrigger>
            <TabsTrigger value="smart" className="gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Asystent</span>
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
            <span className="hidden sm:inline">Szybka blokada</span>
          </Button>
          <Button variant="luxury" size="sm" className="gap-2">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nowa wizyta</span>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {activeView === "calendar" && (
        <div className="space-y-6">
          <WeeklyCalendar />
          <WeekDuplication />
        </div>
      )}

      {activeView === "grid" && (
        <div className="space-y-6">
          <ScheduleGridView />
          <WeekDuplication />
        </div>
      )}

      {activeView === "templates" && (
        <div className="space-y-6">
          <ScheduleTemplates />
        </div>
      )}

      {activeView === "smart" && (
        <div className="space-y-6">
          <SmartScheduleHelpers />
        </div>
      )}

      {/* Quick Block Modal */}
      <QuickBlockModal
        isOpen={isQuickBlockOpen}
        onClose={() => setIsQuickBlockOpen(false)}
        onSave={handleSaveBlock}
      />
    </div>
  );
}
