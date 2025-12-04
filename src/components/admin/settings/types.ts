export interface SalonProfile {
  name: string;
  description: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  logoUrl: string;
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
}

export type SettingsTabType = "profile" | "booking" | "notifications" | "integrations";
