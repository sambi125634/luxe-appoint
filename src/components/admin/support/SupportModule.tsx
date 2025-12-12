import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, ExternalLink, Mail } from "lucide-react";
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
      <div>
        <h1 className="text-2xl font-serif font-semibold">{t("support.title")}</h1>
        <p className="text-muted-foreground">{t("support.subtitle")}</p>
      </div>

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
              <CardTitle className="text-base">{t("support.needHuman")}</CardTitle>
              <CardDescription>{t("support.humanDescription")}</CardDescription>
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
                  {t("support.documentation")}
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
