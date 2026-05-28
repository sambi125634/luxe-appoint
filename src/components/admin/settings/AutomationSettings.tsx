import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Save, Loader2, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";

export interface AutomationSettingsData {
  defaultVatRate: number;
  timezone: string;
  gdprConsentText: string;
  dataRetentionYears: number;
}

interface AutopilotGlobalConfig {
  isActive: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  maxMessagesPerClientDays: number;
  aiSuggestionsEnabled: boolean;
}

interface AutomationSettingsProps {
  settings: AutomationSettingsData;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<AutomationSettingsData>) => Promise<boolean>;
  onNavigateToModule?: (tabId: string) => void;
  isDemo?: boolean;
}

const defaultAutopilotConfig: AutopilotGlobalConfig = {
  isActive: true,
  quietHoursStart: "20:00",
  quietHoursEnd: "08:00",
  maxMessagesPerClientDays: 7,
  aiSuggestionsEnabled: true,
};

export function AutomationSettings({
  settings,
  isLoading,
  isSaving,
  onSave,
  onNavigateToModule,
  isDemo = false,
}: AutomationSettingsProps) {
  const { t } = useTranslation();
  const { salonId } = useSalonId();
  const [autopilot, setAutopilot] = useState<AutopilotGlobalConfig>(defaultAutopilotConfig);
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!salonId || isDemo) return;
    fetchAutopilotConfig();
  }, [salonId, isDemo]);

  const fetchAutopilotConfig = async () => {
    if (!salonId) return;
    const { data } = await supabase
      .from("autopilot_config")
      .select("is_active, quiet_hours_start, quiet_hours_end, max_messages_per_client_days, ai_suggestions_enabled")
      .eq("salon_id", salonId)
      .maybeSingle();

    if (data) {
      setAutopilot({
        isActive: data.is_active ?? true,
        quietHoursStart: data.quiet_hours_start ?? "20:00",
        quietHoursEnd: data.quiet_hours_end ?? "08:00",
        maxMessagesPerClientDays: data.max_messages_per_client_days ?? 7,
        aiSuggestionsEnabled: data.ai_suggestions_enabled ?? true,
      });
    }
  };

  const saveAutopilot = async (updates: Partial<AutopilotGlobalConfig>) => {
    if (!salonId || isDemo) return;
    setAutopilotLoading(true);
    const newConfig = { ...autopilot, ...updates };
    setAutopilot(newConfig);

    await supabase
      .from("autopilot_config")
      .upsert({
        salon_id: salonId,
        is_active: newConfig.isActive,
        quiet_hours_start: newConfig.quietHoursStart,
        quiet_hours_end: newConfig.quietHoursEnd,
        max_messages_per_client_days: newConfig.maxMessagesPerClientDays,
        ai_suggestions_enabled: newConfig.aiSuggestionsEnabled,
      }, { onConflict: "salon_id" });

    setAutopilotLoading(false);
  };

  const handleSaveDefaults = async () => {
    await onSave(localSettings);
    setHasChanges(false);
  };

  const updateLocal = (key: keyof AutomationSettingsData, value: string | number) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-40 bg-muted animate-pulse rounded-lg" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Default Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t("settingsModule.defaultSettings")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.defaultSettingsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("settingsModule.defaultVatRate")}</Label>
              <Select
                value={String(localSettings.defaultVatRate)}
                onValueChange={(v) => updateLocal("defaultVatRate", Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t("settingsModule.vatExempt")}</SelectItem>
                  <SelectItem value="8">8%</SelectItem>
                  <SelectItem value="23">{t("settingsModule.vatDefault")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("settingsModule.timezone")}</Label>
              <Select
                value={localSettings.timezone}
                onValueChange={(v) => updateLocal("timezone", v)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Warsaw">Europe/Warsaw (PL)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (UK)</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin (DE)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GDPR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t("settingsModule.gdprPrivacy")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.gdprPrivacyDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settingsModule.marketingConsentText")}</Label>
            <Textarea
              value={localSettings.gdprConsentText}
              onChange={(e) => updateLocal("gdprConsentText", e.target.value)}
              rows={3}
              placeholder={t("settingsModule.marketingConsentPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">
              {t("settingsModule.marketingConsentHint")}
            </p>
          </div>

          {hasChanges && (
            <Button onClick={handleSaveDefaults} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {t("settingsModule.saveSettings")}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
