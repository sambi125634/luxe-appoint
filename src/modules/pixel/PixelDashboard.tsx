import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Zap, Activity, Target, TrendingUp } from "lucide-react";
import { PixelSetupWizard } from "./PixelSetupWizard";
import { AudienceMappings } from "./AudienceMappings";
import { PixelHealthDashboard } from "./PixelHealthDashboard";
import { PixelEventsLog } from "./PixelEventsLog";
import { LookalikeEngine } from "./LookalikeEngine";
import { PixelAttribution } from "./PixelAttribution";
import { toast } from "sonner";

interface PixelDashboardProps {
  isDemo?: boolean;
}

export function PixelDashboard({ isDemo }: PixelDashboardProps) {
  const [isConfigured, setIsConfigured] = useState(isDemo);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Meta Pixel & CRM Sync
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Automatyczna synchronizacja tagów CRM z Custom Audiences w Meta. Server-side Conversions API.
        </p>
      </div>

      {!isConfigured ? (
        <PixelSetupWizard
          isDemo={isDemo}
          onComplete={() => {
            setIsConfigured(true);
            toast.success("Pixel aktywowany pomyślnie!");
          }}
        />
      ) : (
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="health" className="gap-1.5 text-xs">
              <Activity className="w-3.5 h-3.5" />
              Health
            </TabsTrigger>
            <TabsTrigger value="audiences" className="gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Audiences
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 text-xs">
              <Zap className="w-3.5 h-3.5" />
              Zdarzenia
            </TabsTrigger>
            <TabsTrigger value="lookalike" className="gap-1.5 text-xs">
              <TrendingUp className="w-3.5 h-3.5" />
              Lookalike
            </TabsTrigger>
            <TabsTrigger value="attribution" className="gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5" />
              ROAS
            </TabsTrigger>
            <TabsTrigger value="setup" className="gap-1.5 text-xs">
              <Settings className="w-3.5 h-3.5" />
              Konfiguracja
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health">
            <PixelHealthDashboard isDemo={isDemo} />
          </TabsContent>
          <TabsContent value="audiences">
            <AudienceMappings isDemo={isDemo} />
          </TabsContent>
          <TabsContent value="events">
            <PixelEventsLog isDemo={isDemo} />
          </TabsContent>
          <TabsContent value="lookalike">
            <LookalikeEngine isDemo={isDemo} />
          </TabsContent>
          <TabsContent value="attribution">
            <PixelAttribution isDemo={isDemo} />
          </TabsContent>
          <TabsContent value="setup">
            <PixelSetupWizard isDemo={isDemo} onComplete={() => toast.success("Konfiguracja zapisana")} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
