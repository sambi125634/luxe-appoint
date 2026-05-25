import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Send, Cake, History } from "lucide-react";
import { DEMO_PUSH_HISTORY, DEMO_BIRTHDAY_CONFIG } from "../demo/demoData";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface CommunicationSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
}

export function CommunicationSection({ isDemo, salonId }: CommunicationSectionProps) {
  const queryClient = useQueryClient();
  const [pushTitle, setPushTitle] = useState("");
  const [pushBody, setPushBody] = useState("");
  const [pushSegment, setPushSegment] = useState("all");
  const [sending, setSending] = useState(false);
  const [savingWelcome, setSavingWelcome] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Witaj! Cieszymy się, że dołączyłaś do naszego salonu 🌸 Jeśli masz pytania, śmiało pisz!"
  );

  // Load welcome message + birthday config from salon row
  const { data: salonMeta } = useQuery({
    queryKey: ["salon-comm-meta", salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const { data } = await supabase
        .from("salons")
        .select("client_app_welcome_message, birthday_campaign_active, birthday_discount_percent, birthday_send_days_before")
        .eq("id", salonId)
        .maybeSingle();
      return data;
    },
    enabled: !!salonId && !isDemo,
  });

  useEffect(() => {
    if (salonMeta?.client_app_welcome_message) {
      setWelcomeMessage(salonMeta.client_app_welcome_message);
    }
  }, [salonMeta]);

  const { data: pushHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["push-history", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data } = await supabase
        .from("push_notification_history")
        .select("*")
        .eq("salon_id", salonId)
        .order("sent_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
    enabled: !!salonId && !isDemo,
  });

  const displayHistory = isDemo ? DEMO_PUSH_HISTORY : (pushHistory ?? []);

  const resolveSegmentUserIds = async (): Promise<string[]> => {
    if (!salonId) return [];
    const { data: links } = await supabase
      .from("client_salon_links")
      .select("user_id")
      .eq("salon_id", salonId);
    const allUserIds = (links ?? []).map((l) => l.user_id);
    if (pushSegment === "all" || allUserIds.length === 0) return allUserIds;

    // For segments we need to join via profiles.email → clients
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", allUserIds);
    const emailToUser = new Map((profiles ?? []).map((p) => [p.email, p.id]));
    const { data: clients } = await supabase
      .from("clients")
      .select("email, last_visit_at, total_spent")
      .eq("salon_id", salonId)
      .in("email", (profiles ?? []).map((p) => p.email).filter(Boolean) as string[]);

    const now = Date.now();
    const month30 = 30 * 24 * 3600 * 1000;
    const filtered = (clients ?? []).filter((c) => {
      if (pushSegment === "vip") return (c.total_spent ?? 0) >= 1000;
      if (pushSegment === "inactive")
        return !c.last_visit_at || now - new Date(c.last_visit_at).getTime() > month30;
      if (pushSegment === "no_visit") {
        const startMonth = new Date();
        startMonth.setDate(1);
        startMonth.setHours(0, 0, 0, 0);
        return !c.last_visit_at || new Date(c.last_visit_at) < startMonth;
      }
      return true;
    });
    return filtered.map((c) => emailToUser.get(c.email!)).filter(Boolean) as string[];
  };

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) {
      toast.error("Wypełnij tytuł i treść powiadomienia");
      return;
    }
    if (isDemo) {
      toast.info("W trybie demo powiadomienia nie są wysyłane. Tak wyglądałoby powiadomienie dla 47 klientek.");
      setPushTitle("");
      setPushBody("");
      return;
    }
    setSending(true);
    try {
      const userIds = await resolveSegmentUserIds();
      if (userIds.length === 0) {
        toast.warning("Brak odbiorców w wybranym segmencie");
        return;
      }
      let okCount = 0;
      await Promise.all(
        userIds.map(async (uid) => {
          const { data, error } = await supabase.functions.invoke("send-push-notification", {
            body: { user_id: uid, title: pushTitle, body: pushBody, tag: `broadcast-${Date.now()}` },
          });
          if (!error && data) okCount += 1;
        })
      );
      // Log to history
      await supabase.from("push_notification_history").insert({
        salon_id: salonId,
        title: pushTitle,
        body: pushBody,
        recipients_count: userIds.length,
        opened_count: 0,
      });
      queryClient.invalidateQueries({ queryKey: ["push-history", salonId] });
      toast.success(`Wysłano do ${okCount}/${userIds.length} klientek ✓`);
      setPushTitle("");
      setPushBody("");
    } catch (err) {
      console.error(err);
      toast.error("Błąd wysyłki powiadomienia");
    } finally {
      setSending(false);
    }
  };

  const handleSaveWelcome = async () => {
    if (isDemo) {
      toast.success("Wiadomość zapisana ✓ (demo)");
      return;
    }
    if (!salonId) return;
    setSavingWelcome(true);
    const { error } = await supabase
      .from("salons")
      .update({ client_app_welcome_message: welcomeMessage })
      .eq("id", salonId);
    setSavingWelcome(false);
    if (error) {
      toast.error("Nie udało się zapisać");
    } else {
      toast.success("Wiadomość powitalna zapisana ✓");
    }
  };

  const segmentLabels: Record<string, string> = {
    all: "Wszystkich klientek",
    vip: "Tylko VIP",
    inactive: "Nieaktywnych 30+ dni",
    no_visit: "Bez wizyty w tym miesiącu",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5" />
          Powiadomienia i kampanie
        </CardTitle>
        <CardDescription>Komunikuj się z klientkami bezpośrednio przez aplikację</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Send push */}
        <div className="space-y-4 p-4 rounded-xl border bg-muted/20">
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-primary" />
            <Label className="text-sm font-semibold">Wyślij wiadomość do klientek</Label>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Tytuł</Label>
            <div className="relative">
              <Input
                value={pushTitle}
                onChange={(e) => setPushTitle(e.target.value.slice(0, 40))}
                placeholder="np. Promocja weekendowa 🌸"
                maxLength={40}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{pushTitle.length}/40</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Treść</Label>
            <div className="relative">
              <Textarea
                value={pushBody}
                onChange={(e) => setPushBody(e.target.value.slice(0, 120))}
                placeholder="Napisz treść powiadomienia..."
                maxLength={120}
                rows={2}
              />
              <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">{pushBody.length}/120</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Do kogo?</Label>
            <RadioGroup value={pushSegment} onValueChange={setPushSegment} className="space-y-1">
              {Object.entries(segmentLabels).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`seg-${value}`} />
                  <Label htmlFor={`seg-${value}`} className="text-sm font-normal">{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {pushTitle && pushBody && (
            <div className="rounded-lg border p-3 bg-background">
              <p className="text-xs text-muted-foreground mb-1">Podgląd powiadomienia</p>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{pushTitle}</p>
                  <p className="text-xs text-muted-foreground">{pushBody}</p>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleSendPush} disabled={sending} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {sending ? "Wysyłanie..." : "Wyślij teraz"}
          </Button>
        </div>

        {/* Birthday campaigns */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cake className="w-4 h-4 text-[#D4537E]" />
              <Label className="text-sm font-semibold">Kampanie urodzinowe</Label>
            </div>
            <Switch defaultChecked={DEMO_BIRTHDAY_CONFIG.is_active} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Zniżka (%)</Label>
              <Input type="number" defaultValue={DEMO_BIRTHDAY_CONFIG.discount_value} min={5} max={50} className="text-center" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Dni przed urodzinami</Label>
              <Input type="number" defaultValue={DEMO_BIRTHDAY_CONFIG.send_days_before} min={1} max={14} className="text-center" />
            </div>
          </div>
        </div>

        {/* Push history */}
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4" />
            <Label className="text-sm font-semibold">Historia powiadomień</Label>
          </div>

          {!isDemo && historyLoading ? (
            <div className="space-y-2">{[1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
          ) : displayHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Brak wysłanych powiadomień</p>
          ) : (
            <div className="space-y-2">
              {displayHistory.map((h) => (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{h.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{h.body}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs text-muted-foreground">{h.recipients_count} odb.</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {h.opened_count && h.recipients_count ? Math.round((h.opened_count / h.recipients_count) * 100) : 0}% open
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Welcome message */}
        <div className="space-y-3 border-t pt-4">
          <Label className="text-sm font-semibold">Wiadomość powitalna</Label>
          <Textarea
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            rows={3}
            placeholder="Wiadomość powitalna..."
          />
          <Button variant="outline" size="sm" onClick={handleSaveWelcome} disabled={savingWelcome}>
            {savingWelcome ? "Zapisywanie..." : "Zapisz wiadomość powitalną"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
