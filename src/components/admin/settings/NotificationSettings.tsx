import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    { key: "{imie}", desc: t("settingsModule.varClientName") },
    { key: "{nazwisko}", desc: t("settingsModule.varClientSurname") },
    { key: "{nazwa_salonu}", desc: t("settingsModule.varSalonName") },
    { key: "{data}", desc: t("settingsModule.varDate") },
    { key: "{godzina}", desc: t("settingsModule.varTime") },
    { key: "{usluga}", desc: t("settingsModule.varService") },
    { key: "{specjalista}", desc: t("settingsModule.varSpecialist") },
    { key: "{adres}", desc: t("settingsModule.varAddress") },
    { key: "{telefon}", desc: t("settingsModule.varPhone") },
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
            {t("settingsModule.emailTab")}
          </TabsTrigger>
          <TabsTrigger value="sms" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            {t("settingsModule.smsTab")}
          </TabsTrigger>
        </TabsList>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    {t("settingsModule.bookingConfirmation")}
                  </CardTitle>
                  <CardDescription>
                    {t("settingsModule.bookingConfirmationDesc")}
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
                  <Label>{t("settingsModule.messageContent")}</Label>
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

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t("settingsModule.visitReminder")}
                  </CardTitle>
                  <CardDescription>
                    {t("settingsModule.visitReminderDesc")}
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
                  <Label>{t("settingsModule.sendReminderBefore")}</Label>
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
                      <SelectItem value="2">2 {t("settingsModule.hoursBefore2")}</SelectItem>
                      <SelectItem value="4">4 {t("settingsModule.hoursBefore2")}</SelectItem>
                      <SelectItem value="12">12 {t("settingsModule.hoursBefore12")}</SelectItem>
                      <SelectItem value="24">24 {t("settingsModule.hoursBeforeDay")}</SelectItem>
                      <SelectItem value="48">48 {t("settingsModule.hoursBefore12")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("settingsModule.messageContent")}</Label>
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
          <Card className={smsapiConfig.enabled ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20" : "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20"}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    {t("settingsModule.smsapiIntegration")}
                    {smsapiConfig.enabled && smsapiConfig.apiKey && (
                      <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {t("settingsModule.smsapiActive")}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t("settingsModule.smsapiDescription")}
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
                    <strong>{t("settingsModule.byopSms")}</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <a 
                      href="https://www.smsapi.pl/rejestracja" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      {t("settingsModule.createSmsapiAccount")} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t("settingsModule.apiKeyOAuth")}</Label>
                    <Input
                      type="password"
                      value={smsapiConfig.apiKey}
                      onChange={(e) => setSmsapiConfig({ ...smsapiConfig, apiKey: e.target.value })}
                      placeholder={t("settingsModule.apiKeyPlaceholder")}
                    />
                    <p className="text-xs text-muted-foreground">
                      {t("settingsModule.apiKeyHint")}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("settingsModule.senderName")}</Label>
                    <Input
                      value={smsapiConfig.senderName}
                      onChange={(e) => setSmsapiConfig({ ...smsapiConfig, senderName: e.target.value.substring(0, 11) })}
                      placeholder={t("settingsModule.senderNamePlaceholder")}
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground">
                      {smsapiConfig.senderName.length}/11 {t("settingsModule.senderNameHint")}
                    </p>
                  </div>
                  <Button 
                    onClick={handleSaveSmsapi} 
                    disabled={isSaving}
                    variant="outline"
                    className="w-full"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {t("settingsModule.saveSmsapiConfig")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {(!smsapiConfig.enabled || !smsapiConfig.apiKey) && (
            <Card className="border-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  {t("settingsModule.enableSmsapiFirst")}
                </p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    {t("settingsModule.smsConfirmation")}
                  </CardTitle>
                  <CardDescription>
                    {t("settingsModule.smsConfirmationDesc")}
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
                  <Label>{t("settingsModule.smsContent")}</Label>
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
                    {formData.confirmationSmsTemplate.length}/160 {t("settingsModule.characters")}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary" />
                    {t("settingsModule.smsReminder")}
                  </CardTitle>
                  <CardDescription>
                    {t("settingsModule.smsReminderDesc")}
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
                  <Label>{t("settingsModule.sendReminderBefore")}</Label>
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
                      <SelectItem value="1">1 {t("settingsModule.hourBefore")}</SelectItem>
                      <SelectItem value="2">2 {t("settingsModule.hoursBefore2")}</SelectItem>
                      <SelectItem value="4">4 {t("settingsModule.hoursBefore2")}</SelectItem>
                      <SelectItem value="24">24 {t("settingsModule.hoursBefore2")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("settingsModule.smsContent")}</Label>
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
                    {formData.reminderSmsTemplate.length}/160 {t("settingsModule.characters")}
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
          <CardTitle className="text-sm">{t("settingsModule.availableVariables")}</CardTitle>
          <CardDescription>
            {t("settingsModule.useVariablesHint")}
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
          {isSaving ? t("settingsModule.saving") : t("settingsModule.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
