import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, FileText, Mic } from "lucide-react";
import { CardBuilder } from "./CardBuilder";
import { ClientConsultations } from "./ClientConsultations";
import { VoiceNoteRecorder } from "./VoiceNoteRecorder";

interface Props {
  isDemo?: boolean;
}

export function ConsultationModule({ isDemo }: Props) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold">{t("consultation.title")}</h2>
        <p className="text-muted-foreground">{t("consultation.subtitle")}</p>
      </div>

      <Tabs defaultValue="cards" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cards" className="gap-2">
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">{t("consultation.cards")}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{t("consultation.templates")}</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">{t("consultation.voiceNotes")}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="mt-6">
          <ClientConsultations isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <CardBuilder isDemo={isDemo} />
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          <VoiceNoteRecorder isDemo={isDemo} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
