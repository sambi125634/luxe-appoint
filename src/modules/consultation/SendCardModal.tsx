import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, MessageSquare, Mail, Link2, CheckCircle2 } from "lucide-react";
import { useClients } from "@/hooks/useClients";
import { useConsultationTemplates } from "@/hooks/useConsultations";
import { useCreateConsultationSend } from "@/hooks/useConsultationSends";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isDemo?: boolean;
  preselectedCardId?: string;
  preselectedClientId?: string;
}

const DEMO_CLIENTS = [
  { id: "c1", first_name: "Anna", last_name: "Kowalska" },
  { id: "c2", first_name: "Maria", last_name: "Nowak" },
  { id: "c3", first_name: "Karolina", last_name: "Wiśniewska" },
];

export function SendCardModal({ isOpen, onClose, isDemo, preselectedCardId, preselectedClientId }: Props) {
  const [clientId, setClientId] = useState(preselectedClientId || "");
  const [cardId, setCardId] = useState(preselectedCardId || "");
  const [method, setMethod] = useState<"link" | "sms" | "email">("link");
  const [expiresIn, setExpiresIn] = useState("48h");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState("");

  const { data: clients = [] } = useClients();
  const { data: templates = [] } = useConsultationTemplates();
  const createSend = useCreateConsultationSend();

  const displayClients = isDemo ? DEMO_CLIENTS : clients;
  const displayTemplates = isDemo
    ? [
        { id: "t1", name: "Karta konsultacyjna — Twarz", fields: Array(8).fill(null) },
        { id: "t2", name: "Karta paznokcie", fields: Array(5).fill(null) },
      ]
    : templates;

  const filteredClients = displayClients.filter(c =>
    `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCard = displayTemplates.find(t => t.id === cardId);
  const selectedClient = displayClients.find(c => c.id === clientId);

  const handleSend = () => {
    if (!clientId || !cardId) {
      toast.error("Wybierz klientkę i kartę");
      return;
    }
    if (isDemo) {
      setSent(true);
      return;
    }
    const expiresAt = expiresIn === "none" ? undefined : new Date(
      Date.now() + (expiresIn === "24h" ? 86400000 : expiresIn === "48h" ? 172800000 : 604800000)
    ).toISOString();
    createSend.mutate(
      { card_id: cardId, client_id: clientId, send_method: method, expires_at: expiresAt },
      { onSuccess: () => setSent(true) }
    );
  };

  const handleClose = () => {
    setSent(false);
    setClientId(preselectedClientId || "");
    setCardId(preselectedCardId || "");
    onClose();
  };

  if (sent) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <p className="text-lg font-semibold">Karta wysłana!</p>
            <p className="text-sm text-muted-foreground">
              Wysłano do {selectedClient?.first_name} {selectedClient?.last_name}
            </p>
            <Button onClick={handleClose}>Zamknij</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📨 Wyślij kartę konsultacyjną</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Client selection */}
          <div>
            <Label>Wybierz klientkę</Label>
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Szukaj klientki..." className="mt-1 mb-2" />
            <div className="max-h-32 overflow-y-auto space-y-1">
              {filteredClients.slice(0, 5).map(c => (
                <button key={c.id} onClick={() => setClientId(c.id)} className={cn(
                  "w-full text-left px-3 py-2 rounded-lg text-sm transition-all",
                  clientId === c.id ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                )}>
                  {c.first_name} {c.last_name}
                </button>
              ))}
            </div>
          </div>

          {/* Card selection */}
          <div>
            <Label>Wybierz kartę</Label>
            <Select value={cardId} onValueChange={setCardId}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Wybierz kartę..." /></SelectTrigger>
              <SelectContent>
                {displayTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCard && (
              <p className="text-xs text-muted-foreground mt-1">
                {selectedCard.name} · {selectedCard.fields.length} pytań
              </p>
            )}
          </div>

          {/* Method */}
          <div>
            <Label>Metoda wysyłki</Label>
            <div className="flex gap-2 mt-2">
              {([
                { v: "link" as const, icon: Link2, l: "Link do skopiowania" },
                { v: "sms" as const, icon: MessageSquare, l: "SMS" },
                { v: "email" as const, icon: Mail, l: "Email" },
              ]).map(m => (
                <button key={m.v} onClick={() => setMethod(m.v)} className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border-2 text-sm transition-all flex-1",
                  method === m.v ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                )}>
                  <m.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{m.l}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expiry */}
          <div>
            <Label>Wygasa po</Label>
            <div className="flex gap-2 mt-2">
              {["24h", "48h", "7d", "none"].map(v => (
                <button key={v} onClick={() => setExpiresIn(v)} className={cn(
                  "px-3 py-1.5 rounded-lg text-sm border-2 transition-all",
                  expiresIn === v ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
                )}>
                  {v === "none" ? "Bez limitu" : v}
                </button>
              ))}
            </div>
          </div>

          {/* Optional message */}
          <div>
            <Label>Wiadomość personalna (opcjonalnie)</Label>
            <Textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder={`Cześć ${selectedClient?.first_name || "{imię}"}, przed wizytą prosimy o wypełnienie krótkiej karty...`}
              className="mt-1"
              rows={3}
            />
          </div>

          <Button onClick={handleSend} disabled={!clientId || !cardId || createSend.isPending} className="w-full gap-2">
            <Send className="w-4 h-4" />
            Wyślij kartę
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
