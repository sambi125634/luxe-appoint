import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, Calendar, Users, Code, Bell, Package, 
  Settings, BarChart3, MessageSquare, HelpCircle 
} from "lucide-react";

interface SupportQuickActionsProps {
  onSelect: (message: string) => void;
}

const quickActions = [
  { icon: CreditCard, labelKey: "support.quick.payments", message: "Jak skonfigurować płatności Przelewy24?" },
  { icon: Calendar, labelKey: "support.quick.service", message: "Jak dodać nową usługę do oferty?" },
  { icon: Users, labelKey: "support.quick.staff", message: "Jak ustawić grafik pracy pracownika?" },
  { icon: Code, labelKey: "support.quick.embed", message: "Jak osadzić widget rezerwacji na mojej stronie?" },
  { icon: Bell, labelKey: "support.quick.sms", message: "Jak włączyć przypomnienia SMS dla klientów?" },
  { icon: Package, labelKey: "support.quick.products", message: "Jak dodać produkty do sprzedaży?" },
  { icon: Settings, labelKey: "support.quick.settings", message: "Jak zmienić logo i kolory mojego salonu?" },
  { icon: BarChart3, labelKey: "support.quick.reports", message: "Jak wygenerować raport dla księgowego?" },
];

export function SupportQuickActions({ onSelect }: SupportQuickActionsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          {t("support.quickActions")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="justify-start h-auto py-2 px-3 text-left"
            onClick={() => onSelect(action.message)}
          >
            <action.icon className="w-4 h-4 mr-2 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm">{t(action.labelKey)}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
