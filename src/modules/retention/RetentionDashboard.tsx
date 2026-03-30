import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SequenceEditor } from "./SequenceEditor";
import { RetentionHistory } from "./RetentionHistory";
import { RetentionStats } from "./RetentionStats";
import { MOCK_SEQUENCES } from "./mock-data";
import { useRetentionRadar, useRetentionSequences } from "@/hooks/useRetention";
import { BarChart3, Settings2, History, TrendingUp } from "lucide-react";
import { RetentionOverview } from "./RetentionOverview";

interface RetentionDashboardProps {
  salonId?: string;
  isDemo?: boolean;
  onNavigate?: (tab: string) => void;
}

export function RetentionDashboard({ salonId, isDemo = false, onNavigate }: RetentionDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: sequences = [] } = useRetentionSequences(isDemo ? undefined : salonId);
  const displaySequences = isDemo ? MOCK_SEQUENCES : sequences;
  const activeSequencesCount = displaySequences.filter(s => s.is_active).length;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Przegląd</span>
          </TabsTrigger>
          <TabsTrigger value="sequences" className="gap-1.5 text-xs sm:text-sm">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Sekwencje</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5 text-xs sm:text-sm">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historia</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="gap-1.5 text-xs sm:text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Statystyki</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <RetentionOverview salonId={salonId} isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="sequences" className="mt-6">
          <SequenceEditor sequences={displaySequences} readOnly={isDemo} onNavigate={onNavigate} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <RetentionHistory messages={[]} isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <RetentionStats isDemo={isDemo} activeSequencesCount={activeSequencesCount} onTabChange={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
