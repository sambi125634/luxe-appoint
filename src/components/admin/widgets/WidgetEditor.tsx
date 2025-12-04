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
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
      viewCount: 0,
      bookingCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });

  const [activeTab, setActiveTab] = useState("basic");

  const handleSave = () => {
    if (!formData.name || !formData.slug) {
      return;
    }
    onSave(formData as BookingWidget);
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateTheme = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      theme: { ...prev.theme!, [field]: value }
    }));
  };

  const toggleService = (serviceId: string) => {
    const current = formData.services || [];
    if (current.includes(serviceId)) {
      updateField('services', current.filter(id => id !== serviceId));
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
    // Update order values
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

  // Generate preview styles based on theme
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
              {[
                { id: "basic", icon: Sparkles, label: "Podstawowe" },
                { id: "services", icon: ListChecks, label: "Usługi" },
                { id: "steps", icon: ChevronRight, label: "Kroki" },
                { id: "form", icon: FormInput, label: "Formularz" },
                { id: "theme", icon: Palette, label: "Wygląd" },
                { id: "promo", icon: Tag, label: "Promocja" },
              ].map(tab => (
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
                  {formData.formFields?.map(field => (
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
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {field.type}
                        </span>
                      </div>
                      <Switch
                        checked={field.enabled}
                        onCheckedChange={() => toggleFormField(field.id)}
                        disabled={field.required}
                      />
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="gap-2 w-full">
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
                  style={previewStyles}
                >
                  {/* Header */}
                  {formData.theme?.showLogo && (
                    <div className="p-3 border-b border-border flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/20" />
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

                  {/* Steps Preview - Show actual step order */}
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
            <Button variant="luxury" className="gap-2" onClick={handleSave}>
              <Save className="w-4 h-4" />
              {isNew ? "Utwórz widget" : "Zapisz zmiany"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
