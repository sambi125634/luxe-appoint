import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, PenTool, Check } from "lucide-react";
import { ConsultationField } from "@/hooks/useConsultations";

const MEDICAL_FLAGS = [
  "Ciąża",
  "Karmienie piersią",
  "Leki rozrzedzające krew",
  "Uczulenie na lateks",
  "Uczulenie na nikiel",
  "Cukrzyca",
  "Epilepsja",
  "Choroby autoimmunologiczne",
  "Inne (opisz poniżej)",
];

interface Props {
  fields: ConsultationField[];
  onSubmit: (responses: Record<string, unknown>, signatureDataUrl: string | null, redFlags: string[]) => void;
  onCancel?: () => void;
}

export function CardFillForm({ fields, onSubmit, onCancel }: Props) {
  const [responses, setResponses] = useState<Record<string, unknown>>({});
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  const setValue = (fieldId: string, value: unknown) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  // Signature canvas
  const startDraw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }, []);

  const draw = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  }, []);

  const endDraw = useCallback(() => {
    isDrawing.current = false;
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL("image/png"));
    }
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData(null);
  };

  const handleSubmit = () => {
    // Collect red flags from medical fields
    const redFlags: string[] = [];
    fields.forEach((f) => {
      if (f.type === "medical") {
        const selected = (responses[f.id] as string[]) || [];
        selected.forEach((flag) => redFlags.push(`⚠️ ${flag}`));
      }
      // Check for allergy-related text
      if ((f.type === "text" || f.type === "textarea") && f.label.toLowerCase().includes("alerg")) {
        const val = responses[f.id] as string;
        if (val?.trim()) redFlags.push(`⚠️ ${val.trim()}`);
      }
    });
    onSubmit(responses, signatureData, redFlags);
  };

  const renderField = (field: ConsultationField) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={(responses[field.id] as string) || ""}
            onChange={(e) => setValue(field.id, e.target.value)}
            placeholder={field.placeholder || field.label}
          />
        );
      case "textarea":
        return (
          <Textarea
            value={(responses[field.id] as string) || ""}
            onChange={(e) => setValue(field.id, e.target.value)}
            placeholder={field.placeholder || field.label}
            rows={3}
          />
        );
      case "select":
        return (
          <Select value={(responses[field.id] as string) || ""} onValueChange={(v) => setValue(field.id, v)}>
            <SelectTrigger><SelectValue placeholder="Wybierz..." /></SelectTrigger>
            <SelectContent>
              {(field.options || []).map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "multiselect":
        return (
          <div className="flex flex-wrap gap-2">
            {(field.options || []).map((opt) => {
              const selected = ((responses[field.id] as string[]) || []).includes(opt);
              return (
                <Badge
                  key={opt}
                  variant={selected ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => {
                    const current = (responses[field.id] as string[]) || [];
                    setValue(field.id, selected ? current.filter((v) => v !== opt) : [...current, opt]);
                  }}
                >
                  {selected && <Check className="w-3 h-3 mr-1" />}
                  {opt}
                </Badge>
              );
            })}
          </div>
        );
      case "slider":
        return (
          <div className="space-y-2">
            <Slider
              value={[(responses[field.id] as number) || field.min || 1]}
              min={field.min || 1}
              max={field.max || 10}
              step={1}
              onValueChange={([v]) => setValue(field.id, v)}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{field.min || 1}</span>
              <span className="font-medium text-foreground">{(responses[field.id] as number) || field.min || 1}</span>
              <span>{field.max || 10}</span>
            </div>
          </div>
        );
      case "photo":
        return (
          <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
            <p className="text-sm">Przeciągnij zdjęcie lub kliknij</p>
            <Input type="file" accept="image/*" className="mt-2" onChange={(e) => setValue(field.id, e.target.files?.[0]?.name)} />
          </div>
        );
      case "signature":
        return (
          <div className="space-y-2">
            <div className="border rounded-lg overflow-hidden bg-background">
              <canvas
                ref={canvasRef}
                width={320}
                height={150}
                className="w-full touch-none cursor-crosshair"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearSignature}>
                Wyczyść podpis
              </Button>
              {signatureData && (
                <Badge variant="default" className="gap-1">
                  <PenTool className="w-3 h-3" /> Podpisano
                </Badge>
              )}
            </div>
          </div>
        );
      case "medical":
        return (
          <div className="space-y-2 p-3 rounded-lg border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2 text-destructive mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span className="font-medium text-sm">Przeciwwskazania medyczne</span>
            </div>
            {MEDICAL_FLAGS.map((flag) => {
              const selected = ((responses[field.id] as string[]) || []).includes(flag);
              return (
                <div key={flag} className="flex items-center gap-2">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={(checked) => {
                      const current = (responses[field.id] as string[]) || [];
                      setValue(field.id, checked ? [...current, flag] : current.filter((f) => f !== flag));
                    }}
                  />
                  <span className="text-sm">{flag}</span>
                </div>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wypełnij kartę konsultacyjną</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label>{field.label} {field.required && <span className="text-destructive">*</span>}</Label>
            {renderField(field)}
          </div>
        ))}

        <div className="flex gap-3">
          <Button onClick={handleSubmit} className="flex-1">
            Zapisz kartę
          </Button>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
