import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, RefreshCw, Send, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { useConsultationSends } from "@/hooks/useConsultationSends";
import { useConsultationTemplates } from "@/hooks/useConsultations";
import { useClients } from "@/hooks/useClients";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Props {
  isDemo?: boolean;
}

const DEMO_SENDS = [
  { id: "ds1", salon_id: "", card_id: "t1", client_id: "c1", appointment_id: null, sent_at: "2026-03-25T10:00:00Z", send_method: "link", status: "completed", completed_at: "2026-03-25T12:30:00Z", expires_at: null, unique_token: "abc123" },
  { id: "ds2", salon_id: "", card_id: "t2", client_id: "c2", appointment_id: null, sent_at: "2026-03-26T09:00:00Z", send_method: "sms", status: "sent", completed_at: null, expires_at: "2026-03-28T09:00:00Z", unique_token: "def456" },
  { id: "ds3", salon_id: "", card_id: "t1", client_id: "c3", appointment_id: null, sent_at: "2026-03-20T14:00:00Z", send_method: "email", status: "expired", completed_at: null, expires_at: "2026-03-22T14:00:00Z", unique_token: "ghi789" },
  { id: "ds4", salon_id: "", card_id: "t2", client_id: "c1", appointment_id: null, sent_at: "2026-03-27T08:00:00Z", send_method: "link", status: "opened", completed_at: null, expires_at: null, unique_token: "jkl012" },
];

const DEMO_CLIENTS = [
  { id: "c1", first_name: "Anna", last_name: "Kowalska" },
  { id: "c2", first_name: "Maria", last_name: "Nowak" },
  { id: "c3", first_name: "Karolina", last_name: "Wiśniewska" },
];

const DEMO_TEMPLATES = [
  { id: "t1", name: "Karta konsultacyjna — Twarz" },
  { id: "t2", name: "Karta paznokcie" },
];

const STATUS_MAP: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  sent: { label: "Wysłana", icon: Send, color: "text-muted-foreground" },
  opened: { label: "Otwarta", icon: Eye, color: "text-blue-500" },
  completed: { label: "Wypełniona", icon: CheckCircle2, color: "text-emerald-500" },
  expired: { label: "Wygasła", icon: AlertCircle, color: "text-destructive" },
};

export function SendsHistory({ isDemo }: Props) {
  const [filter, setFilter] = useState<string>("all");
  const { data: sends = [] } = useConsultationSends();
  const { data: templates = [] } = useConsultationTemplates();
  const { data: clients = [] } = useClients();

  const displaySends = isDemo ? DEMO_SENDS : sends;
  const displayClients = isDemo ? DEMO_CLIENTS : clients;
  const displayTemplates = isDemo ? DEMO_TEMPLATES : templates;

  const filtered = filter === "all"
    ? displaySends
    : displaySends.filter(s => s.status === filter);

  const getClient = (id: string | null) => displayClients.find(c => c.id === id);
  const getCard = (id: string | null) => displayTemplates.find(t => t.id === id);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { v: "all", l: "Wszystkie" },
          { v: "sent", l: "📤 Oczekujące" },
          { v: "completed", l: "✅ Wypełnione" },
          { v: "expired", l: "⏰ Wygasłe" },
        ].map(f => (
          <Button key={f.v} variant={filter === f.v ? "default" : "outline"} size="sm" onClick={() => setFilter(f.v)}>
            {f.l}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Wysłane", count: displaySends.length, color: "text-muted-foreground" },
          { label: "Oczekujące", count: displaySends.filter(s => s.status === "sent" || s.status === "opened").length, color: "text-blue-500" },
          { label: "Wypełnione", count: displaySends.filter(s => s.status === "completed").length, color: "text-emerald-500" },
          { label: "Wygasłe", count: displaySends.filter(s => s.status === "expired").length, color: "text-destructive" },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="py-3 text-center">
              <p className={cn("text-2xl font-bold", s.color)}>{s.count}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klientka</TableHead>
                <TableHead>Karta</TableHead>
                <TableHead>Wysłano</TableHead>
                <TableHead>Metoda</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Akcja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Brak wysyłek do wyświetlenia
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(send => {
                const client = getClient(send.client_id);
                const card = getCard(send.card_id);
                const status = STATUS_MAP[send.status] || STATUS_MAP.sent;
                const StatusIcon = status.icon;
                return (
                  <TableRow key={send.id}>
                    <TableCell className="font-medium text-sm">
                      {client ? `${client.first_name} ${client.last_name}` : "—"}
                    </TableCell>
                    <TableCell className="text-sm">{card?.name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(send.sent_at), "d MMM, HH:mm", { locale: pl })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {send.send_method === "sms" ? "SMS" : send.send_method === "email" ? "Email" : "Link"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-1.5 text-sm font-medium", status.color)}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </div>
                    </TableCell>
                    <TableCell>
                      {send.status === "completed" ? (
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <Eye className="w-3.5 h-3.5" /> Odpowiedzi
                        </Button>
                      ) : (send.status === "expired" || send.status === "sent") ? (
                        <Button variant="ghost" size="sm" className="gap-1 text-xs">
                          <RefreshCw className="w-3.5 h-3.5" /> Ponownie
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
