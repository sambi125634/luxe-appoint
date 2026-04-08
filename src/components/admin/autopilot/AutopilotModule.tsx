import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Settings2, History, ListTodo } from "lucide-react";
import { AutopilotDashboard } from "./AutopilotDashboard";
import { AutopilotConfig } from "./AutopilotConfig";
import { AutopilotHistory } from "./AutopilotHistory";
import { AutopilotQueue } from "./AutopilotQueue";

interface AutopilotModuleProps {
  isDemo?: boolean;
}

export function AutopilotModule({ isDemo }: AutopilotModuleProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="config" className="gap-2">
            <Settings2 className="w-4 h-4" />
            <span className="hidden sm:inline">Konfiguracja</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historia</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="gap-2">
            <ListTodo className="w-4 h-4" />
            <span className="hidden sm:inline">Kolejka</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AutopilotDashboard />
        </TabsContent>
        <TabsContent value="config">
          <AutopilotConfig />
        </TabsContent>
        <TabsContent value="history">
          <AutopilotHistory />
        </TabsContent>
        <TabsContent value="queue">
          <AutopilotQueue />
        </TabsContent>
      </Tabs>
    </div>
  );
}
