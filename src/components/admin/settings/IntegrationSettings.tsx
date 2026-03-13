import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Check, X, ExternalLink, Save, Eye, EyeOff, Loader2, CreditCard, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IntegrationSettings as IntegrationSettingsType } from "@/hooks/useSalonSettings";

interface IntegrationSettingsProps {
  settings: IntegrationSettingsType;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<IntegrationSettingsType>) => Promise<boolean>;
}

export function IntegrationSettings({ settings, isLoading, isSaving, onSave }: IntegrationSettingsProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<IntegrationSettingsType>(settings);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showP24ApiKey, setShowP24ApiKey] = useState(false);
  const [showP24CrcKey, setShowP24CrcKey] = useState(false);
  const [showSmsApiKey, setShowSmsApiKey] = useState(false);
  const [showWhatsAppApiKey, setShowWhatsAppApiKey] = useState(false);

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
      {/* SMSAPI */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  SMSAPI
                  {formData.smsapi?.enabled && formData.smsapi?.apiKey ? (
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
                  Wysyłka SMS do klientek — model BYOP (płacisz bezpośrednio do SMSAPI)
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Włącz wysyłkę SMS</Label>
              <p className="text-xs text-muted-foreground">
                Umożliwia wysyłanie wiadomości SMS z zakładki Konwersacje
              </p>
            </div>
            <Switch
              checked={formData.smsapi?.enabled || false}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  smsapi: { ...formData.smsapi, enabled: checked },
                })
              }
            />
          </div>

          {formData.smsapi?.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="smsapiKey">Klucz API SMSAPI</Label>
                <div className="relative">
                  <Input
                    id="smsapiKey"
                    type={showSmsApiKey ? "text" : "password"}
                    value={formData.smsapi?.apiKey || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        smsapi: { ...formData.smsapi, apiKey: e.target.value },
                      })
                    }
                    placeholder="Wklej token API z panelu SMSAPI"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowSmsApiKey(!showSmsApiKey)}
                  >
                    {showSmsApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smsapiSender">Nazwa nadawcy (Sender Name)</Label>
                <Input
                  id="smsapiSender"
                  value={formData.smsapi?.senderName || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      smsapi: { ...formData.smsapi, senderName: e.target.value },
                    })
                  }
                  placeholder="np. MojSalon"
                  maxLength={11}
                />
                <p className="text-xs text-muted-foreground">
                  Maks. 11 znaków, bez polskich znaków. Musi być zarejestrowana w SMSAPI.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Jak skonfigurować?</p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 text-xs">
                  <li>Załóż konto na smsapi.pl</li>
                  <li>Wejdź w Ustawienia → API i skopiuj token</li>
                  <li>Zarejestruj nazwę nadawcy w panelu SMSAPI</li>
                  <li>Wklej dane powyżej i zapisz</li>
                </ol>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a href="https://www.smsapi.pl/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Otwórz panel SMSAPI
                </a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Business */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  WhatsApp Business
                  {formData.whatsapp?.enabled && formData.whatsapp?.apiKey ? (
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
                  Wysyłaj wiadomości WhatsApp do klientek przez WhatsApp Business API
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Włącz WhatsApp</Label>
              <p className="text-xs text-muted-foreground">
                Umożliwia wysyłanie wiadomości WhatsApp z zakładki Konwersacje
              </p>
            </div>
            <Switch
              checked={formData.whatsapp?.enabled || false}
              onCheckedChange={(checked) =>
                setFormData({
                  ...formData,
                  whatsapp: { ...(formData.whatsapp || { provider: '', apiKey: '', phoneNumberId: '' }), enabled: checked },
                })
              }
            />
          </div>

          {formData.whatsapp?.enabled && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label>Dostawca API</Label>
                <Select
                  value={formData.whatsapp?.provider || ''}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp!, provider: value as 'twilio' | '360dialog' },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz dostawcę" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twilio">Twilio</SelectItem>
                    <SelectItem value="360dialog">360dialog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappApiKey">Klucz API / Token</Label>
                <div className="relative">
                  <Input
                    id="whatsappApiKey"
                    type={showWhatsAppApiKey ? "text" : "password"}
                    value={formData.whatsapp?.apiKey || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        whatsapp: { ...formData.whatsapp!, apiKey: e.target.value },
                      })
                    }
                    placeholder="Wklej klucz API dostawcy"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowWhatsAppApiKey(!showWhatsAppApiKey)}
                  >
                    {showWhatsAppApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappPhoneId">Phone Number ID</Label>
                <Input
                  id="whatsappPhoneId"
                  value={formData.whatsapp?.phoneNumberId || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      whatsapp: { ...formData.whatsapp!, phoneNumberId: e.target.value },
                    })
                  }
                  placeholder="np. 1234567890"
                />
              </div>

              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <p className="font-medium mb-1">Jak skonfigurować?</p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 text-xs">
                  <li>Wybierz dostawcę WhatsApp Business API (Twilio lub 360dialog)</li>
                  <li>Utwórz konto i zarejestruj numer telefonu</li>
                  <li>Skopiuj klucz API i Phone Number ID</li>
                  <li>Wklej dane powyżej i zapisz</li>
                </ol>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
                  {t("settingsModule.przelewy24")}
                  {formData.przelewy24?.enabled && formData.przelewy24?.merchantId ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      {t("settingsModule.configured")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="w-3 h-3 mr-1" />
                      {t("settingsModule.notConfigured")}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {t("settingsModule.p24Description")}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>{t("settingsModule.enableP24")}</Label>
              <p className="text-xs text-muted-foreground">
                {t("settingsModule.enableP24Desc")}
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
                  <Label htmlFor="p24MerchantId">{t("settingsModule.merchantId")}</Label>
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
                  <Label htmlFor="p24PosId">{t("settingsModule.posId")}</Label>
                  <Input
                    id="p24PosId"
                    value={formData.przelewy24?.posId || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        przelewy24: { ...formData.przelewy24, posId: e.target.value },
                      })
                    }
                    placeholder={t("settingsModule.posIdPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="p24ApiKey">{t("settingsModule.apiKey")}</Label>
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
                    placeholder={t("settingsModule.apiKeyP24Placeholder")}
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
                <Label htmlFor="p24CrcKey">{t("settingsModule.crcKey")}</Label>
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
                    placeholder={t("settingsModule.crcKeyPlaceholder")}
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
                  <Label>{t("settingsModule.sandboxMode")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settingsModule.sandboxDesc")}
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
                <p className="font-medium mb-1">{t("settingsModule.supportedPaymentMethods")}</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-xs">
                  <li>{t("settingsModule.p24Blik")}</li>
                  <li>{t("settingsModule.p24Transfers")}</li>
                  <li>{t("settingsModule.p24Cards")}</li>
                  <li>{t("settingsModule.p24Wallets")}</li>
                </ul>
              </div>

              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://developers.przelewy24.pl/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t("settingsModule.p24Docs")}
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
                  {t("settingsModule.googleCalendar")}
                  {formData.googleCalendar.enabled ? (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      <Check className="w-3 h-3 mr-1" />
                      {t("settingsModule.connected")}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <X className="w-3 h-3 mr-1" />
                      {t("settingsModule.notConnected")}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {t("settingsModule.gcalDescription")}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!formData.googleCalendar.enabled ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("settingsModule.gcalConnectDesc")}
              </p>
              <Button onClick={handleGoogleConnect} variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                {t("settingsModule.connectGcal")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{t("settingsModule.syncToGoogle")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settingsModule.syncToGoogleDesc")}
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
                  <Label>{t("settingsModule.blockFromGoogle")}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t("settingsModule.blockFromGoogleDesc")}
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
                {t("settingsModule.disconnectGcal")}
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
          {isSaving ? t("settingsModule.saving") : t("settingsModule.saveChanges")}
        </Button>
      </div>
    </div>
  );
}
