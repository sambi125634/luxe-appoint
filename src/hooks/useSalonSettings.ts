import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface SalonProfile {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  logoUrl: string | null;
  themePrimaryColor: string;
  themeSecondaryColor: string;
}

export interface BookingSettings {
  advanceBookingDays: number;
  minAdvanceHours: number;
  cancellationPolicyHours: number;
  allowOnlinePayments: boolean;
  requirePhoneConfirmation: boolean;
  autoConfirmBookings: boolean;
  defaultWorkingHoursStart: string;
  defaultWorkingHoursEnd: string;
  slotInterval: number;
  bufferBetweenAppointments: number;
}

export interface NotificationSettings {
  emailConfirmationEnabled: boolean;
  emailReminderEnabled: boolean;
  emailReminderHoursBefore: number;
  smsConfirmationEnabled: boolean;
  smsReminderEnabled: boolean;
  smsReminderHoursBefore: number;
  confirmationEmailTemplate: string;
  reminderEmailTemplate: string;
  confirmationSmsTemplate: string;
  reminderSmsTemplate: string;
}

export interface IntegrationSettings {
  googleCalendar: {
    enabled: boolean;
    syncToGoogle: boolean;
    blockFromGoogle: boolean;
  };
  ghl: {
    enabled: boolean;
    apiKey: string;
    locationId: string;
    pipelineId: string;
    defaultStageId: string;
  };
  smsapi: {
    enabled: boolean;
    apiKey: string;
    senderName: string;
  };
}

export interface SalonSettings {
  booking: BookingSettings;
  notifications: NotificationSettings;
  integrations: IntegrationSettings;
}

const defaultBookingSettings: BookingSettings = {
  advanceBookingDays: 30,
  minAdvanceHours: 2,
  cancellationPolicyHours: 24,
  allowOnlinePayments: false,
  requirePhoneConfirmation: false,
  autoConfirmBookings: true,
  defaultWorkingHoursStart: "09:00",
  defaultWorkingHoursEnd: "18:00",
  slotInterval: 15,
  bufferBetweenAppointments: 0,
};

const defaultNotificationSettings: NotificationSettings = {
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
};

const defaultIntegrationSettings: IntegrationSettings = {
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
  smsapi: {
    enabled: false,
    apiKey: "",
    senderName: "",
  },
};

export function useSalonSettings() {
  const [profile, setProfile] = useState<SalonProfile | null>(null);
  const [settings, setSettings] = useState<SalonSettings>({
    booking: defaultBookingSettings,
    notifications: defaultNotificationSettings,
    integrations: defaultIntegrationSettings,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSalonData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: salon, error } = await supabase
        .from("salons")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (salon) {
        setProfile({
          id: salon.id,
          name: salon.name,
          description: salon.description,
          address: salon.address,
          city: salon.city,
          phone: salon.phone,
          email: salon.email,
          logoUrl: salon.logo_url,
          themePrimaryColor: salon.theme_primary_color || "#7c3aed",
          themeSecondaryColor: salon.theme_secondary_color || "#a78bfa",
        });

        // Parse settings from JSONB column - cast to unknown first then to our type
        const savedSettings = salon.settings as unknown as SalonSettings | null;
        if (savedSettings && typeof savedSettings === 'object') {
          setSettings({
            booking: { ...defaultBookingSettings, ...(savedSettings.booking || {}) },
            notifications: { ...defaultNotificationSettings, ...(savedSettings.notifications || {}) },
            integrations: { ...defaultIntegrationSettings, ...(savedSettings.integrations || {}) },
          });
        }
      }
    } catch (error) {
      console.error("Error fetching salon data:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać danych salonu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalonData();
  }, [fetchSalonData]);

  const updateProfile = async (updates: Partial<SalonProfile>) => {
    if (!profile?.id) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("salons")
        .update({
          name: updates.name ?? profile.name,
          description: updates.description ?? profile.description,
          address: updates.address ?? profile.address,
          city: updates.city ?? profile.city,
          phone: updates.phone ?? profile.phone,
          email: updates.email ?? profile.email,
          logo_url: updates.logoUrl ?? profile.logoUrl,
          theme_primary_color: updates.themePrimaryColor ?? profile.themePrimaryColor,
          theme_secondary_color: updates.themeSecondaryColor ?? profile.themeSecondaryColor,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Zapisano",
        description: "Profil salonu został zaktualizowany.",
      });
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać zmian.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = async (
    section: keyof SalonSettings,
    updates: Partial<BookingSettings | NotificationSettings | IntegrationSettings>
  ) => {
    if (!profile?.id) return false;

    setIsSaving(true);
    try {
      const newSettings = {
        ...settings,
        [section]: { ...settings[section], ...updates },
      };

      const { error } = await supabase
        .from("salons")
        .update({ settings: JSON.parse(JSON.stringify(newSettings)) as Json })
        .eq("id", profile.id);

      if (error) throw error;

      setSettings(newSettings);
      toast({
        title: "Zapisano",
        description: "Ustawienia zostały zaktualizowane.",
      });
      return true;
    } catch (error) {
      console.error("Error updating settings:", error);
      toast({
        title: "Błąd",
        description: "Nie udało się zapisać ustawień.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    settings,
    isLoading,
    isSaving,
    updateProfile,
    updateSettings,
    refetch: fetchSalonData,
  };
}
