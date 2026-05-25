import { useState, useEffect } from "react";
import { Save, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAutopilotConfig, useUpdateAutopilotConfig } from "@/hooks/useAutopilot";
import { Skeleton } from "@/components/ui/skeleton";

interface AutopilotSettingsProps {
  isDemo?: boolean;
}

export function AutopilotSettings({ isDemo }: AutopilotSettingsProps) {
  const [selectedTone, setSelectedTone] = useState("warm");
  const [smartTiming, setSmartTiming] = useState(true);
  const [notifications, setNotifications] = useState({
    daily: true,
    vipAlert: true,
    weekly: true,
    everyAction: false,
  });

  const { data: config, isLoading } = useAutopilotConfig();
  const updateConfig = useUpdateAutopilotConfig();

  const [quietStart, setQuietStart] = useState(config?.quiet_hours_start || "22:00");
  const [quietEnd, setQuietEnd] = useState(config?.quiet_hours_end || "07:00");
  const [maxMessages, setMaxMessages] = useState(config?.max_messages_per_client_days?.toString() || "2");
  const [aiSuggestions, setAiSuggestions] = useState(config?.ai_suggestions_enabled ?? true);

  useEffect(() => {
    if (config) {
      setQuietStart(config.quiet_hours_start || "22:00");
      setQuietEnd(config.quiet_hours_end || "07:00");
      setMaxMessages(config.max_messages_per_client_days?.toString() || "2");
      setAiSuggestions(config.ai_suggestions_enabled ?? true);
    }
  }, [config]);

  const handleSave = async () => {
    if (isDemo) {
      toast.success("Ustawienia zapisane ✓");
      return;
    }
    await updateConfig.mutateAsync({
      quiet_hours_start: quietStart,
      quiet_hours_end: quietEnd,
      max_messages_per_client_days: parseInt(maxMessages) || 2,
      ai_suggestions_enabled: aiSuggestions,
    });
    toast.success("Ustawienia zapisane ✓");
  };

  const tones = [
    { id: "warm", label: "💜 Ciepły i przyjazny", desc: "Cześć Aniu! Tęsknimy za Tobą...", preview: "Cześć Aniu! Tęsknimy za Tobą 💜 Kiedy wpadasz do nas?" },
    { id: "professional", label: "💼 Profesjonalny i rzeczowy", desc: "Szanowna Pani Anno, przypominamy...", preview: "Szanowna Pani Anno, mamy dla Pani propozycję terminu." },
    { id: "luxury", label: "✨ Luksusowy i ekskluzywny", desc: "Droga Aniu, Twój wyjątkowy termin...", preview: "Droga Aniu, Twój wyjątkowy moment relaksu czeka na Ciebie." },
  ];

  const notificationItems = [
    { key: "daily" as const, label: "Codzienne podsumowanie", desc: "Raport dzienny o 20:00 — co zrobił Autopilot", recommended: true },
    { key: "vipAlert" as const, label: "Alert: klientka VIP zagrożona", desc: "Gdy AI wykryje ryzyko odejścia klientki VIP", recommended: true },
    { key: "weekly" as const, label: "Raport tygodniowy", desc: "Co poniedziałek o 8:00 — wyniki tygodnia", recommended: false },
    { key: "everyAction" as const, label: "Alert przy każdej akcji", desc: "Powiadomienie za każdym razem gdy Autopilot coś wyśle", notRecommended: true },
  ];

  return (
    <div className="max-w-lg space-y-6">
      {/* 1. Godziny ciszy */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-sm">Godziny ciszy</h3>
        <p className="text-xs text-muted-foreground">Autopilot nie wysyła wiadomości w tych godzinach</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs mb-1 block">Od</Label>
            <Input type="time" defaultValue="22:00" className="text-sm" />
          </div>
          <div>
            <Label className="text-xs mb-1 block">Do</Label>
            <Input type="time" defaultValue="07:00" className="text-sm" />
          </div>
        </div>
      </div>

      {/* 2. Limit wiadomości */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <h3 className="font-semibold text-sm">Limit wiadomości</h3>
        <p className="text-xs text-muted-foreground">Maksymalna liczba wiadomości do jednej klientki</p>
        <div className="flex items-center gap-3">
          <Input type="number" defaultValue="2" className="w-20 text-sm" min={1} max={5} />
          <span className="text-sm text-muted-foreground">wiadomości na</span>
          <Input type="number" defaultValue="7" className="w-20 text-sm" min={1} />
          <span className="text-sm text-muted-foreground">dni</span>
        </div>
      </div>

      {/* 3. Podpis SMS */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold text-sm">Podpis SMS</h3>
        <Input defaultValue={isDemo ? "Atelier Beauty Studio" : ""} placeholder="Nazwa Twojego salonu" className="text-sm" />
        <p className="text-xs text-muted-foreground">Pojawi się na końcu każdej automatycznej wiadomości</p>
      </div>

      {/* 4. Ton komunikacji (demo only shows extra detail) */}
      {isDemo && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Ton komunikacji</h3>
            <p className="text-xs text-muted-foreground mt-1">Autopilot dopasuje styl wiadomości do charakteru Twojego salonu</p>
          </div>
          <div className="space-y-3">
            {tones.map((tone) => (
              <label key={tone.id} className={cn(
                "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                selectedTone === tone.id ? "border-violet-300 bg-violet-50" : "border-border hover:border-violet-200"
              )}>
                <input
                  type="radio"
                  name="tone"
                  value={tone.id}
                  checked={selectedTone === tone.id}
                  onChange={() => setSelectedTone(tone.id)}
                  className="mt-0.5 accent-violet-600"
                />
                <div>
                  <p className="text-sm font-medium">{tone.label}</p>
                  <p className="text-xs text-muted-foreground italic">"{tone.desc}"</p>
                </div>
              </label>
            ))}
          </div>
          <div className="bg-muted/30 rounded-xl p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Podgląd wiadomości powitalnej:</p>
            <p className="text-sm">{tones.find(t => t.id === selectedTone)?.preview}</p>
          </div>
        </div>
      )}

      {/* 5. Inteligencja akcji */}
      {isDemo && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-sm">Inteligencja akcji</h3>
              <p className="text-xs text-muted-foreground mt-1">Autopilot uczy się na podstawie odpowiedzi klientek i optymalizuje timing wysyłki</p>
            </div>
            <Switch checked={smartTiming} onCheckedChange={setSmartTiming} />
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-xl p-3">
            <p className="text-xs font-semibold text-violet-700 mb-2">⚡ Jak to działa:</p>
            <div className="space-y-1.5">
              {[
                "Wykrywa kiedy klientka najczęściej otwiera SMS",
                "Dobiera godzinę wysyłki per klientka",
                "Po 30 dniach skuteczność rośnie o 40%",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-violet-700">
                  <Check className="w-3 h-3 text-violet-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Powiadomienia */}
      {isDemo && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Powiadomienia dla Ciebie</h3>
            <p className="text-xs text-muted-foreground mt-1">Kiedy Autopilot ma Cię informować o swoich akcjach</p>
          </div>
          <div className="space-y-3">
            {notificationItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{item.label}</p>
                    {item.recommended && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">zalecane</span>
                    )}
                    {item.notRecommended && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">nie zalecane</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Switch
                  checked={notifications[item.key]}
                  onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [item.key]: v }))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={handleSave} className="w-full bg-violet-600 hover:bg-violet-700 gap-2">
        <Save className="w-4 h-4" />
        Zapisz ustawienia
      </Button>
    </div>
  );
}
