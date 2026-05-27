import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, ChevronLeft, ChevronRight, Sparkles, Tag, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { WidgetServiceSelector } from "./WidgetServiceSelector";
import {
  BookingWidget,
  WidgetTheme,
  defaultFormFields,
  defaultWidgetSteps,
  defaultWidgetTheme,
} from "./types";

interface QuickWidgetCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (widget: BookingWidget) => void;
  defaultTheme?: WidgetTheme;
  salonName?: string;
  isDemo?: boolean;
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
}

export function QuickWidgetCreateModal({
  isOpen,
  onClose,
  onCreate,
  defaultTheme,
  salonName,
  isDemo = false,
}: QuickWidgetCreateModalProps) {
  const baseTheme = defaultTheme || defaultWidgetTheme;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [showAllServices, setShowAllServices] = useState(false);
  const [promoType, setPromoType] = useState<"none" | "percentage" | "fixed">("none");
  const [promoValue, setPromoValue] = useState<number>(10);
  const [promoCode, setPromoCode] = useState("");
  const [validTo, setValidTo] = useState<string>("");
  const [accentColor, setAccentColor] = useState(baseTheme.primaryColor);
  const [ctaText, setCtaText] = useState("Zarezerwuj termin");

  const reset = () => {
    setStep(1);
    setName("");
    setServiceIds([]);
    setShowAllServices(false);
    setPromoType("none");
    setPromoValue(10);
    setPromoCode("");
    setValidTo("");
    setAccentColor(baseTheme.primaryColor);
    setCtaText("Zarezerwuj termin");
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 200);
  };

  const canNext1 = name.trim().length >= 2;
  const canNext2 = showAllServices || serviceIds.length > 0;

  const handleCreate = () => {
    const baseSlug = slugify(name) || `kampania-${Date.now().toString(36)}`;
    const widget: BookingWidget = {
      id: "new",
      name: name.trim(),
      slug: baseSlug,
      description: undefined,
      type: promoType !== "none" ? "promo" : "campaign",
      isActive: true,
      services: showAllServices ? [] : serviceIds,
      showAllServices,
      theme: {
        ...baseTheme,
        primaryColor: accentColor,
        headerText: salonName ? `${salonName} — ${name.trim()}` : name.trim(),
      },
      formFields: defaultFormFields,
      steps: defaultWidgetSteps,
      promotion:
        promoType === "none"
          ? undefined
          : {
              id: `promo-${Date.now().toString(36)}`,
              name: name.trim(),
              type: promoType,
              value: promoValue,
              code: promoCode.trim() || undefined,
              validTo: validTo ? new Date(validTo) : undefined,
              applicableServices: showAllServices ? [] : serviceIds,
              isActive: true,
              usedCount: 0,
            },
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0,
      bookingCount: 0,
    };
    onCreate(widget);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Nowa kampania — szybki kreator
          </DialogTitle>
          <div className="flex items-center gap-2 mt-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex-1 flex items-center gap-2">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                    n < step && "bg-primary text-primary-foreground",
                    n === step && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    n > step && "bg-muted text-muted-foreground"
                  )}
                >
                  {n < step ? <Check className="w-3.5 h-3.5" /> : n}
                </div>
                {n < 3 && <div className={cn("flex-1 h-0.5", n < step ? "bg-primary" : "bg-muted")} />}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* STEP 1 — name */}
        {step === 1 && (
          <div className="space-y-4 py-2">
            <div>
              <Label>Nazwa kampanii *</Label>
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="np. Promocja walentynkowa, Reels Instagram – luty"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Widoczna tylko dla Ciebie. Pomaga oddzielić ruch z różnych źródeł.
              </p>
            </div>
            {name.trim() && (
              <div className="p-3 rounded-lg bg-muted/40 border border-border text-xs">
                <span className="text-muted-foreground">Link rezerwacji:</span>{" "}
                <span className="font-mono">…/s/{slugify(name) || "kampania"}</span>
              </div>
            )}
          </div>
        )}

        {/* STEP 2 — services + promo */}
        {step === 2 && (
          <div className="space-y-4 py-2 max-h-[55vh] overflow-y-auto">
            <WidgetServiceSelector
              selectedIds={serviceIds}
              onChange={setServiceIds}
              showAllServices={showAllServices}
              onShowAllChange={setShowAllServices}
              isDemo={isDemo}
              variant="compact"
            />

            <div className="border-t border-border pt-4">
              <Label className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4" /> Promocja (opcjonalnie)
              </Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={promoType === "none" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPromoType("none")}
                >
                  Brak
                </Button>
                <Button
                  type="button"
                  variant={promoType === "percentage" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPromoType("percentage")}
                >
                  Rabat %
                </Button>
                <Button
                  type="button"
                  variant={promoType === "fixed" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPromoType("fixed")}
                >
                  Kwota (zł)
                </Button>
              </div>
              {promoType !== "none" && (
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div>
                    <Label className="text-xs">Wartość</Label>
                    <Input
                      type="number"
                      min={0}
                      value={promoValue}
                      onChange={(e) => setPromoValue(Number(e.target.value) || 0)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Kod (opcj.)</Label>
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="WALENTYNKI"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Ważne do</Label>
                    <Input type="date" value={validTo} onChange={(e) => setValidTo(e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3 — branding */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <div>
              <Label className="flex items-center gap-2"><Palette className="w-4 h-4" /> Kolor akcentu</Label>
              <div className="flex items-center gap-3 mt-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-14 h-10 rounded-lg border border-border cursor-pointer"
                />
                <Input
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            <div>
              <Label>Tekst na przycisku rezerwacji</Label>
              <Input
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="Zarezerwuj termin"
              />
            </div>
            <div className="border border-border rounded-xl p-6 flex flex-col items-center gap-3 bg-muted/20">
              <p className="text-xs text-muted-foreground uppercase tracking-widest">Podgląd</p>
              <button
                type="button"
                className="px-6 py-3 rounded-xl text-white font-semibold shadow-md transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: accentColor }}
              >
                {ctaText || "Zarezerwuj termin"}
              </button>
              {promoType !== "none" && (
                <Badge variant="secondary" className="mt-1">
                  {promoType === "percentage" ? `−${promoValue}%` : `−${promoValue} zł`}
                  {promoCode && ` · ${promoCode}`}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Pozostałe ustawienia (pola formularza, kroki, integracje) skopiujemy z głównego widgetu.
              Możesz je dostroić w „Edytuj zaawansowane".
            </p>
          </div>
        )}

        <DialogFooter className="!justify-between gap-2">
          {step > 1 ? (
            <Button variant="outline" onClick={() => setStep((step - 1) as 1 | 2 | 3)} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Wstecz
            </Button>
          ) : (
            <Button variant="outline" onClick={handleClose}>Anuluj</Button>
          )}
          {step < 3 ? (
            <Button
              variant="luxury"
              onClick={() => setStep((step + 1) as 1 | 2 | 3)}
              disabled={(step === 1 && !canNext1) || (step === 2 && !canNext2)}
              className="gap-1"
            >
              Dalej <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button variant="luxury" onClick={handleCreate} className="gap-2">
              <Sparkles className="w-4 h-4" /> Utwórz kampanię
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}