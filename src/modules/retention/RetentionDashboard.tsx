import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RetentionHealthBoard } from "./RetentionHealthBoard";
import { RetentionTimeline } from "./RetentionTimeline";
import { RetentionKPI } from "./RetentionKPI";
import { SequenceConfig } from "./SequenceConfig";
import { MOCK_RADAR_CLIENTS, MOCK_TIMELINE, MOCK_KPI, MOCK_SEQUENCES } from "./mock-data";
import { useRetentionRadar, useRetentionTimeline, useRetentionKPI, useRetentionSequences } from "@/hooks/useRetention";
import type { RetentionRadarClient } from "./types";
import { Settings2, ChevronDown, ChevronUp } from "lucide-react";

interface RetentionDashboardProps {
  salonId?: string;
  isDemo?: boolean;
}

export function RetentionDashboard({ salonId, isDemo = false }: RetentionDashboardProps) {
  const [showConfig, setShowConfig] = useState(false);

  const { data: radarClients = [] } = useRetentionRadar(isDemo ? undefined : salonId);
  const { data: timeline = [] } = useRetentionTimeline(isDemo ? undefined : salonId);
  const { data: kpi } = useRetentionKPI(isDemo ? undefined : salonId);
  const { data: sequences = [] } = useRetentionSequences(isDemo ? undefined : salonId);

  const displayRadar = isDemo ? MOCK_RADAR_CLIENTS : radarClients;
  const displayTimeline = isDemo ? MOCK_TIMELINE : timeline;
  const displayKPI = isDemo ? MOCK_KPI : (kpi ?? MOCK_KPI);
  const displaySequences = isDemo ? MOCK_SEQUENCES : sequences;

  const handleClientClick = (client: RetentionRadarClient) => {
    // Future: open client profile modal
    console.log("Client clicked:", client);
  };

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <RetentionKPI data={displayKPI} />

      {/* Radar + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RetentionHealthBoard clients={displayRadar} onClientClick={handleClientClick} />
        <RetentionTimeline items={displayTimeline} />
      </div>

      {/* Sequence Config toggle */}
      <div>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowConfig(!showConfig)}
        >
          <Settings2 className="w-4 h-4" />
          {showConfig ? "Ukryj konfigurację sekwencji" : "Konfiguracja sekwencji retencyjnych"}
          {showConfig ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>
        {showConfig && (
          <div className="mt-4">
            <SequenceConfig sequences={displaySequences} readOnly={isDemo} />
          </div>
        )}
      </div>
    </div>
  );
}
