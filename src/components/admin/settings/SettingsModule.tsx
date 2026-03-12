import { useState } from "react";
import { Building2, Calendar, Bell, Plug, Zap } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalonProfileSettings } from "./SalonProfileSettings";
import { BookingSettingsPanel } from "./BookingSettingsPanel";
import { NotificationSettings } from "./NotificationSettings";
import { IntegrationSettings } from "./IntegrationSettings";
import { AutomationSettings } from "./AutomationSettings";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { SettingsTabType } from "./types";
import { SectionGuide } from "../SectionGuide";

interface SettingsModuleProps {
  isDemo?: boolean;
  onNavigateToModule?: (tabId: string) => void;
}

const demoProfile = {
  id: "demo-salon-id",
  name: "Lux Beauty Studio",
  description: "Nowoczesny salon kosmetyczny w centrum Warszawy",
  address: "ul. Marszałkowska 42",
  city: "Warszawa",
  phone: "+48 500 123 456",
  email: "kontakt@luxbeauty.pl",
  logoUrl: null,
  themePrimaryColor: "#C9A96E",
  themeSecondaryColor: "#1a1a2e",
};

export function SettingsModule({ isDemo = false, onNavigateToModule }: SettingsModuleProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabType>("profile");
  const { profile: realProfile, settings, isLoading: realLoading, isSaving, updateProfile, updateSettings } = useSalonSettings();
  const profile = isDemo ? demoProfile : realProfile;
  const isLoading = isDemo ? false : realLoading;

  const tabs = [
    { id: "profile" as const, label: "Profil salonu", icon: Building2 },
    { id: "booking" as const, label: "Rezerwacje", icon: Calendar },
    { id: "notifications" as const, label: "Powiadomienia", icon: Bell },
    { id: "integrations" as const, label: "Integracje", icon: Plug },
    { id: "automation" as const, label: "Automatyzacja", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="settings" />
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTabType)}>
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 h-auto gap-2 bg-transparent p-0">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-2.5 rounded-lg border border-border data-[state=active]:border-primary transition-all"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6">
          <TabsContent value="profile" className="m-0">
            <SalonProfileSettings
              profile={profile}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={updateProfile}
            />
          </TabsContent>
          <TabsContent value="booking" className="m-0">
            <BookingSettingsPanel
              settings={settings.booking}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("booking", updates)}
            />
          </TabsContent>
          <TabsContent value="notifications" className="m-0">
            <NotificationSettings
              settings={settings.notifications}
              integrationSettings={settings.integrations}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("notifications", updates)}
              onSaveIntegration={(updates) => updateSettings("integrations", updates)}
            />
          </TabsContent>
          <TabsContent value="integrations" className="m-0">
            <IntegrationSettings
              settings={settings.integrations}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("integrations", updates)}
            />
          </TabsContent>
          <TabsContent value="automation" className="m-0">
            <AutomationSettings
              settings={settings.automation}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("automation", updates)}
              onNavigateToModule={onNavigateToModule}
              isDemo={isDemo}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
