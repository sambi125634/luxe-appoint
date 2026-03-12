import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, ExternalLink, Info } from "lucide-react";
import { MOCK_HEALTH } from "./mock-data";

interface PixelHealthDashboardProps {
  isDemo?: boolean;
}

export function PixelHealthDashboard({ isDemo }: PixelHealthDashboardProps) {
  const health = MOCK_HEALTH;

  return (
    <div className="space-y-4">
      {/* Status card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Status Pixela</p>
              <Badge variant="outline" className="text-green-600 border-green-300 mt-0.5">
                Aktywny
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Zap className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{health.eventsLast30d}</p>
              <p className="text-xs text-muted-foreground">Eventów CAPI (30 dni)</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <Users className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{health.audiences.length}</p>
              <p className="text-xs text-muted-foreground">Custom Audiences</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info: Event Match Quality */}
      <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-blue-900 dark:text-blue-200">Event Match Quality & Health</p>
            <p className="text-blue-700 dark:text-blue-400 mt-1">
              Pełne dane o jakości dopasowania eventów (EMQ), deduplikacji i diagnostyce znajdziesz 
              w <strong>Meta Events Manager</strong> → zakładka Pixel → Diagnostyka.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Info: Attribution / ROAS */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardContent className="p-4 flex items-start gap-3">
          <ExternalLink className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-200">ROAS i Atrybucja</p>
            <p className="text-amber-700 dark:text-amber-400 mt-1">
              Dane o atrybucji kampanii i ROAS są dostępne wyłącznie w <strong>Meta Ads Manager</strong>. 
              Eventy wysłane przez CAPI z tego systemu automatycznie trafiają do Twoich kampanii i wpływają na optymalizację.
            </p>
            <p className="text-amber-700 dark:text-amber-400 mt-2">
              💡 <strong>Tip:</strong> Dodaj parametry UTM do linków w reklamach, aby śledzić źródło rezerwacji bezpośrednio w tym systemie.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
