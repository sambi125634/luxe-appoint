import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Users, Zap, TrendingUp, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { MOCK_HEALTH } from "./mock-data";
import { PixelHealthScore } from "./types";

interface PixelHealthDashboardProps {
  isDemo?: boolean;
}

const scoreConfig: Record<PixelHealthScore, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  excellent: { label: "Doskonały", color: "text-green-500", icon: CheckCircle2 },
  good: { label: "Dobry", color: "text-yellow-500", icon: AlertTriangle },
  poor: { label: "Słaby", color: "text-destructive", icon: XCircle },
};

export function PixelHealthDashboard({ isDemo }: PixelHealthDashboardProps) {
  const health = MOCK_HEALTH;
  const config = scoreConfig[health.score];
  const ScoreIcon = config.icon;

  return (
    <div className="space-y-4">
      {/* Overall score */}
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center`}>
              <ScoreIcon className={`w-8 h-8 ${config.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Jakość Pixela</p>
              <p className={`text-2xl font-bold ${config.color}`}>{config.label}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Event Match Quality: {health.eventMatchQuality}%
              </p>
            </div>
          </div>
          <Progress value={health.eventMatchQuality} className="mt-4 h-2" />
        </CardContent>
      </Card>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{health.eventsLast30d}</p>
            <p className="text-xs text-muted-foreground">Eventów (30 dni)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{health.audiences.length}</p>
            <p className="text-xs text-muted-foreground">Custom Audiences</p>
          </CardContent>
        </Card>
      </div>

      {/* Audiences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Custom Audiences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {health.audiences.map((aud) => (
            <div key={aud.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{aud.name}</span>
                {aud.isExclusion && (
                  <Badge variant="destructive" className="text-xs shrink-0">Exclude</Badge>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-medium">{aud.size}</p>
                <p className="text-xs text-muted-foreground">osób</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Rekomendacje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {health.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <Activity className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{rec}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
