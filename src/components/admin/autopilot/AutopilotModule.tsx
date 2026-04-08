import { useState } from "react";
import { Bot, LayoutDashboard, Settings2, History, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { VacationModeBanner } from "./VacationModeBanner";
import { AutopilotScore } from "./AutopilotScore";
import { AutopilotOverview } from "./AutopilotOverview";
import { AutopilotFunctions } from "./AutopilotFunctions";
import { AutopilotHistory } from "./AutopilotHistory";
import { AutopilotSettings } from "./AutopilotSettings";

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
              <Badge variant="outline" className="text-[10px] h-5 border-green-200 bg-green-50 text-green-700 gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Aktywny 24/7
              </Badge>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            System pracuje za Ciebie — nawet gdy śpisz
          </p>
        </div>
        <AutopilotScore />
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
        {activeTab === "overview" && <AutopilotOverview />}
        {activeTab === "functions" && <AutopilotFunctions />}
        {activeTab === "history" && <AutopilotHistory />}
        {activeTab === "settings" && <AutopilotSettings />}
      </div>
    </div>
  );
}
