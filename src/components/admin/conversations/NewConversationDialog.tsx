import { useEffect, useMemo, useState } from "react";
import { Search, MessageSquare, Mail, Phone, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSalonId } from "@/hooks/useSalonId";
import { useSalonSettings } from "@/hooks/useSalonSettings";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Contact } from "./types";

type Channel = "SMS" | "Email" | "WhatsApp";

interface ClientRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  tags: string[] | null;
}

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (contact: Contact, channel: Channel) => Promise<void> | void;
}

export function NewConversationDialog({ open, onOpenChange, onCreated }: NewConversationDialogProps) {
  const { salonId } = useSalonId();
  const { settings } = useSalonSettings();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ClientRow | null>(null);
  const [channel, setChannel] = useState<Channel>("SMS");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setDebounced("");
      setSelected(null);
      setBody("");
      setChannel("SMS");
    }
  }, [open]);

  // Debounce search
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 200);
    return () => clearTimeout(id);
  }, [query]);

  // Fetch clients
  useEffect(() => {
    if (!open || !salonId) return;
    let cancelled = false;
    setLoading(true);

    const run = async () => {
      let q = supabase
        .from("clients")
        .select("id, first_name, last_name, email, phone, tags")
        .eq("salon_id", salonId)
        .order("last_visit_at", { ascending: false, nullsFirst: false })
        .limit(50);

      if (debounced) {
        const term = `%${debounced}%`;
        q = q.or(
          `first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`,
        );
      }

      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        toast.error("Nie udało się pobrać listy klientów");
        setClients([]);
      } else {
        setClients((data || []) as ClientRow[]);
      }
      setLoading(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [open, salonId, debounced]);

  const smsConfigured = !!settings.integrations.smsapi?.enabled && !!settings.integrations.smsapi?.apiKey;
  const whatsappConfigured = !!settings.integrations.whatsapp?.enabled && !!settings.integrations.whatsapp?.apiKey;

  const channels: { key: Channel; label: string; icon: typeof MessageSquare; available: boolean }[] = useMemo(
    () => [
      { key: "SMS", label: "SMS", icon: MessageSquare, available: smsConfigured },
      { key: "Email", label: "Email", icon: Mail, available: true },
      { key: "WhatsApp", label: "WhatsApp", icon: Phone, available: whatsappConfigured },
    ],
    [smsConfigured, whatsappConfigured],
  );

  const handleSend = async () => {
    if (!selected || !body.trim()) return;
    setSending(true);
    try {
      const contact: Contact = {
        id: selected.id,
        externalContactId: selected.id,
        firstName: selected.first_name,
        lastName: selected.last_name,
        email: selected.email || undefined,
        phone: selected.phone || undefined,
        lastMessageAt: new Date(),
        lastMessagePreview: body.trim(),
        unreadCount: 0,
        tags: selected.tags || [],
      };
      await onCreated(contact, channel);
      onOpenChange(false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif">Nowa konwersacja</DialogTitle>
        </DialogHeader>

        {/* Step 1 — search & select client */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">1. Wybierz klientkę</label>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Imię, nazwisko, telefon lub email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-48 mt-2 rounded-md border border-border">
            {loading ? (
              <div className="h-full flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : clients.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                Brak klientek pasujących do wyszukiwania.
              </p>
            ) : (
              <div className="divide-y divide-border">
                {clients.map((c) => {
                  const isSelected = selected?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelected(c)}
                      className={cn(
                        "w-full text-left p-3 hover:bg-muted/60 transition-colors",
                        isSelected && "bg-primary/5 border-l-2 border-l-primary",
                      )}
                    >
                      <div className="font-medium text-sm truncate">
                        {c.first_name} {c.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.phone || c.email || "—"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Step 2 — channel */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">2. Kanał</label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {channels.map((ch) => {
              const Icon = ch.icon;
              const active = channel === ch.key;
              return (
                <button
                  key={ch.key}
                  type="button"
                  onClick={() => setChannel(ch.key)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border py-2 text-xs transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-foreground"
                      : "border-border hover:bg-muted/50 text-muted-foreground",
                    !ch.available && "opacity-60",
                  )}
                  title={!ch.available ? "Kanał nieskonfigurowany — wiadomość zostanie zapisana lokalnie" : undefined}
                >
                  <Icon className="w-4 h-4" />
                  {ch.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3 — message */}
        <div>
          <label className="text-xs font-medium text-muted-foreground">3. Pierwsza wiadomość</label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Cześć! Piszę w sprawie…"
            rows={4}
            className="mt-2"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={sending}>
            Anuluj
          </Button>
          <Button
            onClick={handleSend}
            disabled={!selected || !body.trim() || sending}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Wyślij
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}