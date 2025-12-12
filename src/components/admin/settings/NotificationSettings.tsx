import { useState, useEffect } from "react";
import { Mail, MessageSquare, Bell, Save, Loader2, Key, ExternalLink, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationSettings as NotificationSettingsType, IntegrationSettings } from "@/hooks/useSalonSettings";
import { Badge } from "@/components/ui/badge";

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  integrationSettings?: IntegrationSettings;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<NotificationSettingsType>) => Promise<boolean>;
  onSaveIntegration?: (updates: Partial<IntegrationSettings>) => Promise<boolean>;
}

export function NotificationSettings({ 
  settings, 
  integrationSettings,
  isLoading, 
  isSaving, 
  onSave,
  onSaveIntegration 
}: NotificationSettingsProps) {
  const [formData, setFormData] = useState<NotificationSettingsType>(settings);
  const [smsapiConfig, setSmsapiConfig] = useState({
    enabled: integrationSettings?.smsapi?.enabled || false,
    apiKey: integrationSettings?.smsapi?.apiKey || "",
    senderName: integrationSettings?.smsapi?.senderName || "",
  });

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    if (integrationSettings?.smsapi) {
      setSmsapiConfig({
        enabled: integrationSettings.smsapi.enabled,
        apiKey: integrationSettings.smsapi.apiKey,
        senderName: integrationSettings.smsapi.senderName,
      });
    }
  }, [integrationSettings]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const handleSaveSmsapi = async () => {
    if (onSaveIntegration) {
      await onSaveIntegration({ smsapi: smsapiConfig });
    }
  };

  const templateVariables = [
    { key: "{imie}", desc: "Imię klienta" },
    { key: "{nazwisko}", desc: "Nazwisko klienta" },
    { key: "{nazwa_salonu}", desc: "Nazwa salonu" },
    { key: "{data}", desc: "Data wizyty" },
    { key: "{godzina}", desc: "Godzina wizyty" },
    { key: "{usluga}", desc: "Nazwa usługi" },
    { key: "{specjalista}", desc: "Imię specjalisty" },
    { key: "{adres}", desc: "Adres salonu" },
    { key: "{telefon}", desc: "Telefon salonu" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            SMS
          </TabsTrigger>
        </TabsList>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6 mt-6">
          {/* Email Confirmation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Potwierdzenie rezerwacji
                  </CardTitle>
                  <CardDescription>
                    Email wysyłany po dokonaniu rezerwacji
                  </CardDescription>
                </div>
                <Switch
                  checked={formData.emailConfirmationEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, emailConfirmationEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.emailConfirmationEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Treść wiadomości</Label>
                  <Textarea
                    value={formData.confirmationEmailTemplate}
                    onChange={(e) => 
                      setFormData({ ...formData, confirmationEmailTemplate: e.target.value })
                    }
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            )}
          </Card>

          {/* Email Reminder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Przypomnienie o wizycie
                  </CardTitle>
                  <CardDescription>
                    Email przypominający o nadchodzącej wizycie
                  </CardDescription>
                </div>
                <Switch
                  checked={formData.emailReminderEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, emailReminderEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.emailReminderEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Wyślij przypomnienie przed wizytą</Label>
                  <Select
                    value={formData.emailReminderHoursBefore.toString()}
                    onValueChange={(v) => 
                      setFormData({ ...formData, emailReminderHoursBefore: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 godziny przed</SelectItem>
                      <SelectItem value="4">4 godziny przed</SelectItem>
                      <SelectItem value="12">12 godzin przed</SelectItem>
                      <SelectItem value="24">24 godziny przed (dzień wcześniej)</SelectItem>
                      <SelectItem value="48">48 godzin przed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Treść wiadomości</Label>
                  <Textarea
                    value={formData.reminderEmailTemplate}
                    onChange={(e) => 
                      setFormData({ ...formData, reminderEmailTemplate: e.target.value })
                    }
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* SMS Settings */}
        <TabsContent value="sms" className="space-y-6 mt-6">
          {/* SMSAPI.pl Configuration Card */}
          <Card className={smsapiConfig.enabled ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Integracja SMSAPI.pl
                    {smsapiConfig.enabled && smsapiConfig.apiKey && (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Aktywna
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Wpisz swój własny API Key z SMSAPI.pl - płacisz bezpośrednio do SMSAPI
                  </CardDescription>
                </div>
                <Switch
                  checked={smsapiConfig.enabled}
                  onCheckedChange={(checked) => 
                    setSmsapiConfig({ ...smsapiConfig, enabled: checked })
                  }
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!smsapiConfig.enabled ? (
                <div className="space-y-3">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>BYOP SMS (Bring Your Own Provider)</strong> - używasz własnego konta SMSAPI.pl i sam płacisz za SMS-y.
                  </p>
                  <div className="flex items-center gap-2">
                    <a 
                      href="https://www.smsapi.pl/rejestracja" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Załóż konto SMSAPI.pl <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>API Key (OAuth Token)</Label>
                    <Input
                      type="password"
                      value={smsapiConfig.apiKey}
                      onChange={(e) => setSmsapiConfig({ ...smsapiConfig, apiKey: e.target.value })}
                      placeholder="Wklej swój API Key z SMSAPI.pl"
                    />
                    <p className="text-xs text-muted-foreground">
                      Znajdziesz go w panelu SMSAPI → API → Tokeny OAuth
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Nazwa nadawcy (max 11 znaków)</Label>
                    <Input
                      value={smsapiConfig.senderName}
                      onChange={(e) => setSmsapiConfig({ ...smsapiConfig, senderName: e.target.value.substring(0, 11) })}
                      placeholder="np. BeautySalon"
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">
                      {smsapiConfig.senderName.length}/11 znaków • Musi być zarejestrowana w SMSAPI
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveSmsapi} 
                    disabled={isSaving}
                    variant="outline"
                    className="w-full"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Zapisz konfigurację SMSAPI
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SMS disabled warning if SMSAPI not configured */}
          {(!smsapiConfig.enabled || !smsapiConfig.apiKey) && (
            <Card className="border-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Włącz i skonfiguruj SMSAPI.pl powyżej, aby aktywować powiadomienia SMS.
                </p>
              </CardContent>
            </Card>
          )}

          {/* SMS Confirmation */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Potwierdzenie SMS
                  </CardTitle>
                  <CardDescription>
                    SMS wysyłany po dokonaniu rezerwacji
                  </CardDescription>
                </div>
                <Switch
                  checked={formData.smsConfirmationEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, smsConfirmationEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.smsConfirmationEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Treść SMS (max 160 znaków)</Label>
                  <Textarea
                    value={formData.confirmationSmsTemplate}
                    onChange={(e) => 
                      setFormData({ ...formData, confirmationSmsTemplate: e.target.value })
                    }
                    rows={3}
                    maxLength={160}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.confirmationSmsTemplate.length}/160 znaków
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* SMS Reminder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    Przypomnienie SMS
                  </CardTitle>
                  <CardDescription>
                    SMS przypominający o nadchodzącej wizycie
                  </CardDescription>
                </div>
                <Switch
                  checked={formData.smsReminderEnabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, smsReminderEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {formData.smsReminderEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Wyślij przypomnienie przed wizytą</Label>
                  <Select
                    value={formData.smsReminderHoursBefore.toString()}
                    onValueChange={(v) => 
                      setFormData({ ...formData, smsReminderHoursBefore: parseInt(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 godzinę przed</SelectItem>
                      <SelectItem value="2">2 godziny przed</SelectItem>
                      <SelectItem value="4">4 godziny przed</SelectItem>
                      <SelectItem value="24">24 godziny przed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Treść SMS (max 160 znaków)</Label>
                  <Textarea
                    value={formData.reminderSmsTemplate}
                    onChange={(e) => 
                      setFormData({ ...formData, reminderSmsTemplate: e.target.value })
                    }
                    rows={3}
                    maxLength={160}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {formData.reminderSmsTemplate.length}/160 znaków
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Variables Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Dostępne zmienne</CardTitle>
          <CardDescription>
            Użyj tych zmiennych w szablonach wiadomości
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {templateVariables.map((v) => (
              <div key={v.key} className="flex items-center gap-2 text-sm">
                <code className="px-1.5 py-0.5 rounded bg-muted text-xs font-mono">
                  {v.key}
                </code>
                <span className="text-muted-foreground">{v.desc}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );
}
