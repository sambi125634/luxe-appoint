import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Trash2, GripVertical, ArrowLeft, ArrowRight, Save,
  Type, ToggleLeft, SlidersHorizontal, ListChecks, PenTool
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ConsultationField, useSaveTemplate } from "@/hooks/useConsultations";
import { useServices } from "@/hooks/useServices";
import { useSaveServiceConsultationCards } from "@/hooks/useConsultationSends";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TemplateGallery } from "./TemplateGallery";
import { TEMPLATE_LIBRARY } from "./templateLibrary";

const CATEGORIES = [
  { id: "general", label: "Ogólna", emoji: "✨" },
  { id: "face", label: "Twarz", emoji: "💆" },
  { id: "nails", label: "Paznokcie", emoji: "💅" },
  { id: "hair", label: "Włosy", emoji: "💇" },
  { id: "medical", label: "Medyczna", emoji: "🏥" },
  { id: "rodo", label: "RODO", emoji: "📋" },
  { id: "custom", label: "Własna", emoji: "✏️" },
];

const TIME_OPTIONS = [
  { value: "2", label: "< 2 min" },
  { value: "3", label: "2-5 min" },
  { value: "7", label: "5-10 min" },
];

const PRESET_QUESTIONS: Record<string, { label: string; type: ConsultationField["type"]; options?: string[] }[]> = {
  "💊 Zdrowie i leki": [
    { label: "Czy przyjmuje leki na stałe?", type: "textarea" },
    { label: "Czy jest w ciąży lub karmi?", type: "select", options: ["Tak", "Nie"] },
    { label: "Choroby przewlekłe?", type: "textarea" },
    { label: "Alergie na kosmetyki?", type: "textarea" },
    { label: "Przebyte operacje w okolicy zabiegu?", type: "textarea" },
  ],
  "💆 Skóra i zabiegi": [
    { label: "Jaki jest typ skóry?", type: "select", options: ["Sucha", "Tłusta", "Mieszana", "Normalna", "Wrażliwa"] },
    { label: "Czy stosuje retinoidy/AHA/BHA?", type: "select", options: ["Tak", "Nie"] },
    { label: "Ostatni zabieg w gabinecie?", type: "text" },
    { label: "Oczekiwania po zabiegu?", type: "textarea" },
    { label: "Wrażliwa skóra na słońce?", type: "select", options: ["Tak", "Nie"] },
  ],
  "💅 Paznokcie": [
    { label: "Czy ma grzybicę paznokci?", type: "select", options: ["Tak", "Nie"] },
    { label: "Uczulenie na akryl/żel?", type: "select", options: ["Tak", "Nie"] },
    { label: "Jak często wykonuje manicure?", type: "text" },
    { label: "Preferowany kształt paznokci?", type: "select", options: ["Migdał", "Kwadrat", "Owal", "Balerina", "Naturalny"] },
  ],
  "💇 Włosy": [
    { label: "Aktualny kolor/chemiczne zabiegi?", type: "textarea" },
    { label: "Uczulenie na farbę?", type: "select", options: ["Tak", "Nie"] },
    { label: "Stan włosów (suche/przetłuszczone)?", type: "select", options: ["Suche", "Normalne", "Przetłuszczone", "Zniszczone"] },
    { label: "Oczekiwany efekt?", type: "textarea" },
  ],
  "📋 Zgody": [
    { label: "Zgoda na wykonanie zabiegu", type: "signature" },
    { label: "Zgoda na dokumentację fotograficzną", type: "select", options: ["Tak", "Nie"] },
    { label: "Zgoda na przetwarzanie danych zdrowotnych", type: "select", options: ["Tak", "Nie"] },
    { label: "Potwierdzam prawdziwość podanych informacji", type: "signature" },
  ],
};

const EXTRA_PRESETS: Record<string, { label: string; type: ConsultationField["type"]; options?: string[] }[]> = {
  "🩺 Wywiad medyczny": [
    { label: "Cukrzyca?", type: "select", options: ["Tak", "Nie"] },
    { label: "Zaburzenia krzepliwości krwi?", type: "select", options: ["Tak", "Nie"] },
    { label: "Leki przeciwzakrzepowe?", type: "select", options: ["Tak", "Nie"] },
    { label: "Rozrusznik serca / implanty metalowe?", type: "select", options: ["Tak", "Nie"] },
    { label: "Choroby autoimmunologiczne?", type: "textarea" },
  ],
  "🧒 Niepełnoletni / pediatria": [
    { label: "Imię i nazwisko rodzica / opiekuna", type: "text" },
    { label: "Data urodzenia dziecka", type: "text" },
    { label: "Zgoda rodzica na zabieg", type: "signature" },
  ],
  "📸 Foto i social media": [
    { label: "Zgoda na wykonanie zdjęć przed/po", type: "select", options: ["Tak", "Nie"] },
    { label: "Zgoda na publikację w social media", type: "select", options: ["Tak", "Nie"] },
    { label: "Zgoda na publikację z zakrytą twarzą", type: "select", options: ["Tak", "Nie"] },
  ],
  "🌡 Przeciwwskazania sezonowe": [
    { label: "Świeże opalanie / solarium (ostatnie 14 dni)?", type: "select", options: ["Tak", "Nie"] },
    { label: "Ciąża lub karmienie piersią?", type: "select", options: ["Tak", "Nie"] },
    { label: "Aktywna opryszczka?", type: "select", options: ["Tak", "Nie"] },
  ],
  "⭐ Ankieta po wizycie": [
    { label: "Jak oceniasz wizytę? (1-10)", type: "slider" },
    { label: "Czy polecisz nas znajomym? (0-10)", type: "slider" },
    { label: "Co możemy poprawić?", type: "textarea" },
    { label: "Co Ci się szczególnie podobało?", type: "textarea" },
  ],
};

const ALL_PRESETS = { ...PRESET_QUESTIONS, ...EXTRA_PRESETS };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDemo?: boolean;
  editTemplate?: { id: string; name: string; fields: ConsultationField[]; category?: string; estimated_minutes?: number } | null;
  /** Pre-fill from a library template (Utwórz z szablonu flow) */
  presetTemplateId?: string | null;
  /** When true, opens the scratch starter chooser (Step 0) */
  scratchMode?: boolean;
}

export function EasyCardBuilder({ isOpen, onClose, isDemo, editTemplate, presetTemplateId, scratchMode }: Props) {
  // Hydrate from library template if provided
  const libraryTpl = presetTemplateId
    ? TEMPLATE_LIBRARY.find((t) => t.id === presetTemplateId)
    : undefined;

  // Step 0 = scratch starter chooser (only for true scratch with no preset)
  const initialStep = scratchMode && !libraryTpl && !editTemplate ? 0 : 1;

  const [step, setStep] = useState(initialStep);
  const [name, setName] = useState(editTemplate?.name || libraryTpl?.name || "");
  const [category, setCategory] = useState(editTemplate?.category || libraryTpl?.dbCategory || "general");
  const [estimatedMinutes, setEstimatedMinutes] = useState(
    String(editTemplate?.estimated_minutes || libraryTpl?.estimatedMinutes || 3)
  );
  const [fields, setFields] = useState<ConsultationField[]>(
    editTemplate?.fields ||
      (libraryTpl ? libraryTpl.fields.map((f) => ({ ...f, id: crypto.randomUUID() })) : [])
  );
  const [showLibraryPicker, setShowLibraryPicker] = useState(false);
  const [sendTiming, setSendTiming] = useState("before_appointment");
  const [isRequired, setIsRequired] = useState(true);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [showCustomField, setShowCustomField] = useState(false);
  const [customLabel, setCustomLabel] = useState("");
  const [customType, setCustomType] = useState<ConsultationField["type"]>("text");

  const saveTemplate = useSaveTemplate();
  const { data: services = [] } = useServices();
  const saveAssignments = useSaveServiceConsultationCards();

  const addPreset = (q: { label: string; type: ConsultationField["type"]; options?: string[] }) => {
    if (fields.some(f => f.label === q.label)) return;
    setFields(prev => [...prev, {
      id: crypto.randomUUID(),
      type: q.type,
      label: q.label,
      required: true,
      ...(q.options ? { options: q.options } : {}),
      ...(q.type === "slider" ? { min: 1, max: 10 } : {}),
    }]);
  };

  const addCustom = () => {
    if (!customLabel.trim()) return;
    setFields(prev => [...prev, {
      id: crypto.randomUUID(),
      type: customType,
      label: customLabel,
      required: false,
    }]);
    setCustomLabel("");
    setShowCustomField(false);
  };

  const removeField = (id: string) => setFields(prev => prev.filter(f => f.id !== id));

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Podaj nazwę karty"); return; }
    if (fields.length === 0) { toast.error("Dodaj przynajmniej jedno pytanie"); return; }
    if (isDemo) {
      toast.success(`Demo: Karta "${name}" zapisana!`);
      onClose();
      return;
    }
    saveTemplate.mutate(
      { name, fields, id: editTemplate?.id },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case "text": case "textarea": return <Type className="w-3.5 h-3.5" />;
      case "select": case "multiselect": return <ListChecks className="w-3.5 h-3.5" />;
      case "slider": return <SlidersHorizontal className="w-3.5 h-3.5" />;
      case "signature": return <PenTool className="w-3.5 h-3.5" />;
      default: return <Type className="w-3.5 h-3.5" />;
    }
  };

  const categoryEmoji = CATEGORIES.find(c => c.id === category)?.emoji || "✨";

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editTemplate
              ? "Edytuj kartę"
              : libraryTpl
              ? `Szablon: ${libraryTpl.name}`
              : showLibraryPicker
              ? "Wybierz gotowy szablon"
              : "Utwórz kartę konsultacyjną"}
          </DialogTitle>
        </DialogHeader>

        {/* Library picker overlay */}
        {showLibraryPicker && (
          <div className="space-y-4">
            <TemplateGallery
              onPick={(tpl) => {
                setName(tpl.name);
                setCategory(tpl.dbCategory);
                setEstimatedMinutes(String(tpl.estimatedMinutes));
                setFields(tpl.fields.map((f) => ({ ...f, id: crypto.randomUUID() })));
                setShowLibraryPicker(false);
                setStep(1);
              }}
            />
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setShowLibraryPicker(false)}>
                Wróć
              </Button>
            </div>
          </div>
        )}

        {/* STEP 0 — scratch starter chooser */}
        {!showLibraryPicker && step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Od czego chcesz zacząć?</p>
            <div className="grid sm:grid-cols-3 gap-3">
              <button
                onClick={() => setStep(1)}
                className="text-left p-5 rounded-xl border-2 border-transparent bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-2xl">📝</span>
                <p className="font-medium text-sm mt-2">Pusta karta</p>
                <p className="text-xs text-muted-foreground mt-1">Zacznij od zera — pełna kontrola</p>
              </button>
              <button
                onClick={() => { setStep(2); }}
                className="text-left p-5 rounded-xl border-2 border-transparent bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-2xl">💡</span>
                <p className="font-medium text-sm mt-2">Podpowiedz pytania</p>
                <p className="text-xs text-muted-foreground mt-1">Buduj klikając gotowe bloki</p>
              </button>
              <button
                onClick={() => setShowLibraryPicker(true)}
                className="text-left p-5 rounded-xl border-2 border-transparent bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="text-2xl">⭐</span>
                <p className="font-medium text-sm mt-2">Gotowy szablon</p>
                <p className="text-xs text-muted-foreground mt-1">{TEMPLATE_LIBRARY.length} szablonów z biblioteki</p>
              </button>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={onClose}>Anuluj</Button>
            </div>
          </div>
        )}

        {/* Step indicators */}
        {!showLibraryPicker && step >= 1 && (
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3].map(s => (
            <div key={s} className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              step === s ? "bg-primary text-primary-foreground" : step > s ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {s}. {s === 1 ? "Podstawy" : s === 2 ? "Pytania" : "Ustawienia"}
            </div>
          ))}
        </div>
        )}

        {/* STEP 1 */}
        {!showLibraryPicker && step === 1 && (
          <div className="space-y-5">
            {!editTemplate && !libraryTpl && (
              <button
                onClick={() => setShowLibraryPicker(true)}
                className="text-xs text-primary hover:underline"
              >
                ⭐ Albo wybierz gotowy szablon z biblioteki →
              </button>
            )}
            <div>
              <Label>Jak chcesz nazwać tę kartę?</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="np. Karta przed zabiegiem twarzy" className="mt-1" />
            </div>
            <div>
              <Label>Kategoria</Label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                {CATEGORIES.map(c => (
                  <button key={c.id} onClick={() => setCategory(c.id)} className={cn(
                    "flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-sm",
                    category === c.id ? "border-primary bg-primary/5" : "border-transparent bg-muted/50 hover:bg-muted"
                  )}>
                    <span className="text-xl">{c.emoji}</span>
                    <span className="text-xs">{c.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Szacowany czas wypełnienia</Label>
              <div className="flex gap-2 mt-2">
                {TIME_OPTIONS.map(t => (
                  <button key={t.value} onClick={() => setEstimatedMinutes(t.value)} className={cn(
                    "px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all",
                    estimatedMinutes === t.value ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                  )}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)} className="gap-2">
                Dalej <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {!showLibraryPicker && step === 2 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left: presets */}
              <div className="space-y-4">
                <p className="text-sm font-medium">Kliknij gotowe pytanie aby dodać</p>
                {Object.entries(ALL_PRESETS).map(([group, questions]) => (
                  <div key={group}>
                    <p className="text-sm font-semibold mb-2">{group}</p>
                    <div className="space-y-1">
                      {questions.map(q => {
                        const added = fields.some(f => f.label === q.label);
                        return (
                          <button key={q.label} onClick={() => addPreset(q)} disabled={added} className={cn(
                            "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                            added ? "bg-primary/10 text-primary line-through opacity-60" : "bg-muted/50 hover:bg-muted"
                          )}>
                            {added ? "✓" : "+"} {q.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!showCustomField ? (
                  <Button variant="outline" size="sm" onClick={() => setShowCustomField(true)} className="gap-1">
                    <Plus className="w-3.5 h-3.5" /> Dodaj własne pytanie
                  </Button>
                ) : (
                  <Card>
                    <CardContent className="pt-4 space-y-3">
                      <Input value={customLabel} onChange={e => setCustomLabel(e.target.value)} placeholder="Treść pytania" />
                      <div className="flex gap-2 flex-wrap">
                        {(["text", "select", "slider", "signature"] as const).map(t => (
                          <button key={t} onClick={() => setCustomType(t)} className={cn(
                            "px-3 py-1.5 rounded-md text-xs font-medium border transition-all",
                            customType === t ? "border-primary bg-primary/10" : "border-transparent bg-muted"
                          )}>
                            {t === "text" ? "Tekst" : t === "select" ? "Tak/Nie" : t === "slider" ? "Skala 1-5" : "Podpis"}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={addCustom}>Dodaj</Button>
                        <Button size="sm" variant="ghost" onClick={() => setShowCustomField(false)}>Anuluj</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Right: preview */}
              <div>
                <p className="text-sm font-medium mb-3">Podgląd karty ({fields.length} pytań)</p>
                <div className="border rounded-xl p-4 bg-muted/20 space-y-2 min-h-[200px]">
                  {fields.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">Dodaj pytania z lewej strony</p>
                  )}
                  {fields.map((f, i) => (
                    <div key={f.id} className="flex items-center gap-2 p-2 rounded-lg bg-background border">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <span className="text-xs text-muted-foreground">{i + 1}.</span>
                      {typeIcon(f.type)}
                      <span className="text-sm flex-1 truncate">{f.label}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeField(f.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(Math.max(initialStep, 1))} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Wstecz
              </Button>
              <Button onClick={() => setStep(3)} className="gap-2" disabled={fields.length === 0}>
                Dalej <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {!showLibraryPicker && step === 3 && (
          <div className="space-y-5">
            <div>
              <Label>Przypisz do usług (opcjonalnie)</Label>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {(isDemo ? [
                  { id: "s1", name: "Mezoterapia" },
                  { id: "s2", name: "Manicure hybrydowy" },
                  { id: "s3", name: "Koloryzacja włosów" },
                ] : services).map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedServices.includes(s.id)}
                      onChange={e => setSelectedServices(prev =>
                        e.target.checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                      )}
                      className="rounded border-border"
                    />
                    <span className="text-sm">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Kiedy wysyłać?</Label>
              <div className="flex gap-2 mt-2">
                {[
                  { v: "at_booking", l: "🔔 Przy rezerwacji" },
                  { v: "before_appointment", l: "⏰ 24h przed" },
                  { v: "manual_only", l: "📋 Tylko ręcznie" },
                ].map(o => (
                  <button key={o.v} onClick={() => setSendTiming(o.v)} className={cn(
                    "px-4 py-2 rounded-lg border-2 text-sm transition-all",
                    sendTiming === o.v ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                  )}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={isRequired} onCheckedChange={setIsRequired} />
              <Label>Karta wymagana do rozpoczęcia wizyty</Label>
            </div>

            <div className="border rounded-xl p-4 bg-muted/20">
              <p className="text-sm font-medium mb-2">Podsumowanie</p>
              <p className="text-sm text-muted-foreground">
                {categoryEmoji} <strong>{name || "Bez nazwy"}</strong> · {fields.length} pytań · ~{estimatedMinutes} min
              </p>
              {selectedServices.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Przypisana do {selectedServices.length} usług · Wysyłka: {sendTiming === "at_booking" ? "przy rezerwacji" : sendTiming === "before_appointment" ? "24h przed" : "ręcznie"}
                </p>
              )}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Wstecz
              </Button>
              <Button onClick={handleSave} disabled={saveTemplate.isPending} className="gap-2">
                <Save className="w-4 h-4" /> Zapisz kartę
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
