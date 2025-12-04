import { useState } from "react";
import { Calendar, Zap, Check, X, ExternalLink, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { IntegrationSettings as IntegrationSettingsType } from "./types";

export function IntegrationSettings() {
  const [settings, setSettings] = useState<IntegrationSettingsType>({
    googleCalendar: {
      enabled: false,
      syncToGoogle: true,
      blockFromGoogle: true,
    },
    ghl: {
      enabled: false,
      apiKey: "",
      locationId: "",
      pipelineId: "",
      defaultStageId: "",
    },
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Zapisano",
      description: "Ustawienia integracji zostały zaktualizowane.",
    });
  };

  const handleGoogleConnect = () => {
    toast({
      title: "Łączenie z Google Calendar",
      description: "Ta funkcja wymaga konfiguracji OAuth. Wkrótce dostępna.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Google Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Google Calendar
                  {settings.googleCalendar.enabled ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Połączony
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="w-3 h-3 mr-1" />
                      Niepołączony
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Synchronizuj wizyty z kalendarzem Google pracowników
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!settings.googleCalendar.enabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Połącz Google Calendar, aby automatycznie synchronizować wizyty z kalendarzami Twoich pracowników.
                Każdy pracownik może połączyć swój własny kalendarz Google.
              </p>
              <Button onClick={handleGoogleConnect} variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Połącz Google Calendar
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Synchronizuj do Google</Label>
                  <p className="text-xs text-muted-foreground">
                    Wizyty z Beauty Calendar będą dodawane do Google Calendar
                  </p>
                </div>
                <Switch
                  checked={settings.googleCalendar.syncToGoogle}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      googleCalendar: { ...settings.googleCalendar, syncToGoogle: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Blokuj terminy z Google</Label>
                  <p className="text-xs text-muted-foreground">
                    Wydarzenia z Google Calendar będą blokować dostępność w Beauty Calendar
                  </p>
                </div>
                <Switch
                  checked={settings.googleCalendar.blockFromGoogle}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      googleCalendar: { ...settings.googleCalendar, blockFromGoogle: checked },
                    })
                  }
                />
              </div>

              <Button variant="destructive" size="sm" className="mt-4">
                Rozłącz Google Calendar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GoHighLevel */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  GoHighLevel (GHL)
                  {settings.ghl.enabled && settings.ghl.apiKey ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      Skonfigurowany
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="w-3 h-3 mr-1" />
                      Nieskonfigurowany
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Automatyzacja marketingowa i CRM
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Włącz integrację GHL</Label>
              <p className="text-xs text-muted-foreground">
                Synchronizuj rezerwacje do pipeline GHL
              </p>
            </div>
            <Switch
              checked={settings.ghl.enabled}
              onCheckedChange={(checked) =>
                setSettings({
                  ...settings,
                  ghl: { ...settings.ghl, enabled: checked },
                })
              }
            />
          </div>

          {settings.ghl.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="ghlApiKey">Klucz API</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="ghlApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={settings.ghl.apiKey}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          ghl: { ...settings.ghl, apiKey: e.target.value },
                        })
                      }
                      placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Znajdziesz w GHL: Settings → Integrations → API Key
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ghlLocationId">Location ID</Label>
                <Input
                  id="ghlLocationId"
                  value={settings.ghl.locationId}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      ghl: { ...settings.ghl, locationId: e.target.value },
                    })
                  }
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ghlPipelineId">Pipeline ID</Label>
                  <Input
                    id="ghlPipelineId"
                    value={settings.ghl.pipelineId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ghl: { ...settings.ghl, pipelineId: e.target.value },
                      })
                    }
                    placeholder="ID pipeline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ghlStageId">Domyślny Stage ID</Label>
                  <Input
                    id="ghlStageId"
                    value={settings.ghl.defaultStageId}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        ghl: { ...settings.ghl, defaultStageId: e.target.value },
                      })
                    }
                    placeholder="ID stage (Zarezerwowane)"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Jak to działa?</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                  <li>Po rezerwacji klient zostanie dodany do GHL jako kontakt</li>
                  <li>Rezerwacja trafi do wybranego pipeline i stage</li>
                  <li>Możesz uruchomić automatyzacje SMS/email z poziomu GHL</li>
                </ul>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://help.gohighlevel.com/support/solutions/articles/48001060529-api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Dokumentacja GHL API
                </a>
              </Button>
            </div>
          )}
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
