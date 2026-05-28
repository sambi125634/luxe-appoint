import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Building2, MapPin, Phone, Mail, Palette, Upload, Save, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalonProfile } from "@/hooks/useSalonSettings";

interface SalonProfileSettingsProps {
  profile: SalonProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  onSave: (updates: Partial<SalonProfile>) => Promise<boolean>;
  isDemo?: boolean;
}

export function SalonProfileSettings({ profile, isLoading, isSaving, onSave, isDemo = false }: SalonProfileSettingsProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<SalonProfile>>({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    logoUrl: "",
    themePrimaryColor: "#7c3aed",
    themeSecondaryColor: "#a78bfa",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        description: profile.description || "",
        address: profile.address || "",
        city: profile.city || "",
        phone: profile.phone || "",
        email: profile.email || "",
        logoUrl: profile.logoUrl || "",
        themePrimaryColor: profile.themePrimaryColor || "#7c3aed",
        themeSecondaryColor: profile.themeSecondaryColor || "#a78bfa",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    await onSave(formData);
  };

  const handleLogoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (isDemo) {
      toast.error("Wgrywanie logo jest dostępne po założeniu konta.");
      return;
    }
    if (!profile?.id) {
      toast.error("Brak identyfikatora salonu. Odśwież stronę i spróbuj ponownie.");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Wybierz plik graficzny (PNG, JPG lub SVG).");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Plik jest zbyt duży. Maksymalny rozmiar to 2 MB.");
      return;
    }

    try {
      setUploading(true);
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const path = `logos/${profile.id}-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("salon-media")
        .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
      if (uploadError) throw uploadError;
      const { data: publicData } = supabase.storage.from("salon-media").getPublicUrl(path);
      const logoUrl = publicData.publicUrl;
      setFormData((prev) => ({ ...prev, logoUrl }));
      const ok = await onSave({ logoUrl });
      if (ok) toast.success("Logo zostało wgrane.");
    } catch (err) {
      console.error("[SalonProfileSettings] logo upload error", err);
      toast.error("Nie udało się wgrać logo. Spróbuj ponownie.");
    } finally {
      setUploading(false);
    }
  };

  const handleLogoRemove = async () => {
    setFormData((prev) => ({ ...prev, logoUrl: "" }));
    if (!isDemo) await onSave({ logoUrl: null });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>{t("settingsModule.salonNotFound")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            {t("settingsModule.salonInfo")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.salonInfoDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">{t("settingsModule.salonName")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("settingsModule.salonNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">{t("settingsModule.city")}</Label>
              <Input
                id="city"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={t("settingsModule.cityPlaceholder")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="address">{t("settingsModule.address")}</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="pl-10"
                placeholder={t("settingsModule.addressPlaceholder")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("settingsModule.salonDescription")}</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t("settingsModule.salonDescriptionPlaceholder")}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            {t("settingsModule.contactInfo")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.contactInfoDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">{t("settingsModule.phone")}</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="pl-10"
                  placeholder={t("settingsModule.phonePlaceholder")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("settingsModule.email")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  placeholder={t("settingsModule.emailPlaceholder")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            {t("settingsModule.brandingAndAppearance")}
          </CardTitle>
          <CardDescription>
            {t("settingsModule.brandingDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("settingsModule.salonLogo")}</Label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || isSaving}
                className="relative w-20 h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/60 flex items-center justify-center bg-muted/50 transition-colors overflow-hidden disabled:opacity-60"
                aria-label="Wgraj logo salonu"
              >
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <Upload className="w-6 h-6 text-muted-foreground" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={handleLogoSelect}
              />
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading || isSaving}
                  >
                    {uploading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {formData.logoUrl ? "Zmień logo" : t("settingsModule.selectFile")}
                  </Button>
                  {formData.logoUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLogoRemove}
                      disabled={uploading || isSaving}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Usuń
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">PNG, JPG, SVG lub WEBP · maks. 2 MB</p>
                {isDemo && (
                  <p className="text-[11px] text-muted-foreground/70 italic">
                    Dostępne po założeniu konta.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">{t("settingsModule.primaryColor")}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.themePrimaryColor}
                  onChange={(e) => setFormData({ ...formData, themePrimaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  id="primaryColor"
                  value={formData.themePrimaryColor}
                  onChange={(e) => setFormData({ ...formData, themePrimaryColor: e.target.value })}
                  placeholder="#7c3aed"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">{t("settingsModule.secondaryColor")}</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={formData.themeSecondaryColor}
                  onChange={(e) => setFormData({ ...formData, themeSecondaryColor: e.target.value })}
                  className="w-12 h-10 p-1 cursor-pointer"
                />
                <Input
                  id="secondaryColor"
                  value={formData.themeSecondaryColor}
                  onChange={(e) => setFormData({ ...formData, themeSecondaryColor: e.target.value })}
                  placeholder="#a78bfa"
                />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ 
            background: `linear-gradient(135deg, ${formData.themePrimaryColor}15, ${formData.themeSecondaryColor}15)` 
          }}>
            <p className="text-sm text-muted-foreground mb-2">{t("settingsModule.colorPreview")}</p>
            <div className="flex gap-2">
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: formData.themePrimaryColor }}
              />
              <div 
                className="w-8 h-8 rounded-full" 
                style={{ backgroundColor: formData.themeSecondaryColor }}
              />
            </div>
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
