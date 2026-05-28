import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, History } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { DEMO_PUSH_HISTORY } from "../demo/demoData";

interface PushSectionProps {
  isDemo: boolean;
  salonId: string | null | undefined;
}

const SEGMENTS: Record<string, string> = {
  all: "Wszystkie klientki w aplikacji",
  vip: "Tylko VIP (5+ wizyt)",
  inactive: "Nieaktywne 30+ dni",
  no_visit: "Bez wizyty w tym miesiącu",
};

export function PushSection({ isDemo, salonId }: PushSectionProps) {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all");
  const [sending, setSending] = useState(false);

  const { data: history, isLoading } = useQuery({
    queryKey: ["push-history", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data } = await supabase
        .from("push_notification_history")
        .select("*")
        .eq("salon_id", salonId)
        .order("sent_at", { ascending: false })
        .limit(20);
      return data ?? [];
    },
    enabled: !!salonId && !isDemo,
  });

  const displayHistory = isDemo ? DEMO_PUSH_HISTORY : (history ?? []);

  const resolveSegmentUserIds = async (): Promise<string[]> => {
    if (!salonId) return [];
    const { data: links } = await supabase
      .from("client_salon_links")
      .select("user_id")
      .eq("salon_id", salonId);
    const allUserIds = (links ?? []).map((l) => l.user_id);
    if (segment === "all" || allUserIds.length === 0) return allUserIds;

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .in("id", allUserIds);
    const emailToUser = new Map((profiles ?? []).map((p) => [p.email, p.id]));
    const emails = (profiles ?? []).map((p) => p.email).filter(Boolean) as string[];
    if (emails.length === 0) return [];
    const { data: clientsRows } = await supabase
      .from("clients")
      .select("id, email, last_visit_at")
      .eq("salon_id", salonId)
      .in("email", emails);
    const clients = clientsRows ?? [];

    let vipIds = new Set<string>();
    if (segment === "vip" && clients.length) {
      const { data: aps } = await supabase
        .from("appointments")
        .select("client_id")
        .eq("salon_id", salonId)
        .eq("status", "completed")
        .in("client_id", clients.map((c) => c.id));
      const counts = new Map<string, number>();
      (aps ?? []).forEach((a) => {
        if (a.client_id) counts.set(a.client_id, (counts.get(a.client_id) ?? 0) + 1);
      });
      vipIds = new Set([...counts.entries()].filter(([, n]) => n >= 5).map(([id]) => id));
    }

    const now = Date.now();
    const month30 = 30 * 24 * 3600 * 1000;
    const filtered = clients.filter((c) => {
      if (segment === "vip") return vipIds.has(c.id);
      if (segment === "inactive")
        return !c.last_visit_at || now - new Date(c.last_visit_at).getTime() > month30;
      if (segment === "no_visit") {
        const startMonth = new Date();
        startMonth.setDate(1);
        startMonth.setHours(0, 0, 0, 0);
        return !c.last_visit_at || new Date(c.last_visit_at) < startMonth;
      }
      return true;
    });
    return filtered.map((c) => emailToUser.get(c.email!)).filter(Boolean) as string[];
  };

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Wypełnij tytuł i treść powiadomienia");
      return;
    }
    if (isDemo) {
      toast.info("W trybie demo powiadomienia nie są wysyłane. W realnym koncie poszłoby do 47 klientek.");
      setTitle("");
      setBody("");
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
            body: { user_id: uid, title, body, tag: `broadcast-${Date.now()}` },
          });
          if (!error && data) okCount += 1;
        })
      );
      await supabase.from("push_notification_history").insert({
        salon_id: salonId,
        title,
        body,
        segment,
        recipients_count: userIds.length,
        opened_count: 0,
      });
      qc.invalidateQueries({ queryKey: ["push-history", salonId] });
      toast.success(`Wysłano do ${okCount}/${userIds.length} klientek ✓`);
      setTitle("");
      setBody("");
    } catch (err) {
      console.error(err);
      toast.error("Błąd wysyłki powiadomienia");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="w-5 h-5" />
            Powiadomienie push do aplikacji
          </CardTitle>
          <CardDescription>
            Jedyna komunikacja, której nie wyśle Autopilot ani Ustawienia. Trafia tylko do klientek, które zainstalowały Twoją aplikację.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Tytuł</Label>
            <div className="relative">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 40))}
                placeholder="np. Promocja weekendowa 🌸"
                maxLength={40}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{title.length}/40</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Treść</Label>
            <div className="relative">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value.slice(0, 120))}
                placeholder="Napisz treść powiadomienia..."
                maxLength={120}
                rows={2}
              />
              <span className="absolute right-2 bottom-2 text-xs text-muted-foreground">{body.length}/120</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Do kogo?</Label>
            <RadioGroup value={segment} onValueChange={setSegment} className="space-y-1">
              {Object.entries(SEGMENTS).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`seg-${value}`} />
                  <Label htmlFor={`seg-${value}`} className="text-sm font-normal">{label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {title && body && (
            <div className="rounded-lg border p-3 bg-muted/30">
              <p className="text-xs text-muted-foreground mb-1">Podgląd na ekranie klientki</p>
              <p className="text-sm font-semibold">{title}</p>
              <p className="text-sm text-muted-foreground">{body}</p>
            </div>
          )}

          <Button onClick={handleSend} disabled={sending} className="w-full gap-2">
            <Send className="w-4 h-4" />
            {sending ? "Wysyłanie..." : "Wyślij teraz"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4" />
            Historia ostatnich wysyłek
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isDemo && isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : displayHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Jeszcze nie wysłałaś żadnego powiadomienia.
            </p>
          ) : (
            <div className="space-y-2">
              {displayHistory.map((h) => {
                const recipients = h.recipients_count ?? 0;
                const opened = h.opened_count ?? 0;
                const ctr = recipients > 0 ? Math.round((opened / recipients) * 100) : 0;
                return (
                  <div key={h.id} className="p-3 rounded-lg border bg-background space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{h.title}</p>
                      <Badge variant="secondary" className="text-[10px]">
                        {SEGMENTS[(h as { segment?: string }).segment ?? "all"] ?? "Wszystkie"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{h.body}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span>{new Date(h.sent_at).toLocaleDateString("pl-PL")}</span>
                      <span>· {recipients} odbiorców</span>
                      <span>· otwarcia: <strong className="text-foreground">{ctr}%</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}