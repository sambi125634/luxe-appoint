import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, GripVertical, Trash2, Type, AlignLeft, ListChecks, SlidersHorizontal,
  Camera, PenTool, ShieldAlert, Sparkles, FileText
} from "lucide-react";
import { toast } from "sonner";
import { ConsultationField, useConsultationTemplates, useSaveTemplate } from "@/hooks/useConsultations";

const FIELD_TYPES = [
  { value: "text", label: "Tekst (1 linia)", icon: Type },
  { value: "textarea", label: "Tekst (wieloliniowy)", icon: AlignLeft },
  { value: "select", label: "Wybór z listy", icon: ListChecks },
  { value: "multiselect", label: "Wielokrotny wybór", icon: ListChecks },
  { value: "slider", label: "Suwak (1-10)", icon: SlidersHorizontal },
  { value: "photo", label: "Zdjęcie referencyjne", icon: Camera },
  { value: "signature", label: "Podpis (RODO)", icon: PenTool },
  { value: "medical", label: "Przeciwwskazania medyczne", icon: ShieldAlert },
] as const;

const SYSTEM_TEMPLATES = [
  {
    name: "Karta konsultacyjna — Twarz",
    fields: [
      { id: "skin_type", type: "select" as const, label: "Typ cery", options: ["Sucha", "Tłusta", "Mieszana", "Normalna", "Wrażliwa"] },
      { id: "skin_rating", type: "slider" as const, label: "Jak oceniasz kondycję swojej skóry?", min: 1, max: 10 },
      { id: "concerns", type: "multiselect" as const, label: "Problemy skórne", options: ["Trądzik", "Zmarszczki", "Przebarwienia", "Suchość", "Rozszerzone pory", "Zaczerwienienia"] },
      { id: "allergies", type: "textarea" as const, label: "Alergie / uczulenia" },
      { id: "medical", type: "medical" as const, label: "Przeciwwskazania medyczne" },
      { id: "photo", type: "photo" as const, label: "Zdjęcie referencyjne" },
      { id: "consent", type: "signature" as const, label: "Podpis — zgoda na zabieg" },
    ],
  },
  {
    name: "Karta konsultacyjna — Paznokcie",
    fields: [
      { id: "nail_type", type: "select" as const, label: "Typ paznokci", options: ["Naturalne", "Żelowe", "Akrylowe", "Hybryda"] },
      { id: "nail_condition", type: "slider" as const, label: "Stan paznokci (1-10)", min: 1, max: 10 },
      { id: "allergies", type: "textarea" as const, label: "Alergie na materiały" },
      { id: "medical", type: "medical" as const, label: "Przeciwwskazania" },
      { id: "consent", type: "signature" as const, label: "Podpis — zgoda" },
    ],
  },
  {
    name: "Karta konsultacyjna — Koloryzacja",
    fields: [
      { id: "hair_type", type: "select" as const, label: "Typ włosów", options: ["Cienkie", "Normalne", "Grube", "Kręcone"] },
      { id: "current_color", type: "text" as const, label: "Aktualny kolor włosów" },
      { id: "desired", type: "textarea" as const, label: "Oczekiwany efekt" },
      { id: "photo", type: "photo" as const, label: "Zdjęcie inspiracji" },
      { id: "allergies", type: "textarea" as const, label: "Alergie na farby/chemię" },
      { id: "medical", type: "medical" as const, label: "Przeciwwskazania" },
      { id: "consent", type: "signature" as const, label: "Podpis — zgoda" },
    ],
  },
  {
    name: "RODO — Zgoda ogólna",
    fields: [
      { id: "data_consent", type: "select" as const, label: "Wyrażam zgodę na przetwarzanie danych osobowych", options: ["Tak", "Nie"] },
      { id: "marketing", type: "select" as const, label: "Zgoda na komunikację marketingową", options: ["Tak", "Nie"] },
      { id: "consent", type: "signature" as const, label: "Podpis" },
    ],
  },
  {
    name: "Wywiad przed pierwszą wizytą",
    fields: [
      { id: "goals", type: "textarea" as const, label: "Cel wizyty / oczekiwania" },
      { id: "prev_treatments", type: "textarea" as const, label: "Poprzednie zabiegi w tym obszarze" },
      { id: "medications", type: "textarea" as const, label: "Przyjmowane leki" },
      { id: "medical", type: "medical" as const, label: "Przeciwwskazania medyczne" },
      { id: "consent", type: "signature" as const, label: "Podpis — zgoda RODO" },
    ],
  },
];

interface Props {
  isDemo?: boolean;
}

export function CardBuilder({ isDemo }: Props) {
  const { t } = useTranslation();
  const { data: templates = [], isLoading } = useConsultationTemplates();
  const saveTemplate = useSaveTemplate();
  const [templateName, setTemplateName] = useState("");
  const [fields, setFields] = useState<ConsultationField[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const addField = (type: ConsultationField["type"]) => {
    const newField: ConsultationField = {
      id: crypto.randomUUID(),
      type,
      label: "",
      required: false,
      ...(type === "slider" ? { min: 1, max: 10 } : {}),
      ...(["select", "multiselect"].includes(type) ? { options: ["Opcja 1"] } : {}),
    };
    setFields((prev) => [...prev, newField]);
  };

  const updateField = (id: string, updates: Partial<ConsultationField>) => {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      toast.error("Podaj nazwę szablonu");
      return;
    }
    if (fields.length === 0) {
      toast.error("Dodaj przynajmniej jedno pole");
      return;
    }
    if (isDemo) {
      toast.success("Demo: Szablon zapisany!");
      return;
    }
    saveTemplate.mutate({ name: templateName, fields, id: editingId || undefined });
    setTemplateName("");
    setFields([]);
    setEditingId(null);
  };

  const deploySystemTemplate = (tpl: (typeof SYSTEM_TEMPLATES)[number]) => {
    if (isDemo) {
      toast.success(`Demo: Szablon "${tpl.name}" wdrożony!`);
      return;
    }
    saveTemplate.mutate({ name: tpl.name, fields: tpl.fields as ConsultationField[] });
  };

  const editTemplate = (tpl: { id: string; name: string; fields: ConsultationField[] }) => {
    setEditingId(tpl.id);
    setTemplateName(tpl.name);
    setFields(tpl.fields);
  };

  const fieldIcon = (type: string) => {
    const found = FIELD_TYPES.find((f) => f.value === type);
    return found ? <found.icon className="w-4 h-4" /> : <Type className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      {/* System templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-primary" />
            Gotowe szablony (1 klik)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SYSTEM_TEMPLATES.map((tpl) => (
              <Button
                key={tpl.name}
                variant="outline"
                className="h-auto py-3 flex-col items-start gap-1 text-left"
                onClick={() => deploySystemTemplate(tpl)}
              >
                <span className="font-medium text-sm">{tpl.name}</span>
                <span className="text-xs text-muted-foreground">{tpl.fields.length} pól</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Builder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {editingId ? "Edytuj szablon" : "Stwórz nowy szablon"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nazwa szablonu</Label>
            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="np. Karta konsultacyjna - mezoterapia"
            />
          </div>

          {/* Add field */}
          <div>
            <Label>Dodaj pole</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FIELD_TYPES.map((ft) => (
                <Button
                  key={ft.value}
                  variant="outline"
                  size="sm"
                  className="gap-1"
                  onClick={() => addField(ft.value as ConsultationField["type"])}
                >
                  <ft.icon className="w-3.5 h-3.5" />
                  {ft.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Field list */}
          {fields.length > 0 && (
            <div className="space-y-3">
              <Label>Pola formularza ({fields.length})</Label>
              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-start gap-2 p-3 rounded-lg border bg-muted/30">
                  <GripVertical className="w-4 h-4 mt-2.5 text-muted-foreground cursor-grab" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      {fieldIcon(field.type)}
                      <Badge variant="secondary" className="text-xs">{FIELD_TYPES.find((f) => f.value === field.type)?.label}</Badge>
                    </div>
                    <Input
                      value={field.label}
                      onChange={(e) => updateField(field.id, { label: e.target.value })}
                      placeholder="Etykieta pola"
                      className="text-sm"
                    />
                    {["select", "multiselect"].includes(field.type) && (
                      <Input
                        value={(field.options || []).join(", ")}
                        onChange={(e) => updateField(field.id, { options: e.target.value.split(",").map((s) => s.trim()) })}
                        placeholder="Opcje oddzielone przecinkami"
                        className="text-sm"
                      />
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removeField(field.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleSave} disabled={saveTemplate.isPending} className="w-full">
            {editingId ? "Zaktualizuj szablon" : "Zapisz szablon"}
          </Button>
        </CardContent>
      </Card>

      {/* Existing templates */}
      {(isDemo ? SYSTEM_TEMPLATES : templates).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Twoje szablony
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(isDemo
                ? SYSTEM_TEMPLATES.map((t, i) => ({ id: `demo-${i}`, name: t.name, fields: t.fields as ConsultationField[], is_system: true, is_active: true, salon_id: "", created_at: "", updated_at: "" }))
                : templates
              ).map((tpl) => (
                <div key={tpl.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium text-sm">{tpl.name}</p>
                    <p className="text-xs text-muted-foreground">{tpl.fields.length} pól</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => editTemplate(tpl)}>
                    Edytuj
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
