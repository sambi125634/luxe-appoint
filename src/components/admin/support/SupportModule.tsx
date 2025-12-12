import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ExternalLink, Mail, HelpCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SupportChat } from "./SupportChat";
import { SupportQuickActions } from "./SupportQuickActions";
import { useState } from "react";

export function SupportModule() {
  const { t } = useTranslation();
  const [initialMessage, setInitialMessage] = useState<string | null>(null);

  const handleQuickAction = (message: string) => {
    setInitialMessage(message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-primary to-secondary flex items-center justify-center shadow-lg">
          <HelpCircle className="w-7 h-7 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-semibold">Pomoc & AI Asystent</h1>
          <p className="text-muted-foreground">Zapytaj o cokolwiek związanego z Beauty Calendar</p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium text-foreground">AI Asystent zna całą platformę Beauty Calendar</p>
              <p className="text-sm text-muted-foreground">
                Zapytaj o konfigurację płatności, dodawanie usług, ustawienia grafiku, integracje i więcej. Odpowiem na każde pytanie!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chat Area */}
        <div className="lg:col-span-2">
          <SupportChat initialMessage={initialMessage} onMessageSent={() => setInitialMessage(null)} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <SupportQuickActions onSelect={handleQuickAction} />

          {/* Contact Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Potrzebujesz ludzkiej pomocy?
              </CardTitle>
              <CardDescription>Skontaktuj się z naszym zespołem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a href="mailto:support@beautyfunnel.pl">
                  <Mail className="w-4 h-4" />
                  support@beautyfunnel.pl
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" asChild>
                <a href="https://docs.beautycalendar.pl" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  Dokumentacja
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
