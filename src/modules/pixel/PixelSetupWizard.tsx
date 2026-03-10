import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, ExternalLink, Zap, ArrowRight, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_MAP } from "./types";

interface PixelSetupWizardProps {
  isDemo?: boolean;
  onComplete?: () => void;
}

export function PixelSetupWizard({ isDemo, onComplete }: PixelSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [pixelId, setPixelId] = useState(isDemo ? "123456789012345" : "");
  const [adAccountId, setAdAccountId] = useState(isDemo ? "act_987654321" : "");
  const [eventToggles, setEventToggles] = useState<Record<string, boolean>>({
    booking_completed: true,
    booking_cancelled: true,
    no_show: true,
    new_client: true,
    reactivation: true,
    return_30d: false,
  });

  const steps = [
    { num: 1, label: "Połącz Meta" },
    { num: 2, label: "Zmapuj tagi" },
    { num: 3, label: "Pixel Conditioning" },
  ];

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
              step === s.num ? "bg-primary text-primary-foreground" :
              step > s.num ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
            )}>
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {s.label}
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
          </div>
        ))}
      </div>

      {/* Step 1: Connect Meta */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Połącz Meta Business
            </CardTitle>
            <CardDescription>
              Podłącz swój Pixel i konto reklamowe Meta, aby automatycznie synchronizować dane klientek.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isDemo && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <strong>Tryb demo</strong> — dane są symulowane. W produkcji: OAuth z Meta Business Manager.
              </div>
            )}
            <div className="space-y-2">
              <Label>Meta Pixel ID</Label>
              <Input
                placeholder="np. 123456789012345"
                value={pixelId}
                onChange={(e) => setPixelId(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Ad Account ID</Label>
              <Input
                placeholder="np. act_987654321"
                value={adAccountId}
                onChange={(e) => setAdAccountId(e.target.value)}
              />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted text-sm">
              <Shield className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <span>Token dostępu jest szyfrowany i przechowywany bezpiecznie. Nigdy nie wysyłamy danych osobowych — tylko hasze SHA256.</span>
            </div>
            <Button
              className="w-full"
              disabled={!pixelId || !adAccountId}
              onClick={() => setStep(2)}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {isDemo ? "Symuluj połączenie" : "Połącz z Meta Business"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Map tags (simplified - points to AudienceMappings) */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Zmapuj tagi CRM → Audiences</CardTitle>
            <CardDescription>
              Skonfiguruj automatyczne mapowanie tagów klientek na Custom Audiences w Meta.
              Ten krok można dokończyć później w zakładce "Audiences".
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Rekomendowane mapowania zostaną utworzone automatycznie:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {["VIP", "No-show", "90+ dni", "Nowe", "Aktywne (Exclude)"].map((name) => (
                  <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Wstecz</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Dalej</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Pixel Conditioning */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Włącz Pixel Conditioning</CardTitle>
            <CardDescription>
              Zdarzenia z kalendarza będą automatycznie wysyłane do Meta Conversions API (server-side).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(EVENT_TYPE_MAP).map(([key, { label, metaEvent }]) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">→ {metaEvent}</p>
                </div>
                <Switch
                  checked={eventToggles[key] ?? false}
                  onCheckedChange={(v) => setEventToggles({ ...eventToggles, [key]: v })}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Wstecz</Button>
              <Button onClick={onComplete} className="flex-1">
                <Zap className="w-4 h-4 mr-2" />
                Aktywuj Pixel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
