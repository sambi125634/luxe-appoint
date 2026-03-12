import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Zap, Activity } from "lucide-react";
import { PixelSetupWizard } from "./PixelSetupWizard";
import { AudienceMappings } from "./AudienceMappings";
import { PixelHealthDashboard } from "./PixelHealthDashboard";
import { PixelEventsLog } from "./PixelEventsLog";
import { toast } from "sonner";

interface PixelDashboardProps { isDemo?: boolean; }

export function PixelDashboard({ isDemo }: PixelDashboardProps) {
  const { t } = useTranslation();
  const [isConfigured, setIsConfigured] = useState(isDemo);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-serif font-semibold flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          {t('pixel.title')}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">{t('pixel.description')}</p>
      </div>
      {!isConfigured ? (
        <PixelSetupWizard isDemo={isDemo} onComplete={() => { setIsConfigured(true); toast.success(t('pixel.pixelActivated')); }} />
      ) : (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="overview" className="gap-1.5 text-xs"><Activity className="w-3.5 h-3.5" />{t('pixel.overview')}</TabsTrigger>
            <TabsTrigger value="audiences" className="gap-1.5 text-xs"><Users className="w-3.5 h-3.5" />{t('pixel.audiences')}</TabsTrigger>
            <TabsTrigger value="events" className="gap-1.5 text-xs"><Zap className="w-3.5 h-3.5" />{t('pixel.capiEvents')}</TabsTrigger>
            <TabsTrigger value="setup" className="gap-1.5 text-xs"><Settings className="w-3.5 h-3.5" />{t('pixel.setup')}</TabsTrigger>
          </TabsList>
          <TabsContent value="overview"><PixelHealthDashboard isDemo={isDemo} /></TabsContent>
          <TabsContent value="audiences"><AudienceMappings isDemo={isDemo} /></TabsContent>
          <TabsContent value="events"><PixelEventsLog isDemo={isDemo} /></TabsContent>
          <TabsContent value="setup"><PixelSetupWizard isDemo={isDemo} onComplete={() => toast.success(t('pixel.configSaved'))} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}
