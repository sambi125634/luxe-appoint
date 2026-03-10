import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, FileText, Download, Plus, Clock } from "lucide-react";
import { useConsultationCards, useConsultationTemplates, useSaveCard, ConsultationField } from "@/hooks/useConsultations";
import { useClients } from "@/hooks/useClients";
import { CardFillForm } from "./CardFillForm";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { toast } from "sonner";

const MOCK_CARDS = [
  {
    id: "demo-1", salon_id: "", client_id: "c1", template_id: null,
    responses: { skin_type: "Mieszana", concerns: ["Przebarwienia", "Zmarszczki"] },
    signature_url: null, red_flags: ["⚠️ UCZULONA na lateks", "⚠️ Przyjmuje leki rozrzedzające krew"],
    status: "signed", filled_at: "2026-03-05T10:00:00Z", created_at: "2026-03-05T10:00:00Z",
  },
  {
    id: "demo-2", salon_id: "", client_id: "c2", template_id: null,
    responses: { goals: "Nawilżenie, anti-aging" },
    signature_url: null, red_flags: ["⚠️ Ciąża"],
    status: "completed", filled_at: "2026-03-01T14:00:00Z", created_at: "2026-03-01T14:00:00Z",
  },
];

interface Props {
  isDemo?: boolean;
  clientId?: string;
}

export function ClientConsultations({ isDemo, clientId }: Props) {
  const { data: cards = [] } = useConsultationCards(clientId);
  const { data: templates = [] } = useConsultationTemplates();
  const { data: clients = [] } = useClients();
  const saveCard = useSaveCard();
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedClientId, setSelectedClientId] = useState<string>(clientId || "");

  const displayCards = isDemo ? MOCK_CARDS : cards;

  // Collect all red flags
  const allRedFlags = displayCards.flatMap((c) => c.red_flags || []);

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const handleSubmit = (responses: Record<string, unknown>, signatureDataUrl: string | null, redFlags: string[]) => {
    if (isDemo) {
      toast.success("Demo: Karta zapisana!");
      setShowForm(false);
      return;
    }
    if (!selectedClientId) {
      toast.error("Wybierz klientkę");
      return;
    }
    saveCard.mutate({
      client_id: selectedClientId,
      template_id: selectedTemplateId || undefined,
      responses,
      signature_url: signatureDataUrl || undefined,
      red_flags: redFlags,
      status: signatureDataUrl ? "signed" : "completed",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Red flags pinned */}
      {allRedFlags.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="py-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-semibold text-destructive">Czerwone flagi</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[...new Set(allRedFlags)].map((flag) => (
                <Badge key={flag} variant="destructive" className="text-xs">
                  {flag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New card form */}
      {showForm ? (
        <div className="space-y-4">
          {!clientId && (
            <div className="space-y-2">
              <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                <SelectTrigger><SelectValue placeholder="Wybierz klientkę..." /></SelectTrigger>
                <SelectContent>
                  {(isDemo
                    ? [{ id: "c1", first_name: "Anna", last_name: "Kowalska" }, { id: "c2", first_name: "Maria", last_name: "Nowak" }]
                    : clients
                  ).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
            <SelectTrigger><SelectValue placeholder="Wybierz szablon karty..." /></SelectTrigger>
            <SelectContent>
              {(isDemo
                ? [{ id: "demo-tpl", name: "Karta konsultacyjna — Twarz", fields: [] }]
                : templates
              ).map((t) => (
                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedTemplate && (
            <CardFillForm
              fields={selectedTemplate.fields}
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          )}

          {!selectedTemplate && selectedTemplateId && (
            <p className="text-sm text-muted-foreground">Wybierz szablon, aby wyświetlić formularz</p>
          )}
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nowa karta konsultacyjna
        </Button>
      )}

      {/* Cards list */}
      <div className="space-y-3">
        {displayCards.map((card) => (
          <Card key={card.id}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <Badge variant={card.status === "signed" ? "default" : "secondary"}>
                      {card.status === "signed" ? "Podpisana" : card.status === "completed" ? "Wypełniona" : "Oczekuje"}
                    </Badge>
                  </div>
                  {card.filled_at && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {format(new Date(card.filled_at), "d MMM yyyy, HH:mm", { locale: pl })}
                    </p>
                  )}
                  {(card.red_flags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {card.red_flags.map((f, i) => (
                        <Badge key={i} variant="destructive" className="text-xs">{f}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {displayCards.length === 0 && !showForm && (
          <p className="text-center text-muted-foreground py-8">Brak kart konsultacyjnych</p>
        )}
      </div>
    </div>
  );
}
