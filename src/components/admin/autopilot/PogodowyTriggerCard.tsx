import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudRain, Settings2, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PogodowyTriggerCardProps {
  isDemo?: boolean;
}

type SendTiming = "friday" | "dayBefore" | "sameDay";
type Audience = "thisWeek" | "dormant14" | "all";
type ForecastDay = "tomorrow" | "weekend" | "next3";

const WEATHER_OPTIONS = [
  { id: "rain", label: "Deszcz", defaultChecked: true },
  { id: "storm", label: "Burza", defaultChecked: true },
  { id: "cloudy", label: "Pochmurno", defaultChecked: false },
  { id: "snow", label: "Śnieg", defaultChecked: false },
] as const;

const VARIABLES = ["{IMIĘ}", "{LINK}", "{SALON}", "{POGODA}"] as const;

const DEFAULT_TEMPLATE =
  "Ten weekend zapowiada się deszczowo ☔ Idealny moment żeby zadbać o siebie. Mam wolne sloty — zarezerwuj tutaj: {LINK}";

function renderPreview(template: string) {
  return template
    .replace(/\{IMIĘ\}/g, "Anna")
    .replace(/\{LINK\}/g, "cal.bf/helena")
    .replace(/\{SALON\}/g, "Helena Studio")
    .replace(/\{POGODA\}/g, "deszcz");
}

export function PogodowyTriggerCard({ isDemo }: PogodowyTriggerCardProps) {
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState(false);

  // Section A
  const [weather, setWeather] = useState<Record<string, boolean>>(
    Object.fromEntries(WEATHER_OPTIONS.map((w) => [w.id, w.defaultChecked]))
  );
  const [probability, setProbability] = useState(60);
  const [forecastDay, setForecastDay] = useState<ForecastDay>("weekend");

  // Section B
  const [timing, setTiming] = useState<SendTiming>("friday");
  const [sendAt, setSendAt] = useState("08:30");

  // Section C
  const [audience, setAudience] = useState<Audience>("thisWeek");
  const [excludeRecent, setExcludeRecent] = useState(true);

  // Section D
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  // Section E
  const [city, setCity] = useState("Warszawa");

  const charCount = template.length;
  const preview = useMemo(() => renderPreview(template), [template]);

  const insertVar = (v: string) => {
    setTemplate((t) => (t + " " + v).slice(0, 160));
  };

  const handleSave = () => {
    toast.success("Zapisano konfigurację Pogodowego Triggera™");
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-sky-50 via-white to-violet-50 p-5 shadow-sm",
          enabled ? "border-violet-200" : "border-gray-200 opacity-90"
        )}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-sky-300/30 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-2xl transition-colors",
                enabled
                  ? "bg-gradient-to-br from-sky-400 to-violet-500"
                  : "bg-gray-200"
              )}
            >
              <span aria-hidden>🌦️</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-foreground tracking-tight">
                  Pogodowy Trigger™
                </h3>
                <Badge className="bg-violet-600 hover:bg-violet-600 text-white text-[10px] h-5 px-2 rounded-full">
                  ELITE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Zamienia deszczowy weekend w pełny kalendarz
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-violet-600"
          />
        </div>

        {/* Live status + last triggered */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="relative mt-4 space-y-2"
            >
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-violet-200 px-3 py-1.5 shadow-sm">
                <motion.span
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="w-1.5 h-1.5 rounded-full bg-violet-500"
                />
                <span className="text-xs font-medium text-foreground">
                  Aktywny — sprawdzam prognozę codziennie o{" "}
                  <span className="font-bold text-violet-700">7:00</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ostatnio uruchomiony: <span className="font-medium text-foreground">23 maja</span>{" "}
                — wysłano <span className="font-bold text-violet-700">34 SMS</span> →{" "}
                <span className="font-bold text-emerald-600">6 rezerwacji</span>
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="relative mt-4 flex items-center justify-between">
          <span className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-violet-500" />
            Beauty Autopilot · SMS
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpen(true)}
            disabled={!enabled}
            className="h-8 text-xs font-medium gap-1.5 text-violet-700 hover:text-violet-800 hover:bg-violet-100"
          >
            <Settings2 className="w-3.5 h-3.5" />
            Konfiguruj
          </Button>
        </div>
      </motion.div>

      {/* Settings Drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[480px] p-0 flex flex-col bg-white"
        >
          <SheetHeader className="px-6 py-5 border-b border-border bg-gradient-to-r from-sky-50 via-white to-violet-50">
            <SheetTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-violet-600" />
              Konfiguracja Pogodowego Triggera™
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Section A */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Warunki pogodowe
              </h4>

              <div className="space-y-2">
                <Label className="text-sm">Uruchom gdy prognoza zawiera:</Label>
                <div className="flex flex-wrap gap-2">
                  {WEATHER_OPTIONS.map((w) => {
                    const checked = weather[w.id];
                    return (
                      <label
                        key={w.id}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer transition-colors text-sm",
                          checked
                            ? "bg-violet-100 text-violet-700"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(c) =>
                            setWeather((prev) => ({ ...prev, [w.id]: !!c }))
                          }
                          className="h-3.5 w-3.5"
                        />
                        {w.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Prawdopodobieństwo deszczu powyżej:</Label>
                  <span className="text-sm font-bold text-violet-700">{probability}%</span>
                </div>
                <Slider
                  value={[probability]}
                  onValueChange={([v]) => setProbability(v)}
                  min={40}
                  max={90}
                  step={5}
                  className="[&_[role=slider]]:bg-violet-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Sprawdzaj prognozę dla dnia:</Label>
                <Select value={forecastDay} onValueChange={(v) => setForecastDay(v as ForecastDay)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tomorrow">Jutro</SelectItem>
                    <SelectItem value="weekend">Tego weekendu</SelectItem>
                    <SelectItem value="next3">Najbliższych 3 dni</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            {/* Section B */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Timing wysyłki
              </h4>
              <RadioGroup
                value={timing}
                onValueChange={(v) => setTiming(v as SendTiming)}
                className="space-y-2"
              >
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="friday" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">
                        Wysyłaj w piątek rano (najlepsza konwersja)
                      </span>
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs h-5">
                        Rekomendowane
                      </Badge>
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="dayBefore" className="mt-0.5" />
                  <span className="text-sm font-medium">
                    Wysyłaj dzień wcześniej gdy wykryję deszcz
                  </span>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="sameDay" className="mt-0.5" />
                  <span className="text-sm font-medium">Wysyłaj tego samego dnia rano</span>
                </label>
              </RadioGroup>
              <div className="space-y-2">
                <Label className="text-sm">O godzinie:</Label>
                <Input
                  type="time"
                  value={sendAt}
                  onChange={(e) => setSendAt(e.target.value)}
                  className="w-32"
                />
              </div>
            </section>

            {/* Section C */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Do kogo
              </h4>
              <RadioGroup
                value={audience}
                onValueChange={(v) => setAudience(v as Audience)}
                className="space-y-2"
              >
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="thisWeek" className="mt-0.5" />
                  <div className="flex-1 flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      Klientki bez wizyty w tym tygodniu
                    </span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs h-5">
                      Rekomendowane
                    </Badge>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="dormant14" className="mt-0.5" />
                  <span className="text-sm font-medium">Klientki bez wizyty od 14+ dni</span>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="all" className="mt-0.5" />
                  <span className="text-sm font-medium">Cała baza</span>
                </label>
              </RadioGroup>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <Checkbox
                  checked={excludeRecent}
                  onCheckedChange={(c) => setExcludeRecent(!!c)}
                />
                <span className="text-sm">
                  Wyklucz klientki które dostały SMS w ostatnich 7 dniach
                </span>
              </label>
            </section>

            {/* Section D */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Treść SMS
              </h4>
              <div className="space-y-1.5">
                <Textarea
                  value={template}
                  onChange={(e) => setTemplate(e.target.value.slice(0, 160))}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-end">
                  <span
                    className={cn(
                      "text-xs font-mono",
                      charCount > 150 ? "text-amber-600" : "text-muted-foreground"
                    )}
                  >
                    {charCount}/160
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {VARIABLES.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => insertVar(v)}
                    className="text-xs font-mono px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 hover:bg-violet-200 transition-colors"
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-dashed border-violet-300 bg-violet-50/50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-400 mb-1.5">
                  Podgląd na żywo
                </p>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {preview}
                </p>
              </div>
            </section>

            {/* Section E */}
            <section className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Miasto
              </h4>
              <Label className="text-sm">Sprawdzaj pogodę dla miasta:</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Warszawa"
              />
              <p className="text-xs text-muted-foreground">
                Używamy publicznego API pogodowego (OpenWeatherMap)
              </p>
            </section>

            {/* Section F — Stats */}
            <section>
              <div className="rounded-2xl bg-violet-50 border border-violet-100 p-4 space-y-2">
                <p className="text-sm font-bold text-violet-900">
                  📊 Skuteczność Pogodowego Triggera
                </p>
                <p className="text-sm text-violet-800">
                  Średnia konwersja:{" "}
                  <span className="font-bold">17,6%</span> (6 rezerwacji z 34 SMS)
                </p>
                <p className="text-sm text-violet-800">
                  Najlepszy wynik:{" "}
                  <span className="font-bold">23 maja — 8 rezerwacji</span>
                </p>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white">
              Zapisz
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
