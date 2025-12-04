import { useState } from "react";
import { Mail, MessageSquare, Bell, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { NotificationSettings as NotificationSettingsType } from "./types";

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettingsType>({
    emailConfirmationEnabled: true,
    emailReminderEnabled: true,
    emailReminderHoursBefore: 24,
    smsConfirmationEnabled: false,
    smsReminderEnabled: false,
    smsReminderHoursBefore: 2,
    confirmationEmailTemplate: `Cześć {imie}!

Twoja wizyta w {nazwa_salonu} została potwierdzona.

📅 Data: {data}
🕐 Godzina: {godzina}
💇 Usługa: {usluga}
👤 Specjalista: {specjalista}

Adres: {adres}

Do zobaczenia!
{nazwa_salonu}`,
    reminderEmailTemplate: `Cześć {imie}!

Przypominamy o Twojej wizycie jutro w {nazwa_salonu}.

📅 Data: {data}
🕐 Godzina: {godzina}
💇 Usługa: {usluga}

Jeśli chcesz zmienić termin, skontaktuj się z nami: {telefon}

Do zobaczenia!`,
    confirmationSmsTemplate: `{nazwa_salonu}: Wizyta potwierdzona na {data} o {godzina}. Usługa: {usluga}. Do zobaczenia!`,
    reminderSmsTemplate: `{nazwa_salonu}: Przypomnienie - jutro o {godzina} masz wizytę ({usluga}). Odwołaj: {telefon}`,
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Zapisano",
      description: "Ustawienia powiadomień zostały zaktualizowane.",
    });
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
                  checked={settings.emailConfirmationEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, emailConfirmationEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {settings.emailConfirmationEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Treść wiadomości</Label>
                  <Textarea
                    value={settings.confirmationEmailTemplate}
                    onChange={(e) => 
                      setSettings({ ...settings, confirmationEmailTemplate: e.target.value })
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
                  checked={settings.emailReminderEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, emailReminderEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {settings.emailReminderEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Wyślij przypomnienie przed wizytą</Label>
                  <Select
                    value={settings.emailReminderHoursBefore.toString()}
                    onValueChange={(v) => 
                      setSettings({ ...settings, emailReminderHoursBefore: parseInt(v) })
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
                    value={settings.reminderEmailTemplate}
                    onChange={(e) => 
                      setSettings({ ...settings, reminderEmailTemplate: e.target.value })
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
          <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
            <CardContent className="pt-6">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Uwaga:</strong> Powiadomienia SMS wymagają integracji z GoHighLevel. 
                Skonfiguruj integrację w zakładce "Integracje", aby włączyć wysyłkę SMS.
              </p>
            </CardContent>
          </Card>

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
                  checked={settings.smsConfirmationEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, smsConfirmationEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {settings.smsConfirmationEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Treść SMS (max 160 znaków)</Label>
                  <Textarea
                    value={settings.confirmationSmsTemplate}
                    onChange={(e) => 
                      setSettings({ ...settings, confirmationSmsTemplate: e.target.value })
                    }
                    rows={3}
                    maxLength={160}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {settings.confirmationSmsTemplate.length}/160 znaków
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
                  checked={settings.smsReminderEnabled}
                  onCheckedChange={(checked) => 
                    setSettings({ ...settings, smsReminderEnabled: checked })
                  }
                />
              </div>
            </CardHeader>
            {settings.smsReminderEnabled && (
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Wyślij przypomnienie przed wizytą</Label>
                  <Select
                    value={settings.smsReminderHoursBefore.toString()}
                    onValueChange={(v) => 
                      setSettings({ ...settings, smsReminderHoursBefore: parseInt(v) })
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
                    value={settings.reminderSmsTemplate}
                    onChange={(e) => 
                      setSettings({ ...settings, reminderSmsTemplate: e.target.value })
                    }
                    rows={3}
                    maxLength={160}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {settings.reminderSmsTemplate.length}/160 znaków
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
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
        </Button>
      </div>
    </div>
  );
}
