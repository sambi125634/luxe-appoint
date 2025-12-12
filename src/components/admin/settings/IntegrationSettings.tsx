import { useState, useEffect } from "react";
import { Calendar, Zap, Check, X, ExternalLink, Save, Eye, EyeOff, Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IntegrationSettings as IntegrationSettingsType } from "@/hooks/useSalonSettings";

interface IntegrationSettingsProps {
  settings: IntegrationSettingsType;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<IntegrationSettingsType>) => Promise<boolean>;
}

export function IntegrationSettings({ settings, isLoading, isSaving, onSave }: IntegrationSettingsProps) {
  const [formData, setFormData] = useState<IntegrationSettingsType>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showP24ApiKey, setShowP24ApiKey] = useState(false);
  const [showP24CrcKey, setShowP24CrcKey] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const handleGoogleConnect = () => {
    // TODO: Implement OAuth flow
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Przelewy24 */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Przelewy24
                  {formData.przelewy24?.enabled && formData.przelewy24?.merchantId ? (
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
                  Płatności online - BLIK, przelewy bankowe, karty
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Włącz płatności Przelewy24</Label>
              <p className="text-xs text-muted-foreground">
                Umożliw klientom płatność zaliczki przy rezerwacji
              </p>
            </div>
            <Switch
              checked={formData.przelewy24?.enabled || false}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  przelewy24: { ...formData.przelewy24, enabled: checked },
                })
              }
            />
          </div>

          {formData.przelewy24?.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="p24MerchantId">Merchant ID</Label>
                  <Input
                    id="p24MerchantId"
                    value={formData.przelewy24?.merchantId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        przelewy24: { ...formData.przelewy24, merchantId: e.target.value },
                      })
                    }
                    placeholder="123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p24PosId">POS ID (opcjonalne)</Label>
                  <Input
                    id="p24PosId"
                    value={formData.przelewy24?.posId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        przelewy24: { ...formData.przelewy24, posId: e.target.value },
                      })
                    }
                    placeholder="Zostaw puste = Merchant ID"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p24ApiKey">Klucz API</Label>
                <div className="relative">
                  <Input
                    id="p24ApiKey"
                    type={showP24ApiKey ? "text" : "password"}
                    value={formData.przelewy24?.apiKey || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        przelewy24: { ...formData.przelewy24, apiKey: e.target.value },
                      })
                    }
                    placeholder="Twój klucz API z panelu P24"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowP24ApiKey(!showP24ApiKey)}
                  >
                    {showP24ApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p24CrcKey">Klucz CRC</Label>
                <div className="relative">
                  <Input
                    id="p24CrcKey"
                    type={showP24CrcKey ? "text" : "password"}
                    value={formData.przelewy24?.crcKey || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        przelewy24: { ...formData.przelewy24, crcKey: e.target.value },
                      })
                    }
                    placeholder="Klucz CRC do weryfikacji transakcji"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowP24CrcKey(!showP24CrcKey)}
                  >
                    {showP24CrcKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tryb testowy (Sandbox)</Label>
                  <p className="text-xs text-muted-foreground">
                    Używaj środowiska testowego bez prawdziwych płatności
                  </p>
                </div>
                <Switch
                  checked={formData.przelewy24?.sandbox ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      przelewy24: { ...formData.przelewy24, sandbox: checked },
                    })
                  }
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Obsługiwane metody płatności:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                  <li>BLIK - najszybsza płatność mobilna</li>
                  <li>Przelewy bankowe - wszystkie polskie banki</li>
                  <li>Karty płatnicze - Visa, Mastercard</li>
                  <li>Google Pay, Apple Pay</li>
                </ul>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://developers.przelewy24.pl/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Dokumentacja Przelewy24
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

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
                  {formData.googleCalendar.enabled ? (
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
          {!formData.googleCalendar.enabled ? (
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
                  checked={formData.googleCalendar.syncToGoogle}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      googleCalendar: { ...formData.googleCalendar, syncToGoogle: checked },
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
                  checked={formData.googleCalendar.blockFromGoogle}
                  onCheckedChange={(checked) =>
                    setFormData({
                      ...formData,
                      googleCalendar: { ...formData.googleCalendar, blockFromGoogle: checked },
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
                  {formData.ghl.enabled && formData.ghl.apiKey ? (
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
              checked={formData.ghl.enabled}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  ghl: { ...formData.ghl, enabled: checked },
                })
              }
            />
          </div>

          {formData.ghl.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="ghlApiKey">Klucz API</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="ghlApiKey"
                      type={showApiKey ? "text" : "password"}
                      value={formData.ghl.apiKey}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          ghl: { ...formData.ghl, apiKey: e.target.value },
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
                  value={formData.ghl.locationId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      ghl: { ...formData.ghl, locationId: e.target.value },
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
                    value={formData.ghl.pipelineId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ghl: { ...formData.ghl, pipelineId: e.target.value },
                      })
                    }
                    placeholder="ID pipeline"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ghlStageId">Domyślny Stage ID</Label>
                  <Input
                    id="ghlStageId"
                    value={formData.ghl.defaultStageId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        ghl: { ...formData.ghl, defaultStageId: e.target.value },
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
