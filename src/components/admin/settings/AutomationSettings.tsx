import { useState, useEffect } from "react";
import { Bot, Clock, Shield, Zap, ExternalLink, CheckCircle2, AlertCircle, Save, Loader2, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

interface ModuleStatus {
  key: string;
  label: string;
  icon: React.ReactNode;
  configured: boolean;
  targetTab: string;
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
  const { salonId } = useSalonId();
  const [autopilot, setAutopilot] = useState<AutopilotGlobalConfig>(defaultAutopilotConfig);
  const [autopilotLoading, setAutopilotLoading] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);
  const [moduleStatuses, setModuleStatuses] = useState<ModuleStatus[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (!salonId || isDemo) {
      setModuleStatuses(getDemoModuleStatuses());
      return;
    }
    fetchAutopilotConfig();
    fetchModuleStatuses();
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

  const fetchModuleStatuses = async () => {
    if (!salonId) return;
    const [pixelRes, retentionRes, referralRes] = await Promise.all([
      supabase.from("pixel_config").select("is_active").eq("salon_id", salonId).maybeSingle(),
      supabase.from("retention_sequences").select("id").eq("salon_id", salonId).limit(1),
      supabase.from("referral_codes").select("id").eq("salon_id", salonId).limit(1),
    ]);

    setModuleStatuses([
      {
        key: "pixel",
        label: "Meta Pixel",
        icon: <Zap className="w-4 h-4" />,
        configured: !!(pixelRes.data?.is_active),
        targetTab: "pixel",
      },
      {
        key: "retention",
        label: "Retencja",
        icon: <Clock className="w-4 h-4" />,
        configured: !!(retentionRes.data && retentionRes.data.length > 0),
        targetTab: "retention",
      },
      {
        key: "referral",
        label: "Polecenia",
        icon: <ExternalLink className="w-4 h-4" />,
        configured: !!(referralRes.data && referralRes.data.length > 0),
        targetTab: "referral",
      },
      {
        key: "analytics",
        label: "True Profit",
        icon: <Globe className="w-4 h-4" />,
        configured: false,
        targetTab: "analytics",
      },
      {
        key: "consultation",
        label: "Konsultacje",
        icon: <Shield className="w-4 h-4" />,
        configured: false,
        targetTab: "consultation",
      },
    ]);
  };

  const getDemoModuleStatuses = (): ModuleStatus[] => [
    { key: "pixel", label: "Meta Pixel", icon: <Zap className="w-4 h-4" />, configured: true, targetTab: "pixel" },
    { key: "retention", label: "Retencja", icon: <Clock className="w-4 h-4" />, configured: true, targetTab: "retention" },
    { key: "referral", label: "Polecenia", icon: <ExternalLink className="w-4 h-4" />, configured: false, targetTab: "referral" },
    { key: "analytics", label: "True Profit", icon: <Globe className="w-4 h-4" />, configured: false, targetTab: "analytics" },
    { key: "consultation", label: "Konsultacje", icon: <Shield className="w-4 h-4" />, configured: true, targetTab: "consultation" },
  ];

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
      {/* Sekcja 1: Autopilot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            Autopilot — ustawienia globalne
          </CardTitle>
          <CardDescription>
            Kontroluj automatyczne wiadomości (SMS, email, retencja) z jednego miejsca
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Autopilot aktywny</Label>
              <p className="text-sm text-muted-foreground">Włącz/wyłącz wszystkie automatyzacje</p>
            </div>
            <Switch
              checked={autopilot.isActive}
              onCheckedChange={(v) => saveAutopilot({ isActive: v })}
              disabled={autopilotLoading}
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Godziny ciszy — od</Label>
              <Input
                type="time"
                value={autopilot.quietHoursStart}
                onChange={(e) => saveAutopilot({ quietHoursStart: e.target.value })}
                disabled={autopilotLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Godziny ciszy — do</Label>
              <Input
                type="time"
                value={autopilot.quietHoursEnd}
                onChange={(e) => saveAutopilot({ quietHoursEnd: e.target.value })}
                disabled={autopilotLoading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max wiadomości na klienta (co ile dni)</Label>
            <Select
              value={String(autopilot.maxMessagesPerClientDays)}
              onValueChange={(v) => saveAutopilot({ maxMessagesPerClientDays: Number(v) })}
              disabled={autopilotLoading}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Co 3 dni</SelectItem>
                <SelectItem value="5">Co 5 dni</SelectItem>
                <SelectItem value="7">Co 7 dni (domyślnie)</SelectItem>
                <SelectItem value="14">Co 14 dni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Sugestie AI</Label>
              <p className="text-sm text-muted-foreground">AI podpowiada akcje (np. reaktywacja klienta)</p>
            </div>
            <Switch
              checked={autopilot.aiSuggestionsEnabled}
              onCheckedChange={(v) => saveAutopilot({ aiSuggestionsEnabled: v })}
              disabled={autopilotLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sekcja 2: Domyślne ustawienia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Domyślne ustawienia
          </CardTitle>
          <CardDescription>
            Wartości domyślne dla nowych usług i ustawień
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Domyślna stawka VAT</Label>
              <Select
                value={String(localSettings.defaultVatRate)}
                onValueChange={(v) => updateLocal("defaultVatRate", Number(v))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0% (zwolniony)</SelectItem>
                  <SelectItem value="8">8%</SelectItem>
                  <SelectItem value="23">23% (domyślnie)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Strefa czasowa</Label>
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

      {/* Sekcja 3: RODO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            RODO i prywatność
          </CardTitle>
          <CardDescription>
            Konfiguracja zgód marketingowych i retencji danych
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Tekst zgody marketingowej</Label>
            <Textarea
              value={localSettings.gdprConsentText}
              onChange={(e) => updateLocal("gdprConsentText", e.target.value)}
              rows={3}
              placeholder="Wyrażam zgodę na przetwarzanie moich danych osobowych..."
            />
            <p className="text-xs text-muted-foreground">
              Wyświetlany klientom przy rejestracji i rezerwacji
            </p>
          </div>

          <div className="space-y-2">
            <Label>Okres przechowywania danych klientów</Label>
            <Select
              value={String(localSettings.dataRetentionYears)}
              onValueChange={(v) => updateLocal("dataRetentionYears", Number(v))}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 rok</SelectItem>
                <SelectItem value="2">2 lata</SelectItem>
                <SelectItem value="3">3 lata (domyślnie)</SelectItem>
                <SelectItem value="5">5 lat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasChanges && (
            <Button onClick={handleSaveDefaults} disabled={isSaving} className="gap-2">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Zapisz ustawienia
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sekcja 4: Status modułów */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Status modułów
          </CardTitle>
          <CardDescription>
            Sprawdź, które moduły wymagają konfiguracji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {moduleStatuses.map((mod) => (
              <div
                key={mod.key}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${mod.configured ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'}`}>
                    {mod.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{mod.label}</p>
                    <Badge variant={mod.configured ? "default" : "secondary"} className="text-xs mt-0.5">
                      {mod.configured ? (
                        <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Skonfigurowany</span>
                      ) : (
                        <span className="flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Wymaga konfiguracji</span>
                      )}
                    </Badge>
                  </div>
                </div>
                {onNavigateToModule && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigateToModule(mod.targetTab)}
                    className="text-xs"
                  >
                    Przejdź
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
