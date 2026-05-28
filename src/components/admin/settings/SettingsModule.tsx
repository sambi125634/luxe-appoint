import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Building2, Calendar, Bell, Plug, Zap, Radio, Download, Users, CreditCard, Scale, ChevronRight } from "lucide-react";
import { SalonProfileSettings } from "./SalonProfileSettings";
import { BookingSettingsPanel } from "./BookingSettingsPanel";
import { NotificationSettings } from "./NotificationSettings";
import { IntegrationSettings } from "./IntegrationSettings";
import { AutomationSettings } from "./AutomationSettings";
import { CommunicationSettings } from "./CommunicationSettings";
import { TeamSettings } from "./TeamSettings";
import { PaymentsSettings } from "./PaymentsSettings";
import { LegalSettings } from "./LegalSettings";
import { ExportModule } from "@/components/admin/export";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { SettingsTabType } from "./types";
import { SectionGuide } from "../SectionGuide";

interface SettingsModuleProps {
  isDemo?: boolean;
  onNavigateToModule?: (tabId: string) => void;
  initialTab?: string;
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

export function SettingsModule({ isDemo = false, onNavigateToModule, initialTab }: SettingsModuleProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTabType>((initialTab as SettingsTabType) || "profile");
  const { profile: realProfile, settings, isLoading: realLoading, isSaving, updateProfile, updateSettings } = useSalonSettings();
  const profile = isDemo ? demoProfile : realProfile;
  const isLoading = isDemo ? false : realLoading;

  const tabs = [
    { id: "profile" as const, label: t("settingsModule.salonProfile"), icon: Building2, group: "Salon", description: "Dane, branding, godziny" },
    { id: "booking" as const, label: t("settingsModule.booking"), icon: Calendar, group: "Salon", description: "Polityka rezerwacji" },
    { id: "team" as const, label: "Zespół", icon: Users, group: "Salon", description: "Pracownicy i stawki" },
    { id: "notifications" as const, label: t("settingsModule.notifications"), icon: Bell, group: "Komunikacja", description: "Email, SMS, push" },
    { id: "communication" as const, label: "Komunikacja", icon: Radio, group: "Komunikacja", description: "Kanały i szablony" },
    { id: "payments" as const, label: "Płatności", icon: CreditCard, group: "Operacje", description: "Przelewy24, VAT, zaliczki" },
    { id: "integrations" as const, label: t("settingsModule.integrations"), icon: Plug, group: "Operacje", description: "Google, Meta, kalendarze" },
    { id: "automation" as const, label: t("settingsModule.automation"), icon: Zap, group: "Operacje", description: "AI Autopilot" },
    { id: "legal" as const, label: "Prawne", icon: Scale, group: "Zgodność", description: "Regulamin, RODO, cookies" },
    { id: "export" as const, label: "Eksport danych", icon: Download, group: "Zgodność", description: "Backup i RODO export" },
  ];

  const groups = ["Salon", "Komunikacja", "Operacje", "Zgodność"];
  const activeMeta = tabs.find((t) => t.id === activeTab)!;

  return (
    <div className="space-y-6">
      <SectionGuide sectionKey="settings" />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar navigation — premium SaaS pattern */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <nav className="space-y-6">
            {groups.map((group) => (
              <div key={group}>
                <h3 className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                  {group}
                </h3>
                <div className="space-y-0.5">
                  {tabs.filter((t) => t.group === group).map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                          isActive
                            ? "bg-primary/8 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--primary)/0.15)]"
                            : "text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            isActive ? "text-primary" : "text-muted-foreground/60 group-hover:text-foreground"
                          }`}
                        />
                        <span className="text-sm font-medium flex-1 truncate">{tab.label}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary/60" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content area */}
        <div className="min-w-0">
          <div className="mb-6 pb-5 border-b border-border/60">
            <div className="flex items-center gap-2 text-xs text-muted-foreground/80 mb-1.5">
              <span>{activeMeta.group}</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground/70">{activeMeta.label}</span>
            </div>
            <h2 className="text-2xl font-serif tracking-tight text-foreground">{activeMeta.label}</h2>
            <p className="text-sm text-muted-foreground mt-1">{activeMeta.description}</p>
          </div>

          {activeTab === "profile" && (
            <SalonProfileSettings
              profile={profile}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={updateProfile}
            />
          )}
          {activeTab === "booking" && (
            <BookingSettingsPanel
              settings={settings.booking}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("booking", updates)}
            />
          )}
          {activeTab === "notifications" && (
            <NotificationSettings
              settings={settings.notifications}
              integrationSettings={settings.integrations}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("notifications", updates)}
              onSaveIntegration={(updates) => updateSettings("integrations", updates)}
            />
          )}
          {activeTab === "communication" && (
            <CommunicationSettings
              isLoading={isLoading}
              isSaving={isSaving}
              isDemo={isDemo}
              onNavigateToModule={onNavigateToModule}
            />
          )}
          {activeTab === "team" && <TeamSettings isDemo={isDemo} onNavigateToModule={onNavigateToModule} />}
          {activeTab === "payments" && <PaymentsSettings isDemo={isDemo} />}
          {activeTab === "integrations" && (
            <IntegrationSettings
              settings={settings.integrations}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("integrations", updates)}
            />
          )}
          {activeTab === "automation" && (
            <AutomationSettings
              settings={settings.automation}
              isLoading={isLoading}
              isSaving={isSaving}
              onSave={(updates) => updateSettings("automation", updates)}
              onNavigateToModule={onNavigateToModule}
              isDemo={isDemo}
            />
          )}
          {activeTab === "legal" && <LegalSettings isDemo={isDemo} />}
          {activeTab === "export" && <ExportModule />}
        </div>
      </div>
    </div>
  );
}
