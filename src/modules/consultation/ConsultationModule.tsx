import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  ClipboardList, Link2, History, Plus, Sparkles, Send, Edit, Eye,
  FileText, Info
} from "lucide-react";
import { useConsultationTemplates, ConsultationField } from "@/hooks/useConsultations";
import { useServiceConsultationCards } from "@/hooks/useConsultationSends";
import { SectionGuide } from "@/components/admin/SectionGuide";
import { EasyCardBuilder } from "./EasyCardBuilder";
import { SendCardModal } from "./SendCardModal";
import { ServiceCardAssignment } from "./ServiceCardAssignment";
import { SendsHistory } from "./SendsHistory";
import { cn } from "@/lib/utils";

interface Props {
  isDemo?: boolean;
}

const CATEGORY_MAP: Record<string, { emoji: string; label: string }> = {
  general: { emoji: "✨", label: "Ogólna" },
  face: { emoji: "💆", label: "Twarz" },
  nails: { emoji: "💅", label: "Paznokcie" },
  hair: { emoji: "💇", label: "Włosy" },
  body: { emoji: "💆", label: "Ciało" },
  medical: { emoji: "🏥", label: "Medyczna" },
  rodo: { emoji: "📋", label: "RODO" },
  custom: { emoji: "✏️", label: "Własna" },
};

const STARTER_TEMPLATES = [
  { name: "Ogólna karta konsultacyjna", emoji: "✨", questionsCount: 8, minutes: 3, category: "general" },
  { name: "Zabiegi paznokci", emoji: "💅", questionsCount: 6, minutes: 2, category: "nails" },
  { name: "Zabiegi twarzy", emoji: "💆", questionsCount: 10, minutes: 4, category: "face" },
  { name: "Zabiegi włosów", emoji: "💇", questionsCount: 7, minutes: 3, category: "hair" },
  { name: "Klinika estetyczna", emoji: "🏥", questionsCount: 14, minutes: 6, category: "medical" },
  { name: "Zgoda RODO + marketing", emoji: "📋", questionsCount: 3, minutes: 1, category: "rodo" },
];

const GROUP_EXPLANATIONS = [
  { emoji: "💎", name: "VIP Shopper", desc: "Kupiła za ponad 2000 zł łącznie i wróciła min. 3 razy" },
  { emoji: "🔁", name: "Stała klientka", desc: "Min. 5 zakupów w ostatnich 6 miesiącach" },
  { emoji: "🌱", name: "Nowa klientka", desc: "Pierwsze 1-2 zakupy w ciągu ostatnich 60 dni" },
  { emoji: "😴", name: "Uśpiona", desc: "Nic nie kupiła od ponad 90 dni" },
  { emoji: "🎯", name: "Sezonowa", desc: "Kupuje tylko w określonych porach roku" },
  { emoji: "🧪", name: "Odkrywczyni", desc: "Testuje różne kategorie produktów" },
];

export function ConsultationModule({ isDemo }: Props) {
  const { t } = useTranslation();
  const { data: templates = [] } = useConsultationTemplates();
  const { data: serviceCards = [] } = useServiceConsultationCards();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendCardId, setSendCardId] = useState<string | undefined>();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  const displayTemplates = isDemo
    ? [
        { id: "demo-1", name: "Karta konsultacyjna — Twarz", fields: Array(8).fill(null) as ConsultationField[], is_active: true, category: "face", estimated_minutes: 4, salon_id: "", is_system: false, created_at: "", updated_at: "" },
        { id: "demo-2", name: "Wywiad przed pierwszą wizytą", fields: Array(5).fill(null) as ConsultationField[], is_active: true, category: "general", estimated_minutes: 3, salon_id: "", is_system: false, created_at: "", updated_at: "" },
        { id: "demo-3", name: "RODO — Zgoda ogólna", fields: Array(3).fill(null) as ConsultationField[], is_active: false, category: "rodo", estimated_minutes: 1, salon_id: "", is_system: false, created_at: "", updated_at: "" },
      ]
    : templates;

  const getAssignedServices = (cardId: string) => {
    return serviceCards.filter(sc => sc.card_id === cardId).length;
  };

  const openSend = (cardId: string) => {
    setSendCardId(cardId);
    setShowSendModal(true);
  };

  const openEdit = (tpl: any) => {
    setEditTemplate(tpl);
    setShowBuilder(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">{t("consultation.title")}</h2>
        <p className="text-muted-foreground">{t("consultation.subtitle")}</p>
      </div>

      <SectionGuide sectionKey="consultation" />

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Moje karty</span>
          </TabsTrigger>
          <TabsTrigger value="assign" className="gap-2">
            <Link2 className="w-4 h-4" />
            <span className="hidden sm:inline">Przypisanie do usług</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">Historia wysyłek</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: My Cards */}
        <TabsContent value="cards" className="mt-6 space-y-6">
          {/* Header buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={() => { setEditTemplate(null); setShowBuilder(true); }} className="gap-2">
              <Sparkles className="w-4 h-4" /> Utwórz z szablonu
            </Button>
            <Button variant="outline" onClick={() => { setEditTemplate(null); setShowBuilder(true); }} className="gap-2">
              <Plus className="w-4 h-4" /> Utwórz od zera
            </Button>
          </div>

          {/* Starter templates - show when no cards */}
          {displayTemplates.length === 0 && (
            <div>
              <p className="text-sm font-medium mb-3">Gotowe szablony do kliknięcia</p>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {STARTER_TEMPLATES.map(tpl => (
                  <Card key={tpl.name} className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/30" onClick={() => { setEditTemplate(null); setShowBuilder(true); }}>
                    <CardContent className="py-4 space-y-2">
                      <span className="text-2xl">{tpl.emoji}</span>
                      <p className="font-medium text-sm">{tpl.name}</p>
                      <p className="text-xs text-muted-foreground">{tpl.questionsCount} pytań · {tpl.minutes} min</p>
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs">Użyj szablonu →</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Existing cards list */}
          {displayTemplates.length > 0 && (
            <div className="space-y-3">
              {displayTemplates.map(tpl => {
                const cat = CATEGORY_MAP[(tpl as any).category || "general"] || CATEGORY_MAP.general;
                const assignedCount = isDemo ? (tpl.id === "demo-1" ? 2 : 0) : getAssignedServices(tpl.id);
                return (
                  <Card key={tpl.id} className="hover:shadow-sm transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg shrink-0">
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-sm">{tpl.name}</p>
                            {(tpl as any).is_active !== false ? (
                              <Badge variant="default" className="text-xs">Aktywna</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Nieaktywna</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {tpl.fields.length} pytań · ~{(tpl as any).estimated_minutes || 3} min · {cat.label}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Przypisana do: {assignedCount > 0 ? `${assignedCount} usług` : "żadnej usługi"}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => openSend(tpl.id)}>
                            <Send className="w-3.5 h-3.5" /> Wyślij
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => openEdit(tpl)}>
                            <Edit className="w-3.5 h-3.5" /> Edytuj
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-1 text-xs">
                            <Eye className="w-3.5 h-3.5" /> Podgląd
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: Service Assignment */}
        <TabsContent value="assign" className="mt-6">
          <ServiceCardAssignment isDemo={isDemo} />
        </TabsContent>

        {/* TAB 3: Send History */}
        <TabsContent value="history" className="mt-6">
          <SendsHistory isDemo={isDemo} />
        </TabsContent>
      </Tabs>

      {/* Builder Modal */}
      {showBuilder && (
        <EasyCardBuilder
          isOpen={showBuilder}
          onClose={() => { setShowBuilder(false); setEditTemplate(null); }}
          isDemo={isDemo}
          editTemplate={editTemplate}
        />
      )}

      {/* Send Modal */}
      {showSendModal && (
        <SendCardModal
          isOpen={showSendModal}
          onClose={() => { setShowSendModal(false); setSendCardId(undefined); }}
          isDemo={isDemo}
          preselectedCardId={sendCardId}
        />
      )}
    </div>
  );
}
