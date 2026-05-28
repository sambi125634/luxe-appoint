import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Settings2, X, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FlashOfertaCardProps {
  isDemo?: boolean;
}

type Audience = "historical" | "dormant" | "all";

const DEFAULT_TEMPLATE =
  "Aniu, mam dla Ciebie niespodziankę 🎁 Jutro o {GODZINA} jest wolny slot na {USŁUGA}. Zarezerwuj w 2 kliknięcia: {LINK}";

const VARIABLES = ["{IMIĘ}", "{GODZINA}", "{USŁUGA}", "{LINK}", "{SALON}"] as const;

const HISTORY = [
  { date: "25 maj", slots: 2, revenue: 280 },
  { date: "22 maj", slots: 1, revenue: 140 },
  { date: "18 maj", slots: 3, revenue: 420 },
  { date: "14 maj", slots: 1, revenue: 160 },
  { date: "10 maj", slots: 2, revenue: 240 },
];

function renderPreview(template: string) {
  return template
    .replace(/\{IMIĘ\}/g, "Anna")
    .replace(/\{GODZINA\}/g, "17:00")
    .replace(/\{USŁUGA\}/g, "Manicure hybrydowy")
    .replace(/\{LINK\}/g, "cal.bf/helena")
    .replace(/\{SALON\}/g, "Helena Studio");
}

export function FlashOfertaCard({ isDemo }: FlashOfertaCardProps) {
  const [enabled, setEnabled] = useState(true);
  const [open, setOpen] = useState(false);

  // Draft state (in drawer)
  const [threshold, setThreshold] = useState(3);
  const [timeFrom, setTimeFrom] = useState("09:00");
  const [timeTo, setTimeTo] = useState("19:00");
  const [weekdaysOnly, setWeekdaysOnly] = useState(false);
  const [audience, setAudience] = useState<Audience>("historical");
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);
  const [historyOpen, setHistoryOpen] = useState(false);

  const charCount = template.length;
  const preview = useMemo(() => renderPreview(template), [template]);

  const insertVar = (v: string) => {
    setTemplate((t) => (t + " " + v).slice(0, 160));
  };

  const handleSave = () => {
    toast.success("Zapisano konfigurację Flash Oferty™");
    setOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className={cn(
          "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-5 shadow-sm",
          enabled ? "border-violet-200" : "border-gray-200 opacity-90"
        )}
      >
        {/* Glow */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-violet-300/30 blur-3xl" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className={cn(
                "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                enabled ? "bg-gradient-to-br from-violet-500 to-fuchsia-500" : "bg-gray-200"
              )}
            >
              <Zap className={cn("w-5 h-5", enabled ? "text-white" : "text-gray-400")} fill={enabled ? "currentColor" : "none"} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base text-foreground tracking-tight">⚡ Flash Oferta™</h3>
                <Badge className="bg-violet-600 hover:bg-violet-600 text-white text-[10px] h-5 px-2 rounded-full">
                  ELITE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Automatycznie wypełnia wolne sloty — bez Twojego udziału
              </p>
            </div>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
            className="data-[state=checked]:bg-violet-600"
          />
        </div>

        {/* Live metric pill */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3 }}
              className="relative mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur border border-violet-200 px-3 py-1.5 shadow-sm"
            >
              <motion.span
                animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
              />
              <span className="text-xs font-medium text-foreground">
                Dziś: wypełniono <span className="font-bold text-violet-700">2 sloty</span> — zarobiono{" "}
                <span className="font-bold text-violet-700">280 zł</span>
              </span>
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
          <SheetHeader className="px-6 py-5 border-b border-border bg-gradient-to-r from-violet-50 to-white">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-600" fill="currentColor" />
                Konfiguracja Flash Oferty™
              </SheetTitle>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
            {/* Section A */}
            <section className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Kiedy wysyłać?
              </h4>
              <div className="space-y-2">
                <Label className="text-sm">
                  Wyślij gdy zostało{" "}
                  <Input
                    type="number"
                    min={1}
                    max={20}
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value) || 1)}
                    className="inline-flex w-16 mx-1 text-center"
                  />{" "}
                  wolnych slotów w ciągu 48h
                </Label>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Wysyłaj SMS między:</Label>
                <div className="flex items-center gap-2">
                  <Input type="time" value={timeFrom} onChange={(e) => setTimeFrom(e.target.value)} className="flex-1" />
                  <span className="text-muted-foreground">—</span>
                  <Input type="time" value={timeTo} onChange={(e) => setTimeTo(e.target.value)} className="flex-1" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox checked={weekdaysOnly} onCheckedChange={(c) => setWeekdaysOnly(!!c)} />
                <span className="text-sm">Tylko w dni robocze (Pon–Pt)</span>
              </label>
            </section>

            {/* Section B */}
            <section className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Do kogo wysyłać?
              </h4>
              <RadioGroup value={audience} onValueChange={(v) => setAudience(v as Audience)} className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="historical" className="mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">Klientki które były w tym dniu tygodnia historycznie</span>
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5">
                        Rekomendowane
                      </Badge>
                    </div>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="dormant" className="mt-0.5" />
                  <span className="text-sm font-medium">Klientki bez wizyty od 30+ dni</span>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 cursor-pointer transition-colors has-[:checked]:border-violet-400 has-[:checked]:bg-violet-50">
                  <RadioGroupItem value="all" className="mt-0.5" />
                  <span className="text-sm font-medium">Cała baza klientek</span>
                </label>
              </RadioGroup>
            </section>

            {/* Section C */}
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
                  <span className={cn(
                    "text-xs font-mono",
                    charCount > 150 ? "text-amber-600" : "text-muted-foreground"
                  )}>
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
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{preview}</p>
              </div>
            </section>

            {/* Section D — collapsible history */}
            <section className="space-y-2">
              <button
                type="button"
                onClick={() => setHistoryOpen((o) => !o)}
                className="w-full flex items-center justify-between"
              >
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                  Historia
                </h4>
                {historyOpen ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {historyOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden divide-y divide-border rounded-xl border border-border"
                  >
                    {HISTORY.map((h, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-2.5 text-sm">
                        <span className="text-muted-foreground">{h.date}</span>
                        <span className="text-foreground">
                          {h.slots} {h.slots === 1 ? "slot" : "sloty"} wypełnione
                        </span>
                        <span className="font-semibold text-emerald-600">+{h.revenue} zł</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </section>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white">
              Zapisz zmiany
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
