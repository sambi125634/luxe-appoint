import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RetentionHealthBoard } from "./RetentionHealthBoard";
import { RetentionTimeline } from "./RetentionTimeline";
import { RetentionKPI } from "./RetentionKPI";
import { SequenceEditor } from "./SequenceEditor";
import { RetentionHistory } from "./RetentionHistory";
import { RetentionStats } from "./RetentionStats";
import { MOCK_RADAR_CLIENTS, MOCK_TIMELINE, MOCK_KPI, MOCK_SEQUENCES } from "./mock-data";
import { useRetentionRadar, useRetentionTimeline, useRetentionKPI, useRetentionSequences } from "@/hooks/useRetention";
import type { RetentionRadarClient } from "./types";
import { BarChart3, Settings2, History, TrendingUp } from "lucide-react";

interface RetentionDashboardProps {
  salonId?: string;
  isDemo?: boolean;
  onNavigate?: (tab: string) => void;
}

export function RetentionDashboard({ salonId, isDemo = false, onNavigate }: RetentionDashboardProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: radarClients = [] } = useRetentionRadar(isDemo ? undefined : salonId);
  const { data: timeline = [] } = useRetentionTimeline(isDemo ? undefined : salonId);
  const { data: kpi } = useRetentionKPI(isDemo ? undefined : salonId);
  const { data: sequences = [] } = useRetentionSequences(isDemo ? undefined : salonId);

  const displayRadar = isDemo ? MOCK_RADAR_CLIENTS : radarClients;
  const displayTimeline = isDemo ? MOCK_TIMELINE : timeline;
  const displayKPI = isDemo ? MOCK_KPI : (kpi ?? MOCK_KPI);
  const displaySequences = isDemo ? MOCK_SEQUENCES : sequences;

  const handleClientClick = (client: RetentionRadarClient) => {
    console.log("Client clicked:", client);
  };

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
          {/* How it works section */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-6 border border-primary/20">
            <div className="flex-1">
              <h3 className="font-serif font-bold text-lg mb-2">🤖 Jak działa Retencja AI?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                System automatycznie wykrywa klientki które przestały przychodzić i wysyła do nich spersonalizowane wiadomości we właściwym momencie — bez żadnego działania z Twojej strony.
              </p>

              {/* Flow visualization */}
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { icon: "👤", label: "Klientka\nbez wizyty" },
                  { icon: "→", label: null },
                  { icon: "🔍", label: "AI wykrywa\nryzyko" },
                  { icon: "→", label: null },
                  { icon: "📱", label: "Auto-\nwiadomość" },
                  { icon: "→", label: null },
                  { icon: "📅", label: "Klientka\nrezerwuje" },
                  { icon: "→", label: null },
                  { icon: "💰", label: "Przychód\nodzyskany" },
                ].map((step, i) => step.label ? (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="w-12 h-12 rounded-xl bg-background shadow-sm flex items-center justify-center text-xl">
                      {step.icon}
                    </div>
                    <p className="text-xs text-center text-muted-foreground whitespace-pre-line">{step.label}</p>
                  </div>
                ) : (
                  <span key={i} className="text-muted-foreground text-lg mb-4">→</span>
                ))}
              </div>
            </div>

            {/* 3 key facts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              {[
                { icon: "⚡", title: "Działa automatycznie", desc: "Zero klikania. System sam decyduje kiedy i do kogo wysłać wiadomość." },
                { icon: "🎯", title: "Właściwy moment", desc: "Nie za wcześnie, nie za późno. AI uczy się rytmu każdej klientki." },
                { icon: "💬", title: "Spersonalizowane treści", desc: "Imię, usługa, ulubione godziny — każda wiadomość jest inna." },
              ].map((fact, i) => (
                <div key={i} className="bg-background/70 rounded-xl p-3 text-sm">
                  <span className="text-lg">{fact.icon}</span>
                  <p className="font-semibold mt-1 text-xs">{fact.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{fact.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <RetentionKPI data={displayKPI} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RetentionHealthBoard clients={displayRadar} onClientClick={handleClientClick} />
            <RetentionTimeline items={displayTimeline} />
          </div>
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
