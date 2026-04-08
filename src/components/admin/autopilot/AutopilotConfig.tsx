import { useState } from "react";
import { Bot, Clock, MessageSquare, Star, AlertTriangle, TrendingUp, Radio, FileText, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAutopilotConfig } from "@/hooks/useAutopilot";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { toast } from "sonner";

interface ActionType {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  configFields?: React.ReactNode;
}

export function AutopilotConfig() {
  const { data: config, isLoading, refetch } = useAutopilotConfig();
  const { salonId } = useSalonId();
  const [saving, setSaving] = useState(false);
  const [quietStart, setQuietStart] = useState(config?.quiet_hours_start ?? "20:00");
  const [quietEnd, setQuietEnd] = useState(config?.quiet_hours_end ?? "08:00");
  const [maxMessages, setMaxMessages] = useState(config?.max_messages_per_client_days ?? 7);
  const [aiSuggestions, setAiSuggestions] = useState(config?.ai_suggestions_enabled ?? true);

  // Sync state when config loads
  useState(() => {
    if (config) {
      setQuietStart(config.quiet_hours_start ?? "20:00");
      setQuietEnd(config.quiet_hours_end ?? "08:00");
      setMaxMessages(config.max_messages_per_client_days ?? 7);
      setAiSuggestions(config.ai_suggestions_enabled ?? true);
    }
  });

  const actionTypes: ActionType[] = [
    {
      key: "retention",
      label: "Reaktywacja klientek",
      description: "Automatyczne wiadomości do klientek, które nie odwiedziły salonu od dłuższego czasu",
      icon: <Clock className="w-4 h-4" />,
      color: "text-orange-600",
    },
    {
      key: "reminder",
      label: "Przypomnienia o wizytach",
      description: "SMS/email 24h i 2h przed umówioną wizytą",
      icon: <MessageSquare className="w-4 h-4" />,
      color: "text-blue-600",
    },
    {
      key: "review",
      label: "Prośby o opinie",
      description: "Automatyczna prośba o opinię 2h po zakończonej wizycie",
      icon: <Star className="w-4 h-4" />,
      color: "text-amber-600",
    },
    {
      key: "noshow",
      label: "Follow-up po no-show",
      description: "Wiadomość z propozycją przebookowania 30 min po nieobecności",
      icon: <AlertTriangle className="w-4 h-4" />,
      color: "text-red-600",
    },
    {
      key: "revenue_suggestion",
      label: "Sugestie przychodowe",
      description: "AI proponuje promocje na dni z niskim obłożeniem",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "text-green-600",
    },
    {
      key: "pixel_sync",
      label: "Synchronizacja Meta Pixel",
      description: "Automatyczna synchronizacja danych z Meta Pixel audiences",
      icon: <Radio className="w-4 h-4" />,
      color: "text-purple-600",
    },
    {
      key: "brief",
      label: "Raport tygodniowy",
      description: "Podsumowanie wyników salonu generowane co poniedziałek o 8:00",
      icon: <FileText className="w-4 h-4" />,
      color: "text-indigo-600",
    },
  ];

  const saveGlobalSettings = async () => {
    if (!salonId) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("autopilot_config")
        .upsert(
          {
            salon_id: salonId,
            quiet_hours_start: quietStart,
            quiet_hours_end: quietEnd,
            max_messages_per_client_days: maxMessages,
            ai_suggestions_enabled: aiSuggestions,
          },
          { onConflict: "salon_id" }
        );
      if (error) throw error;
      toast.success("Ustawienia zapisane");
      refetch();
    } catch {
      toast.error("Błąd zapisu ustawień");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-4">
      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="w-5 h-5 text-primary" />
            Ustawienia globalne
          </CardTitle>
          <CardDescription>
            Parametry wspólne dla wszystkich typów akcji Autopilota
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Godziny ciszy od</Label>
              <Input type="time" value={quietStart} onChange={(e) => setQuietStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Godziny ciszy do</Label>
              <Input type="time" value={quietEnd} onChange={(e) => setQuietEnd(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Max wiadomości do klientki co</Label>
            <Select value={String(maxMessages)} onValueChange={(v) => setMaxMessages(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 dni</SelectItem>
                <SelectItem value="5">5 dni</SelectItem>
                <SelectItem value="7">7 dni</SelectItem>
                <SelectItem value="14">14 dni</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Sugestie AI</Label>
              <p className="text-sm text-muted-foreground">Autopilot proponuje nowe akcje na podstawie analizy danych</p>
            </div>
            <Switch checked={aiSuggestions} onCheckedChange={setAiSuggestions} />
          </div>

          <Button onClick={saveGlobalSettings} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Zapisz ustawienia
          </Button>
        </CardContent>
      </Card>

      {/* Per-type config */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Typy akcji</CardTitle>
          <CardDescription>Włączaj/wyłączaj i konfiguruj poszczególne typy automatyzacji</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {actionTypes.map((action) => (
            <Collapsible key={action.key}>
              <div className="border border-border rounded-lg">
                <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-muted ${action.color}`}>{action.icon}</div>
                    <div className="text-left">
                      <p className="font-medium text-sm">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Aktywny
                  </Badge>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Szablon wiadomości</Label>
                      <Textarea
                        placeholder={`Treść wiadomości dla: ${action.label}...`}
                        rows={3}
                        className="text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Zmienne: {"{{imie}}"}, {"{{salon}}"}, {"{{usługa}}"}, {"{{link_rezerwacji}}"}
                      </p>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
