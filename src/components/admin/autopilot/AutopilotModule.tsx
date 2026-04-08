import { useState } from "react";
import { Bot, LayoutDashboard, Settings2, History, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VacationModeBanner } from "./VacationModeBanner";
import { AutopilotScore } from "./AutopilotScore";
import { AutopilotOverview } from "./AutopilotOverview";
import { AutopilotFunctions } from "./AutopilotFunctions";
import { AutopilotHistory } from "./AutopilotHistory";
import { AutopilotSettings } from "./AutopilotSettings";
import { DEMO_AUTOPILOT_DATA } from "./demo-data";

interface AutopilotModuleProps {
  isDemo?: boolean;
}

const tabs = [
  { id: "overview", label: "Przegląd", icon: LayoutDashboard },
  { id: "functions", label: "Funkcje", icon: Settings2 },
  { id: "history", label: "Historia", icon: History },
  { id: "settings", label: "Ustawienia", icon: SlidersHorizontal },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function AutopilotModule({ isDemo }: AutopilotModuleProps) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  return (
    <div className="space-y-0">
      <VacationModeBanner />

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI Autopilot</h2>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="text-[10px] h-5 border-green-200 bg-green-50 text-green-700 gap-1 cursor-default">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Aktywny 24/7
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">
                      {isDemo
                        ? `Autopilot wykonał ${DEMO_AUTOPILOT_DATA.kpi.actionsTotal} akcji w ciągu ostatnich 30 dni`
                        : "Autopilot monitoruje Twój salon 24/7"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {isDemo
              ? `Autopilot aktywny · Dziś zadziałał ${DEMO_AUTOPILOT_DATA.kpi.actionsToday}× · Odzyskano ${DEMO_AUTOPILOT_DATA.kpi.revenueRecovered.toLocaleString("pl-PL")} zł tego miesiąca`
              : "System pracuje za Ciebie — nawet gdy śpisz"}
          </p>
        </div>
        <AutopilotScore isDemo={isDemo} />
      </div>

      {/* Tabs */}
      <div className="border-b border-border mb-6">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-violet-600 text-violet-600"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === "overview" && <AutopilotOverview isDemo={isDemo} />}
        {activeTab === "functions" && <AutopilotFunctions isDemo={isDemo} />}
        {activeTab === "history" && <AutopilotHistory isDemo={isDemo} />}
        {activeTab === "settings" && <AutopilotSettings isDemo={isDemo} />}
      </div>
    </div>
  );
}
