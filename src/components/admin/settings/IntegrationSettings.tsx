import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
