import { useState } from "react";
import { 
  X, 
  Sparkles, 
  Palette, 
  ListChecks, 
  FormInput, 
  Tag,
  Save,
  Eye,
  ChevronRight,
  GripVertical,
  Plus,
  Trash2,
  CreditCard,
  Settings,
  BarChart3,
  Upload,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BookingWidget, 
  WidgetStep, 
  FormFieldConfig,
  WidgetPrepayment,
  WidgetAdvancedSettings,
  defaultWidgetTheme,
  defaultFormFields,
  defaultWidgetSteps 
} from "./types";

interface WidgetEditorProps {
  widget: BookingWidget | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (widget: BookingWidget) => void;
}

// Mock services for demo
const mockServices = [
  { id: "1", name: "Peeling kawitacyjny", category: "Twarz", price: 150 },
  { id: "2", name: "Mezoterapia igłowa", category: "Twarz", price: 350 },
  { id: "3", name: "Mikrodermabrazja", category: "Twarz", price: 180 },
  { id: "4", name: "Masaż relaksacyjny", category: "Ciało", price: 200 },
  { id: "5", name: "Masaż gorącymi kamieniami", category: "Ciało", price: 280 },
  { id: "6", name: "Depilacja woskowa - nogi", category: "Depilacja", price: 120 },
  { id: "7", name: "Depilacja laserowa bikini", category: "Depilacja", price: 250 },
  { id: "8", name: "Stylizacja brwi", category: "Brwi i rzęsy", price: 80 },
  { id: "9", name: "Przedłużanie rzęs 1:1", category: "Brwi i rzęsy", price: 350 },
];

// Mock funnel data for analytics
const mockFunnelData = [
  { step: "Wyświetlenia", value: 1250, color: "hsl(var(--muted-foreground))" },
  { step: "Kliknięcia", value: 834, color: "hsl(var(--primary))" },
  { step: "Formularz", value: 421, color: "hsl(var(--accent-foreground))" },
  { step: "Rezerwacje", value: 89, color: "hsl(var(--primary))" },
];

const mockTrafficSources = [
  { source: "Instagram", visits: 456, bookings: 34 },
  { source: "Facebook Ads", visits: 312, bookings: 28 },
  { source: "Google", visits: 234, bookings: 15 },
  { source: "Bezpośredni link", visits: 178, bookings: 12 },
  { source: "Polecenie", visits: 70, bookings: 0 },
];

const defaultAdvancedSettings: WidgetAdvancedSettings = {
  socialProofEnabled: false,
  socialProofText: "🔥 {count} osób rezerwowało dziś",
  minAdvanceHours: 2,
  maxAdvanceDays: 60,
  thankYouText: "Dziękujemy za rezerwację! Potwierdzenie wysłaliśmy na e-mail.",
  redirectUrl: "",
};

const fontOptions = [
  { value: "Inter", label: "Inter" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Lato", label: "Lato" },
  { value: "Poppins", label: "Poppins" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "DM Sans", label: "DM Sans" },
];

export function WidgetEditor({ widget, isOpen, onClose, onSave }: WidgetEditorProps) {
  const isNew = !widget;
  
  const [formData, setFormData] = useState<Partial<BookingWidget>>(() => {
    if (widget) return { ...widget };
    return {
      name: "",
      slug: "",
      description: "",
      type: "campaign",
      isActive: true,
      services: [],
      showAllServices: false,
      theme: { ...defaultWidgetTheme },
      formFields: [...defaultFormFields],
      steps: [...defaultWidgetSteps],
      prepayment: {
        enabled: false,
        type: 'percentage',
        amount: 30,
        requireForHighRisk: false,
        requireForNewClients: false,
      },
      advancedSettings: { ...defaultAdvancedSettings },
      viewCount: 0,
      bookingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [showCustomFieldModal, setShowCustomFieldModal] = useState(false);
  const [newField, setNewField] = useState<Partial<FormFieldConfig>>({
    name: "",
    label: "",
    type: "text",
    required: false,
    enabled: true,
    placeholder: "",
    options: [],
  });
  const [newFieldOption, setNewFieldOption] = useState("");

  const handleSave = () => {
    if (!formData.name || !formData.slug) {
      return;
    }
    onSave(formData as BookingWidget);
  };

  const updateField = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTheme = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      theme: { ...prev.theme!, [field]: value }
    }));
  };

  const updatePrepayment = (field: keyof WidgetPrepayment, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      prepayment: { ...prev.prepayment!, [field]: value }
    }));
  };

  const updateAdvanced = (field: keyof WidgetAdvancedSettings, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      advancedSettings: { 
        ...(prev.advancedSettings || defaultAdvancedSettings), 
        [field]: value 
      }
    }));
  };

  const toggleService = (serviceId: string) => {
    const current = formData.services || [];
    if (current.includes(serviceId)) {
      updateField('services', current.filter((id: string) => id !== serviceId));
    } else {
      updateField('services', [...current, serviceId]);
    }
  };

  const toggleStep = (stepId: string) => {
    const steps = formData.steps || [];
    updateField('steps', steps.map(s => 
      s.id === stepId ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const moveStep = (fromIndex: number, toIndex: number) => {
    const steps = [...(formData.steps || [])];
    const [movedStep] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, movedStep);
    const reorderedSteps = steps.map((s, i) => ({ ...s, order: i }));
    updateField('steps', reorderedSteps);
  };

  const [draggedStepIndex, setDraggedStepIndex] = useState<number | null>(null);

  const toggleFormField = (fieldId: string) => {
    const fields = formData.formFields || [];
    updateField('formFields', fields.map(f => 
      f.id === fieldId ? { ...f, enabled: !f.enabled } : f
    ));
  };

  const removeCustomField = (fieldId: string) => {
    const fields = formData.formFields || [];
    updateField('formFields', fields.filter(f => f.id !== fieldId));
  };

  const addCustomField = () => {
    if (!newField.label || !newField.name) return;
    const id = `custom_${Date.now()}`;
    const field: FormFieldConfig = {
      id,
      name: newField.name || id,
      label: newField.label || "",
      type: (newField.type as FormFieldConfig["type"]) || "text",
      required: newField.required || false,
      enabled: true,
      placeholder: newField.placeholder || "",
      options: newField.type === "select" ? newField.options : undefined,
    };
    updateField('formFields', [...(formData.formFields || []), field]);
    setShowCustomFieldModal(false);
    setNewField({ name: "", label: "", type: "text", required: false, enabled: true, placeholder: "", options: [] });
    setNewFieldOption("");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[ąĄ]/g, 'a')
      .replace(/[ćĆ]/g, 'c')
      .replace(/[ęĘ]/g, 'e')
      .replace(/[łŁ]/g, 'l')
      .replace(/[ńŃ]/g, 'n')
      .replace(/[óÓ]/g, 'o')
      .replace(/[śŚ]/g, 's')
      .replace(/[źŹżŻ]/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const [showPreview, setShowPreview] = useState(true);

  const previewStyles = {
    '--preview-primary': formData.theme?.primaryColor || '#7c3aed',
    '--preview-secondary': formData.theme?.secondaryColor || '#a78bfa',
  } as React.CSSProperties;

  const getBorderRadiusClass = () => {
    switch (formData.theme?.borderRadius) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-2xl';
      default: return 'rounded-lg';
    }
  };

  const advanced = formData.advancedSettings || defaultAdvancedSettings;

  const tabs = [
    { id: "basic", icon: Sparkles, label: "Podstawowe" },
    { id: "services", icon: ListChecks, label: "Usługi" },
    { id: "steps", icon: ChevronRight, label: "Kroki" },
    { id: "form", icon: FormInput, label: "Formularz" },
    { id: "theme", icon: Palette, label: "Wygląd" },
    { id: "payment", icon: CreditCard, label: "Płatności" },
    { id: "promo", icon: Tag, label: "Promocja" },
    { id: "advanced", icon: Settings, label: "Zaawansowane" },
    { id: "analytics", icon: BarChart3, label: "Analityka" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {isNew ? "Utwórz nowy widget" : `Edytuj: ${widget?.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-[70vh]">
          {/* Sidebar */}
          <div className="lg:w-48 border-b lg:border-b-0 lg:border-r border-border p-2 lg:p-4">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-muted'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 p-6">
            {/* Basic Settings */}
            {activeTab === "basic" && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa widgetu</Label>
                  <Input
                    id="name"
                    placeholder="np. Kampania Black Friday"
                    value={formData.name || ""}
                    onChange={(e) => {
                      updateField('name', e.target.value);
                      if (isNew) {
                        updateField('slug', generateSlug(e.target.value));
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug URL</Label>
                  <div className="flex">
                    <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0 text-sm text-muted-foreground">
                      /book/
                    </span>
                    <Input
                      id="slug"
                      className="rounded-l-none"
                      placeholder="black-friday"
                      value={formData.slug || ""}
                      onChange={(e) => updateField('slug', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Opis</Label>
                  <Textarea
                    id="description"
                    placeholder="Krótki opis widgetu..."
                    value={formData.description || ""}
                    onChange={(e) => updateField('description', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Typ widgetu</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => updateField('type', v)}
                    disabled={widget?.type === 'main'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Główny</SelectItem>
                      <SelectItem value="campaign">Kampania</SelectItem>
                      <SelectItem value="promo">Promocja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Widget aktywny</Label>
                    <p className="text-sm text-muted-foreground">
                      Wyłącz, aby tymczasowo ukryć widget
                    </p>
                  </div>
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(v) => updateField('isActive', v)}
                  />
                </div>
              </div>
            )}

            {/* Services */}
            {activeTab === "services" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Pokaż wszystkie usługi</Label>
                    <p className="text-sm text-muted-foreground">
                      Włącz, aby pokazać pełną ofertę
                    </p>
                  </div>
                  <Switch
                    checked={formData.showAllServices}
                    onCheckedChange={(v) => updateField('showAllServices', v)}
                  />
                </div>

                {!formData.showAllServices && (
                  <div className="space-y-3">
                    <Label>Wybierz usługi do wyświetlenia</Label>
                    <div className="grid gap-2">
                      {mockServices.map(service => (
                        <label
                          key={service.id}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            formData.services?.includes(service.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <Checkbox
                            checked={formData.services?.includes(service.id)}
                            onCheckedChange={() => toggleService(service.id)}
                          />
                          <div className="flex-1">
                            <span className="font-medium">{service.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {service.category}
                            </span>
                          </div>
                          <Badge variant="secondary">{service.price} zł</Badge>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Steps */}
            {activeTab === "steps" && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Dostosuj kroki procesu rezerwacji. Przeciągnij, aby zmienić kolejność.
                </p>
                <div className="space-y-2">
                  {formData.steps?.map((step, index) => (
                    <div
                      key={step.id}
                      draggable
                      onDragStart={() => setDraggedStepIndex(index)}
                      onDragEnd={() => setDraggedStepIndex(null)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedStepIndex !== null && draggedStepIndex !== index) {
                          moveStep(draggedStepIndex, index);
                        }
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        step.enabled ? 'border-border' : 'border-border/50 opacity-50'
                      } ${draggedStepIndex === index ? 'opacity-50 scale-95' : ''} ${
                        draggedStepIndex !== null && draggedStepIndex !== index ? 'hover:border-primary hover:bg-primary/5' : ''
                      }`}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                      <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center justify-center">
                        {index + 1}
                      </div>
                      <span className="flex-1 font-medium">{step.name}</span>
                      <Switch
                        checked={step.enabled}
                        onCheckedChange={() => toggleStep(step.id)}
                        disabled={step.id === 'services' || step.id === 'datetime' || step.id === 'form'}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  * Niektóre kroki są wymagane i nie można ich wyłączyć
                </p>
              </div>
            )}

            {/* Form Fields */}
            {activeTab === "form" && (
              <div className="space-y-6">
                <p className="text-sm text-muted-foreground">
                  Wybierz pola formularza klienta
                </p>
                <div className="space-y-2">
                  {formData.formFields?.map(field => {
                    const isCustom = field.id.startsWith("custom_");
                    return (
                      <div
                        key={field.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${
                          field.enabled ? 'border-border' : 'border-border/50 opacity-50'
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{field.label}</span>
                            {field.required && (
                              <Badge variant="outline" className="text-xs">
                                Wymagane
                              </Badge>
                            )}
                            {isCustom && (
                              <Badge variant="secondary" className="text-xs">
                                Własne
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {field.type}{field.options ? ` (${field.options.length} opcji)` : ""}
                          </span>
                        </div>
                        {isCustom && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => removeCustomField(field.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        <Switch
                          checked={field.enabled}
                          onCheckedChange={() => toggleFormField(field.id)}
                          disabled={field.required && !isCustom}
                        />
                      </div>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  className="gap-2 w-full"
                  onClick={() => setShowCustomFieldModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Dodaj własne pole
                </Button>
              </div>
            )}

            {/* Theme */}
            {activeTab === "theme" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Kolor główny</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-12 h-10 p-1"
                        value={formData.theme?.primaryColor || "#7c3aed"}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                      />
                      <Input
                        value={formData.theme?.primaryColor || "#7c3aed"}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Kolor akcentu</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-12 h-10 p-1"
                        value={formData.theme?.secondaryColor || "#a78bfa"}
                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                      />
                      <Input
                        value={formData.theme?.secondaryColor || "#a78bfa"}
                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Kolor tła</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      className="w-12 h-10 p-1"
                      value={formData.theme?.backgroundColor || "#ffffff"}
                      onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    />
                    <Input
                      value={formData.theme?.backgroundColor || "#ffffff"}
                      onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Czcionka</Label>
                  <Select
                    value={formData.theme?.fontFamily || "Inter"}
                    onValueChange={(v) => updateTheme('fontFamily', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.value }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Zaokrąglenie rogów</Label>
                  <Select
                    value={formData.theme?.borderRadius || "lg"}
                    onValueChange={(v) => updateTheme('borderRadius', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Brak</SelectItem>
                      <SelectItem value="sm">Małe</SelectItem>
                      <SelectItem value="md">Średnie</SelectItem>
                      <SelectItem value="lg">Duże</SelectItem>
                      <SelectItem value="full">Pełne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tekst nagłówka</Label>
                  <Input
                    value={formData.theme?.headerText || ""}
                    onChange={(e) => updateTheme('headerText', e.target.value)}
                    placeholder="Zarezerwuj wizytę"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Pokaż logo</Label>
                    <p className="text-sm text-muted-foreground">
                      Wyświetl logo salonu w nagłówku
                    </p>
                  </div>
                  <Switch
                    checked={formData.theme?.showLogo}
                    onCheckedChange={(v) => updateTheme('showLogo', v)}
                  />
                </div>

                {formData.theme?.showLogo && (
                  <div className="space-y-2">
                    <Label>URL logo</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.theme?.logoUrl || ""}
                        onChange={(e) => updateTheme('logoUrl', e.target.value)}
                        placeholder="https://example.com/logo.png"
                        className="flex-1"
                      />
                      <Button variant="outline" size="icon" className="shrink-0">
                        <Upload className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.theme?.logoUrl && (
                      <div className="w-16 h-16 rounded-lg border border-border overflow-hidden bg-muted">
                        <img src={formData.theme.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <Label>Pokaż stopkę</Label>
                    <p className="text-sm text-muted-foreground">
                      "Powered by Beauty Calendar"
                    </p>
                  </div>
                  <Switch
                    checked={formData.theme?.showFooter}
                    onCheckedChange={(v) => updateTheme('showFooter', v)}
                  />
                </div>
              </div>
            )}

            {/* Promotion */}
            {activeTab === "promo" && (
              <div className="space-y-6">
                <div className="p-4 bg-secondary/10 border border-secondary/20 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Dodaj promocję do widgetu
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Promocje możesz zarządzać w zakładce "Promocje" i przypisać je do tego widgetu.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Typ zniżki</Label>
                    <Select defaultValue="percentage">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Procentowa (%)</SelectItem>
                        <SelectItem value="fixed">Kwotowa (zł)</SelectItem>
                        <SelectItem value="package">Pakiet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Wartość zniżki</Label>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="30" className="flex-1" />
                      <span className="px-3 py-2 bg-muted rounded-md">%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Kod promocyjny (opcjonalnie)</Label>
                    <Input placeholder="np. BLACKFRIDAY30" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Ważna od</Label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <Label>Ważna do</Label>
                      <Input type="date" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Payment / Prepayment Settings */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/20">
                      <CreditCard className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Label className="text-base font-semibold">Wymagaj zaliczki</Label>
                      <p className="text-sm text-muted-foreground">
                        Klient musi wpłacić zaliczkę przy rezerwacji
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.prepayment?.enabled || false}
                    onCheckedChange={(v) => updatePrepayment('enabled', v)}
                  />
                </div>

                {formData.prepayment?.enabled && (
                  <div className="space-y-6 p-4 border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label>Typ zaliczki</Label>
                      <Select
                        value={formData.prepayment?.type || 'percentage'}
                        onValueChange={(v) => updatePrepayment('type', v as 'full' | 'fixed' | 'percentage')}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Pełna cena usługi</SelectItem>
                          <SelectItem value="fixed">Stała kwota (PLN)</SelectItem>
                          <SelectItem value="percentage">Procent ceny</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.prepayment?.type !== 'full' && (
                      <div className="space-y-2">
                        <Label>
                          {formData.prepayment?.type === 'fixed' ? 'Kwota zaliczki (PLN)' : 'Procent ceny (%)'}
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={formData.prepayment?.type === 'percentage' ? 100 : undefined}
                            value={formData.prepayment?.amount || 30}
                            onChange={(e) => updatePrepayment('amount', parseInt(e.target.value) || 0)}
                            className="flex-1"
                          />
                          <span className="px-3 py-2 bg-muted rounded-md text-sm font-medium">
                            {formData.prepayment?.type === 'percentage' ? '%' : 'PLN'}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-border pt-4 space-y-4">
                      <p className="text-sm font-medium text-muted-foreground">Warunki zaliczki (opcjonalne)</p>
                      
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <Label>Tylko dla klientów high-risk</Label>
                          <p className="text-xs text-muted-foreground">
                            Wymagaj tylko gdy AI Risk Score = HIGH
                          </p>
                        </div>
                        <Switch
                          checked={formData.prepayment?.requireForHighRisk || false}
                          onCheckedChange={(v) => updatePrepayment('requireForHighRisk', v)}
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <Label>Tylko dla nowych klientów</Label>
                          <p className="text-xs text-muted-foreground">
                            Wymagaj przy pierwszej wizycie
                          </p>
                        </div>
                        <Switch
                          checked={formData.prepayment?.requireForNewClients || false}
                          onCheckedChange={(v) => updatePrepayment('requireForNewClients', v)}
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        <strong>Uwaga:</strong> Aby pobierać zaliczki, salon musi mieć skonfigurowaną integrację z Przelewy24 w ustawieniach salonu.
                      </p>
                    </div>
                  </div>
                )}

                {!formData.prepayment?.enabled && (
                  <div className="p-4 border border-dashed border-border rounded-lg text-center">
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Zaliczki są wyłączone dla tego widgetu.<br />
                      Włącz powyżej, aby wymagać płatności przed rezerwacją.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Settings */}
            {activeTab === "advanced" && (
              <div className="space-y-6">
                {/* Thank You Page */}
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Strona potwierdzenia
                  </h4>
                  <div className="space-y-2">
                    <Label>Tekst podziękowania</Label>
                    <Textarea
                      value={advanced.thankYouText || ""}
                      onChange={(e) => updateAdvanced('thankYouText', e.target.value)}
                      placeholder="Dziękujemy za rezerwację!"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Przekierowanie po rezerwacji (opcjonalnie)</Label>
                    <Input
                      value={advanced.redirectUrl || ""}
                      onChange={(e) => updateAdvanced('redirectUrl', e.target.value)}
                      placeholder="https://twojsalon.pl/dziekujemy"
                    />
                    <p className="text-xs text-muted-foreground">
                      Zostaw puste, aby pokazać domyślną stronę potwierdzenia
                    </p>
                  </div>
                </div>

                {/* Social Proof */}
                <div className="border-t border-border pt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg border border-orange-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-orange-500/20">
                        <Flame className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <Label className="text-base font-semibold">Social Proof</Label>
                        <p className="text-sm text-muted-foreground">
                          Pokaż badge z liczbą rezerwacji
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={advanced.socialProofEnabled || false}
                      onCheckedChange={(v) => updateAdvanced('socialProofEnabled', v)}
                    />
                  </div>
                  {advanced.socialProofEnabled && (
                    <div className="space-y-2">
                      <Label>Tekst badge</Label>
                      <Input
                        value={advanced.socialProofText || ""}
                        onChange={(e) => updateAdvanced('socialProofText', e.target.value)}
                        placeholder="🔥 {count} osób rezerwowało dziś"
                      />
                      <p className="text-xs text-muted-foreground">
                        Użyj {"{count}"} aby wstawić liczbę rezerwacji
                      </p>
                      {/* Preview */}
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full text-sm">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-orange-700 dark:text-orange-300 font-medium">
                          {(advanced.socialProofText || "🔥 {count} osób rezerwowało dziś").replace("{count}", "12")}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Booking Time Window */}
                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4 text-primary" />
                    Okno czasowe rezerwacji
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Min. wyprzedzenie (godziny)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={advanced.minAdvanceHours || 2}
                        onChange={(e) => updateAdvanced('minAdvanceHours', parseInt(e.target.value) || 0)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Klient musi rezerwować min. X godzin wcześniej
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Max. horyzont (dni)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={advanced.maxAdvanceDays || 60}
                        onChange={(e) => updateAdvanced('maxAdvanceDays', parseInt(e.target.value) || 30)}
                      />
                      <p className="text-xs text-muted-foreground">
                        Jak daleko w przyszłość można rezerwować
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Limit */}
                <div className="border-t border-border pt-6 space-y-4">
                  <h4 className="font-semibold">Limit rezerwacji</h4>
                  <div className="space-y-2">
                    <Label>Max. liczba rezerwacji z tego widgetu</Label>
                    <Input
                      type="number"
                      min={0}
                      value={advanced.maxTotalBookings || ""}
                      onChange={(e) => updateAdvanced('maxTotalBookings', e.target.value ? parseInt(e.target.value) : undefined)}
                      placeholder="Bez limitu"
                    />
                    <p className="text-xs text-muted-foreground">
                      Zostaw puste = bez limitu. Idealne do kampanii z ograniczoną liczbą miejsc.
                    </p>
                  </div>
                  {advanced.maxTotalBookings && (formData.bookingCount || 0) > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Wykorzystanie</span>
                        <span className="font-medium">{formData.bookingCount || 0} / {advanced.maxTotalBookings}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min(((formData.bookingCount || 0) / advanced.maxTotalBookings) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Analytics */}
            {activeTab === "analytics" && (
              <div className="space-y-6">
                {/* Conversion Rate */}
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary">
                      {((mockFunnelData[3].value / mockFunnelData[0].value) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Konwersja</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <p className="text-lg font-semibold">{formData.viewCount || mockFunnelData[0].value}</p>
                      <p className="text-xs text-muted-foreground">Wyświetleń</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">{formData.bookingCount || mockFunnelData[3].value}</p>
                      <p className="text-xs text-muted-foreground">Rezerwacji</p>
                    </div>
                  </div>
                </div>

                {/* Funnel */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Lejek konwersji</h4>
                  {mockFunnelData.map((item, i) => {
                    const prevValue = i > 0 ? mockFunnelData[i - 1].value : item.value;
                    const dropOff = i > 0 ? ((1 - item.value / prevValue) * 100).toFixed(0) : null;
                    const widthPct = (item.value / mockFunnelData[0].value) * 100;
                    return (
                      <div key={item.step} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{item.step}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.value}</span>
                            {dropOff && (
                              <span className="text-xs text-destructive">-{dropOff}%</span>
                            )}
                          </div>
                        </div>
                        <div className="h-3 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${widthPct}%`,
                              backgroundColor: `hsl(var(--primary))`,
                              opacity: 0.4 + (i / mockFunnelData.length) * 0.6,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Traffic Sources */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Źródła ruchu</h4>
                  <div className="space-y-2">
                    {mockTrafficSources.map(source => (
                      <div key={source.source} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{source.source}</p>
                          <p className="text-xs text-muted-foreground">{source.visits} wizyt</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{source.bookings} rez.</p>
                          <p className="text-xs text-muted-foreground">
                            {source.visits > 0 ? ((source.bookings / source.visits) * 100).toFixed(1) : 0}% konw.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">
                    Dane analityczne — podgląd demonstracyjny. Dane rzeczywiste pojawią się po uruchomieniu widgetu.
                  </p>
                </div>
              </div>
            )}
          </ScrollArea>

          {/* Live Preview Panel */}
          {showPreview && (
            <div className="hidden lg:flex flex-col w-80 border-l border-border bg-muted/30">
              <div className="p-3 border-b border-border flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Podgląd na żywo
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div 
                  className={`bg-background border border-border ${getBorderRadiusClass()} overflow-hidden shadow-lg`}
                  style={{
                    ...previewStyles,
                    backgroundColor: formData.theme?.backgroundColor || '#ffffff',
                    fontFamily: formData.theme?.fontFamily || 'Inter',
                  }}
                >
                  {/* Social Proof Badge */}
                  {advanced.socialProofEnabled && (
                    <div className="px-3 pt-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-[10px]">
                        <Flame className="w-3 h-3 text-orange-500" />
                        <span className="text-orange-700 dark:text-orange-300 font-medium">
                          {(advanced.socialProofText || "🔥 {count} osób rezerwowało dziś").replace("{count}", "12")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  {formData.theme?.showLogo && (
                    <div className="p-3 border-b border-border flex items-center gap-2">
                      {formData.theme?.logoUrl ? (
                        <img src={formData.theme.logoUrl} alt="Logo" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/20" />
                      )}
                      <span className="text-xs font-medium">Demo Salon</span>
                    </div>
                  )}
                  
                  {/* Header Text */}
                  <div 
                    className="p-4 text-center"
                    style={{ background: `linear-gradient(135deg, ${formData.theme?.primaryColor || '#7c3aed'}20, ${formData.theme?.secondaryColor || '#a78bfa'}20)` }}
                  >
                    <h3 className="text-sm font-semibold" style={{ color: formData.theme?.primaryColor }}>
                      {formData.theme?.headerText || "Zarezerwuj wizytę"}
                    </h3>
                  </div>

                  {/* Steps Preview */}
                  <div className="p-3 space-y-2">
                    <p className="text-[10px] text-muted-foreground mb-2">Kolejność kroków:</p>
                    <div className="space-y-1.5">
                      {formData.steps?.filter(s => s.enabled).sort((a, b) => a.order - b.order).map((step, i) => (
                        <div 
                          key={step.id}
                          className={`flex items-center gap-2 p-1.5 rounded text-[10px] ${i === 0 ? 'bg-primary/10' : 'bg-muted/50'}`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                            style={{ backgroundColor: i === 0 ? formData.theme?.primaryColor : 'hsl(var(--muted-foreground))' }}
                          >
                            {i + 1}
                          </span>
                          <span className={i === 0 ? 'font-medium' : 'text-muted-foreground'}>
                            {step.name}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-border my-2 pt-2">
                      <p className="text-[10px] text-muted-foreground mb-2">Przykładowe usługi:</p>
                      <div className="space-y-2">
                        {(formData.showAllServices ? mockServices.slice(0, 3) : mockServices.filter(s => formData.services?.includes(s.id)).slice(0, 3)).map(service => (
                          <div 
                            key={service.id}
                            className={`p-2 border border-border ${getBorderRadiusClass()} hover:border-primary/50 transition-colors cursor-pointer`}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-medium">{service.name}</p>
                                <p className="text-[10px] text-muted-foreground">{service.category}</p>
                              </div>
                              <span 
                                className="text-xs font-bold"
                                style={{ color: formData.theme?.primaryColor }}
                              >
                                {service.price} zł
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mock Button */}
                      <button 
                        className={`w-full mt-3 py-2 text-xs font-medium text-white ${getBorderRadiusClass()}`}
                        style={{ backgroundColor: formData.theme?.primaryColor }}
                      >
                        Dalej
                      </button>
                    </div>
                  </div>

                  {/* Footer */}
                  {formData.theme?.showFooter && (
                    <div className="p-2 border-t border-border text-center">
                      <span className="text-[10px] text-muted-foreground">
                        Powered by Beauty Calendar
                      </span>
                    </div>
                  )}
                </div>

                {/* Preview Info */}
                <div className="mt-3 p-2 bg-muted rounded-lg">
                  <p className="text-[10px] text-muted-foreground text-center">
                    Podgląd aktualizuje się w czasie rzeczywistym
                  </p>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <Button variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
          <div className="flex gap-2">
            {!showPreview && (
              <Button variant="outline" className="gap-2" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4" />
                Podgląd
              </Button>
            )}
            <Button className="gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" />
              {isNew ? "Utwórz widget" : "Zapisz zmiany"}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Custom Field Modal */}
      <Dialog open={showCustomFieldModal} onOpenChange={setShowCustomFieldModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dodaj własne pole</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Etykieta pola</Label>
              <Input
                value={newField.label || ""}
                onChange={(e) => {
                  setNewField(prev => ({ 
                    ...prev, 
                    label: e.target.value,
                    name: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                  }));
                }}
                placeholder="np. Rodzaj skóry"
              />
            </div>
            <div className="space-y-2">
              <Label>Typ pola</Label>
              <Select
                value={newField.type || "text"}
                onValueChange={(v) => setNewField(prev => ({ ...prev, type: v as FormFieldConfig["type"] }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Tekst</SelectItem>
                  <SelectItem value="textarea">Tekst (długi)</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Telefon</SelectItem>
                  <SelectItem value="select">Lista wyboru</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="date">Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newField.type === "select" && (
              <div className="space-y-2">
                <Label>Opcje</Label>
                <div className="flex gap-2">
                  <Input
                    value={newFieldOption}
                    onChange={(e) => setNewFieldOption(e.target.value)}
                    placeholder="Dodaj opcję..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newFieldOption.trim()) {
                        e.preventDefault();
                        setNewField(prev => ({
                          ...prev,
                          options: [...(prev.options || []), newFieldOption.trim()],
                        }));
                        setNewFieldOption("");
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (newFieldOption.trim()) {
                        setNewField(prev => ({
                          ...prev,
                          options: [...(prev.options || []), newFieldOption.trim()],
                        }));
                        setNewFieldOption("");
                      }
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {newField.options && newField.options.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {newField.options.map((opt, i) => (
                      <Badge key={i} variant="secondary" className="gap-1">
                        {opt}
                        <button
                          onClick={() => setNewField(prev => ({
                            ...prev,
                            options: prev.options?.filter((_, idx) => idx !== i),
                          }))}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Placeholder</Label>
              <Input
                value={newField.placeholder || ""}
                onChange={(e) => setNewField(prev => ({ ...prev, placeholder: e.target.value }))}
                placeholder="Tekst podpowiedzi..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                checked={newField.required || false}
                onCheckedChange={(v) => setNewField(prev => ({ ...prev, required: !!v }))}
              />
              <Label>Pole wymagane</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCustomFieldModal(false)}>
              Anuluj
            </Button>
            <Button onClick={addCustomField} disabled={!newField.label}>
              <Plus className="w-4 h-4 mr-2" />
              Dodaj pole
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
