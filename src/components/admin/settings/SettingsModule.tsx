import { useState } from "react";
import { Building2, Calendar, Bell, Plug } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SalonProfileSettings } from "./SalonProfileSettings";
import { BookingSettingsPanel } from "./BookingSettingsPanel";
import { NotificationSettings } from "./NotificationSettings";
import { IntegrationSettings } from "./IntegrationSettings";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { SettingsTabType } from "./types";

export function SettingsModule() {
  const [activeTab, setActiveTab] = useState<SettingsTabType>("profile");
  const { profile, settings, isLoading, isSaving, updateProfile, updateSettings } = useSalonSettings();

  const tabs = [
    { id: "profile" as const, label: "Profil salonu", icon: Building2 },
    { id: "booking" as const, label: "Rezerwacje", icon: Calendar },
    { id: "notifications" as const, label: "Powiadomienia", icon: Bell },
    { id: "integrations" as const, label: "Integracje", icon: Plug },
  ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SettingsTabType)}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-2 bg-transparent p-0">
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
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("notifications", updates)}
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
        </div>
      </Tabs>
    </div>
  );
}
