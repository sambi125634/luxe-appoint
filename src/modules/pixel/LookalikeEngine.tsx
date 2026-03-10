import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, TrendingUp, Info } from "lucide-react";
import { MOCK_HEALTH } from "./mock-data";
import { toast } from "sonner";

interface LookalikeEngineProps {
  isDemo?: boolean;
}

export function LookalikeEngine({ isDemo }: LookalikeEngineProps) {
  const audiences = MOCK_HEALTH.audiences.filter(a => !a.isExclusion);
  const eligibleAudiences = audiences.filter(a => a.size >= 100);
  const growingAudiences = audiences.filter(a => a.size < 100 && a.size >= 50);

  const handleCreateLookalike = (name: string, percent: string) => {
    toast.success(`Lookalike ${percent} dla "${name}" ${isDemo ? "zostałby utworzony" : "tworzony w Meta..."}`);
  };

  return (
    <div className="space-y-4">
      {/* Eligible for Lookalike */}
      {eligibleAudiences.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Gotowe do Lookalike!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {eligibleAudiences.map((aud) => (
              <div key={aud.name} className="p-4 rounded-lg bg-background border space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{aud.name}</p>
                    <p className="text-xs text-muted-foreground">
                      <Users className="w-3 h-3 inline mr-1" />{aud.size} osób
                    </p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0">✓ Kwalifikuje się</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Meta znajdzie kobiety podobne do Twoich najlepszych klientek w Twoim mieście.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCreateLookalike(aud.name, "1%")}
                    className="flex-1"
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Lookalike 1%
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateLookalike(aud.name, "2-3%")}
                    className="flex-1"
                  >
                    Lookalike 2-3%
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Growing audiences */}
      {growingAudiences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Rosną — jeszcze trochę!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {growingAudiences.map((aud) => (
              <div key={aud.name} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{aud.name}</p>
                  <p className="text-xs text-muted-foreground">{aud.size}/100 osób</p>
                </div>
                <div className="w-20 h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(aud.size, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card>
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground space-y-1">
            <p><strong>Czym jest Lookalike Audience?</strong></p>
            <p>Meta analizuje Twoje najlepsze klientki (VIP, powracające) i znajduje nowe osoby o podobnym profilu w Twojej okolicy. To najtańszy sposób na pozyskanie klientek z reklam.</p>
            <p className="text-xs">Minimum 100 osób w audience źródłowej. Im większa audience, tym lepsze wyniki.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
