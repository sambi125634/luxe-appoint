import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, Calendar, Users, Code, Bell, Package, 
  Settings, BarChart3, Lightbulb
} from "lucide-react";

interface SupportQuickActionsProps {
  onSelect: (message: string) => void;
}

const quickActions = [
  { icon: CreditCard, label: "Jak skonfigurować płatności?", message: "Jak skonfigurować płatności Przelewy24?" },
  { icon: Calendar, label: "Jak dodać nową usługę?", message: "Jak dodać nową usługę do oferty?" },
  { icon: Users, label: "Jak ustawić grafik pracownika?", message: "Jak ustawić grafik pracy pracownika?" },
  { icon: Code, label: "Jak osadzić widget na stronie?", message: "Jak osadzić widget rezerwacji na mojej stronie?" },
  { icon: Bell, label: "Jak włączyć przypomnienia SMS?", message: "Jak włączyć przypomnienia SMS dla klientów?" },
  { icon: Package, label: "Jak dodać produkty?", message: "Jak dodać produkty do sprzedaży?" },
  { icon: Settings, label: "Jak zmienić logo salonu?", message: "Jak zmienić logo i kolory mojego salonu?" },
  { icon: BarChart3, label: "Jak wygenerować raport?", message: "Jak wygenerować raport dla księgowego?" },
];

export function SupportQuickActions({ onSelect }: SupportQuickActionsProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          Szybkie pytania
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="justify-start h-auto py-2.5 px-3 text-left hover:bg-primary/10"
            onClick={() => onSelect(action.message)}
          >
            <action.icon className="w-4 h-4 mr-3 flex-shrink-0 text-primary" />
            <span className="text-sm">{action.label}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
