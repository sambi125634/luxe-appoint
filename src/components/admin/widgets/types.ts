// Widget Types & Interfaces

export interface BookingWidget {
  id: string;
  name: string;
  slug: string;
  description?: string;
  type: "main" | "campaign" | "promo";
  isActive: boolean;
  
  // Services configuration
  services: string[]; // Service IDs to include
  showAllServices: boolean;
  
  // Visual customization
  theme: WidgetTheme;
  
  // Form customization
  formFields: FormFieldConfig[];
  
  // Steps configuration
  steps: WidgetStep[];
  
  // Promotion settings
  promotion?: WidgetPromotion;
  
  // Prepayment settings per widget
  prepayment?: WidgetPrepayment;
  
  // Tracking
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  bookingCount: number;
}

export interface WidgetPrepayment {
  enabled: boolean;
  type: 'full' | 'fixed' | 'percentage';
  amount: number; // Value in PLN or percentage
  requireForHighRisk: boolean;
  requireForNewClients: boolean;
}

export interface WidgetTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "full";
  fontFamily: string;
  showLogo: boolean;
  logoUrl?: string;
  showHeader: boolean;
  headerText?: string;
  showFooter: boolean;
  footerText?: string;
}

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "date";
  required: boolean;
  enabled: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  helpText?: string;
}

export interface WidgetStep {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

export interface WidgetPromotion {
  id: string;
  name: string;
  type: "percentage" | "fixed" | "package";
  value: number;
  code?: string;
  validFrom?: Date;
  validTo?: Date;
  minPurchase?: number;
  maxUses?: number;
  usedCount: number;
  applicableServices: string[]; // Service IDs, empty = all
  isActive: boolean;
}

export interface EmbedOptions {
  type: "iframe" | "script" | "link";
  width: string;
  height: string;
  responsive: boolean;
}

// Default configurations
export const defaultWidgetTheme: WidgetTheme = {
  primaryColor: "#7c3aed",
  secondaryColor: "#a78bfa",
  accentColor: "#c4b5fd",
  backgroundColor: "#ffffff",
  borderRadius: "lg",
  fontFamily: "Inter",
  showLogo: true,
  showHeader: true,
  headerText: "Zarezerwuj wizytę",
  showFooter: true,
  footerText: "Powered by Beauty Calendar",
};

export const defaultFormFields: FormFieldConfig[] = [
  { id: "firstName", name: "firstName", label: "Imię", type: "text", required: true, enabled: true, placeholder: "Anna" },
  { id: "lastName", name: "lastName", label: "Nazwisko", type: "text", required: true, enabled: true, placeholder: "Kowalska" },
  { id: "phone", name: "phone", label: "Telefon", type: "phone", required: true, enabled: true, placeholder: "+48 600 123 456" },
  { id: "email", name: "email", label: "Email", type: "email", required: true, enabled: true, placeholder: "anna@example.com" },
  { id: "notes", name: "notes", label: "Uwagi do wizyty", type: "textarea", required: false, enabled: true, placeholder: "Dodatkowe informacje..." },
  { id: "source", name: "source", label: "Jak do nas trafiłaś?", type: "select", required: false, enabled: false, options: ["Google", "Facebook", "Instagram", "Polecenie", "Inne"] },
  { id: "acceptRodo", name: "acceptRodo", label: "Akceptuję regulamin i politykę prywatności", type: "checkbox", required: true, enabled: true },
  { id: "acceptMarketing", name: "acceptMarketing", label: "Zgoda na komunikację marketingową", type: "checkbox", required: false, enabled: true },
];

export const defaultWidgetSteps: WidgetStep[] = [
  { id: "intro", name: "Wprowadzenie", enabled: true, order: 0 },
  { id: "services", name: "Wybór usługi", enabled: true, order: 1 },
  { id: "staff", name: "Wybór specjalisty", enabled: true, order: 2 },
  { id: "datetime", name: "Wybór terminu", enabled: true, order: 3 },
  { id: "form", name: "Dane klienta", enabled: true, order: 4 },
  { id: "summary", name: "Podsumowanie", enabled: true, order: 5 },
];

// Mock widgets for demo
export const mockWidgets: BookingWidget[] = [
  {
    id: "main",
    name: "Główny kalendarz",
    slug: "main",
    description: "Domyślny widget rezerwacji ze wszystkimi usługami",
    type: "main",
    isActive: true,
    services: [],
    showAllServices: true,
    theme: defaultWidgetTheme,
    formFields: defaultFormFields,
    steps: defaultWidgetSteps,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date(),
    viewCount: 1250,
    bookingCount: 89,
  },
  {
    id: "blackfriday2024",
    name: "Black Friday 2024",
    slug: "black-friday",
    description: "Promocja Black Friday - 30% zniżki na wybrane zabiegi",
    type: "promo",
    isActive: true,
    services: ["1", "2", "4"],
    showAllServices: false,
    theme: {
      ...defaultWidgetTheme,
      primaryColor: "#1a1a1a",
      secondaryColor: "#f59e0b",
      headerText: "🖤 Black Friday - 30% taniej!",
    },
    formFields: defaultFormFields,
    steps: defaultWidgetSteps,
    promotion: {
      id: "bf2024",
      name: "Black Friday 30%",
      type: "percentage",
      value: 30,
      code: "BF2024",
      validFrom: new Date("2024-11-25"),
      validTo: new Date("2024-11-30"),
      applicableServices: ["1", "2", "4"],
      isActive: true,
      usedCount: 23,
      maxUses: 100,
    },
    createdAt: new Date("2024-11-01"),
    updatedAt: new Date(),
    viewCount: 456,
    bookingCount: 23,
  },
  {
    id: "campaign-mezoterapia",
    name: "Kampania Mezoterapia",
    slug: "mezoterapia-promocja",
    description: "Landing page kampanii FB - pakiety mezoterapii",
    type: "campaign",
    isActive: true,
    services: ["2"],
    showAllServices: false,
    theme: {
      ...defaultWidgetTheme,
      headerText: "Mezoterapia - Odmłodzenie skóry",
    },
    formFields: [
      ...defaultFormFields,
      { id: "skinType", name: "skinType", label: "Rodzaj skóry", type: "select", required: true, enabled: true, options: ["Sucha", "Tłusta", "Mieszana", "Normalna"] },
    ],
    steps: defaultWidgetSteps,
    createdAt: new Date("2024-10-15"),
    updatedAt: new Date(),
    viewCount: 234,
    bookingCount: 18,
  },
];

// Mock promotions
export const mockPromotions: WidgetPromotion[] = [
  {
    id: "bf2024",
    name: "Black Friday 30%",
    type: "percentage",
    value: 30,
    code: "BF2024",
    validFrom: new Date("2024-11-25"),
    validTo: new Date("2024-11-30"),
    applicableServices: ["1", "2", "4"],
    isActive: true,
    usedCount: 23,
    maxUses: 100,
  },
  {
    id: "welcome10",
    name: "Pierwsza wizyta -10%",
    type: "percentage",
    value: 10,
    code: "WELCOME10",
    applicableServices: [],
    isActive: true,
    usedCount: 156,
  },
  {
    id: "summer50",
    name: "Letnia promocja 50zł",
    type: "fixed",
    value: 50,
    code: "LATO50",
    validFrom: new Date("2024-06-01"),
    validTo: new Date("2024-08-31"),
    minPurchase: 200,
    applicableServices: [],
    isActive: false,
    usedCount: 89,
    maxUses: 200,
  },
];
