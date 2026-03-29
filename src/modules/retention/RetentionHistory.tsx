import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Mail, Phone, MessageSquare, Send, CheckCircle2, Eye, MousePointer, CalendarCheck, XCircle, Ban, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";

interface HistoryMessage {
  id: string;
  client_name: string;
  sequence_key: string;
  channel: "sms" | "email" | "whatsapp";
  status: string;
  created_at: string;
  message_content: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  delivered_at?: string | null;
  days_inactive?: number;
}

interface RetentionHistoryProps {
  messages: HistoryMessage[];
  isDemo?: boolean;
}

const STATUS_CONFIG: Record<string, { icon: typeof Send; label: string; color: string; bgColor: string }> = {
  sent: { icon: Send, label: "Wysłana", color: "text-muted-foreground", bgColor: "bg-muted" },
  delivered: { icon: CheckCircle2, label: "Dostarczona", color: "text-emerald-700 dark:text-emerald-400", bgColor: "bg-emerald-100 dark:bg-emerald-900/30" },
  opened: { icon: Eye, label: "Otwarta", color: "text-blue-700 dark:text-blue-400", bgColor: "bg-blue-100 dark:bg-blue-900/30" },
  clicked: { icon: MousePointer, label: "Kliknięta", color: "text-purple-700 dark:text-purple-400", bgColor: "bg-purple-100 dark:bg-purple-900/30" },
  booked: { icon: CalendarCheck, label: "Zarezerwowała", color: "text-amber-700 dark:text-amber-400", bgColor: "bg-amber-100 dark:bg-amber-900/30" },
  failed: { icon: XCircle, label: "Błąd wysyłki", color: "text-destructive", bgColor: "bg-destructive/10" },
  cancelled: { icon: Ban, label: "Anulowana", color: "text-muted-foreground", bgColor: "bg-muted" },
};

const CHANNEL_ICONS = { sms: Phone, email: Mail, whatsapp: MessageSquare };

const SEQ_LABELS: Record<string, string> = {
  proactive: "🔮 Zanim odejdzie",
  "45day": "🌸 45 dni",
  "60day": "📚 60 dni",
  "75day": "🎁 75 dni",
  "90day": "🚨 90 dni",
};

const DEMO_MESSAGES: HistoryMessage[] = [
  { id: "h1", client_name: "Marta Kamińska", sequence_key: "60day", channel: "email", status: "booked", created_at: new Date(Date.now() - 2 * 3600000).toISOString(), message_content: "Cześć Marta! Wskazówka od nas: aby efekt Mezoterapii trwał jak najdłużej warto powtarzać zabieg co 6-8 tygodni.", opened_at: new Date(Date.now() - 1.5 * 3600000).toISOString(), clicked_at: new Date(Date.now() - 1 * 3600000).toISOString(), days_inactive: 67 },
  { id: "h2", client_name: "Agnieszka Lewandowska", sequence_key: "45day", channel: "email", status: "opened", created_at: new Date(Date.now() - 8 * 3600000).toISOString(), message_content: "Cześć Agnieszka! Tęsknimy za Tobą 🌸 Minęło już 45 dni od ostatniej wizyty.", opened_at: new Date(Date.now() - 6 * 3600000).toISOString(), clicked_at: null, days_inactive: 45 },
  { id: "h3", client_name: "Ewa Szymańska", sequence_key: "45day", channel: "sms", status: "clicked", created_at: new Date(Date.now() - 24 * 3600000).toISOString(), message_content: "Hej Ewa! Twoje Manicure hybrydowy pewnie już tęskni za naszymi rękami 😄", opened_at: new Date(Date.now() - 22 * 3600000).toISOString(), clicked_at: new Date(Date.now() - 20 * 3600000).toISOString(), days_inactive: 52 },
  { id: "h4", client_name: "Natalia Wróbel", sequence_key: "60day", channel: "email", status: "opened", created_at: new Date(Date.now() - 28 * 3600000).toISOString(), message_content: "Cześć Natalia! Jak efekty po Depilacji?", opened_at: new Date(Date.now() - 26 * 3600000).toISOString(), clicked_at: null, days_inactive: 63 },
  { id: "h5", client_name: "Monika Kozłowska", sequence_key: "75day", channel: "sms", status: "sent", created_at: new Date(Date.now() - 48 * 3600000).toISOString(), message_content: "Hej Monika! Jako nasza stała klientka masz dostęp do specjalnej oferty powrotu.", opened_at: null, clicked_at: null, days_inactive: 75 },
  { id: "h6", client_name: "Aleksandra Jankowska", sequence_key: "75day", channel: "whatsapp", status: "opened", created_at: new Date(Date.now() - 52 * 3600000).toISOString(), message_content: "Specjalnie dla Ciebie Aleksandra: -15% na Manicure hybrydowy!", opened_at: new Date(Date.now() - 50 * 3600000).toISOString(), clicked_at: null, days_inactive: 78 },
  { id: "h7", client_name: "Izabela Wojciechowska", sequence_key: "90day", channel: "sms", status: "sent", created_at: new Date(Date.now() - 72 * 3600000).toISOString(), message_content: "Cześć Izabela, dawno Cię nie widzieliśmy...", opened_at: null, clicked_at: null, days_inactive: 90 },
  { id: "h8", client_name: "Paulina Zielińska", sequence_key: "45day", channel: "email", status: "booked", created_at: new Date(Date.now() - 96 * 3600000).toISOString(), message_content: "Cześć Paulina! Tęsknimy za Tobą 🌸", opened_at: new Date(Date.now() - 94 * 3600000).toISOString(), clicked_at: new Date(Date.now() - 93 * 3600000).toISOString(), days_inactive: 46 },
];

export function RetentionHistory({ messages, isDemo = false }: RetentionHistoryProps) {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<HistoryMessage | null>(null);

  const displayMessages = isDemo ? DEMO_MESSAGES : messages;

  const filtered = displayMessages.filter(m => {
    if (search && !m.client_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (channelFilter !== "all" && m.channel !== channelFilter) return false;
    return true;
  });

  const renderTimeline = (msg: HistoryMessage) => {
    const steps = [
      { label: "Wysłana", done: true, time: msg.created_at },
      { label: "Dostarczona", done: !!msg.delivered_at || !!msg.opened_at, time: msg.delivered_at },
      { label: "Otwarta", done: !!msg.opened_at, time: msg.opened_at },
      { label: "Kliknięta", done: !!msg.clicked_at, time: msg.clicked_at },
      { label: "Zarezerwowała", done: msg.status === "booked", time: msg.status === "booked" ? msg.clicked_at : null },
    ];

    return (
      <div className="space-y-2 mt-4">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className={cn("w-3 h-3 rounded-full border-2", step.done ? "bg-primary border-primary" : "border-muted-foreground/30")} />
            <span className={cn("text-sm", step.done ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
            {step.time && step.done && (
              <span className="text-xs text-muted-foreground ml-auto">
                {formatDistanceToNow(new Date(step.time), { addSuffix: true, locale: pl })}
              </span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Szukaj klientki..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        {["all", "email", "sms", "whatsapp"].map(ch => (
          <Button key={ch} variant={channelFilter === ch ? "default" : "outline"} size="sm" onClick={() => setChannelFilter(ch)}>
            {ch === "all" ? "Wszystkie" : ch === "email" ? "📧 Email" : ch === "sms" ? "📱 SMS" : "💬 WhatsApp"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                {isDemo ? "Brak wiadomości pasujących do filtrów" : "Brak wysłanych wiadomości reaktywacyjnych"}
              </div>
            ) : (
              filtered.map(msg => {
                const statusCfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.sent;
                const StatusIcon = statusCfg.icon;
                const ChannelIcon = CHANNEL_ICONS[msg.channel];

                return (
                  <div key={msg.id} className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedMessage(msg)}>
                    <div className={cn("p-1.5 rounded-lg", statusCfg.bgColor)}>
                      <StatusIcon className={cn("w-4 h-4", statusCfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{msg.client_name}</span>
                        <Badge variant="outline" className="text-xs">{SEQ_LABELS[msg.sequence_key] || msg.sequence_key}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true, locale: pl })}
                        {msg.days_inactive && ` · ${msg.days_inactive} dni nieakt.`}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs gap-1">
                      <ChannelIcon className="w-3 h-3" />
                      {msg.channel.toUpperCase()}
                    </Badge>
                    <Badge className={cn("text-xs", statusCfg.bgColor, statusCfg.color)}>
                      {statusCfg.label}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail drawer */}
      <Sheet open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Szczegóły wiadomości</SheetTitle>
          </SheetHeader>
          {selectedMessage && (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold">{selectedMessage.client_name}</p>
                <p className="text-xs text-muted-foreground">{SEQ_LABELS[selectedMessage.sequence_key]}</p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-1">Treść wiadomości</p>
                <p className="text-sm">{selectedMessage.message_content || "Brak treści"}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Timeline</p>
                {renderTimeline(selectedMessage)}
              </div>

              <Button variant="outline" size="sm" className="gap-1.5 w-full" onClick={() => { toast.success("Wiadomość wysłana ponownie"); setSelectedMessage(null); }}>
                <RotateCcw className="w-3.5 h-3.5" /> Wyślij ponownie
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
