import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Target, BarChart3 } from "lucide-react";
import { MOCK_ATTRIBUTIONS } from "./mock-data";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface PixelAttributionProps {
  isDemo?: boolean;
}

export function PixelAttribution({ isDemo }: PixelAttributionProps) {
  const [adSpend, setAdSpend] = useState(800);
  const attributions = MOCK_ATTRIBUTIONS;
  const totalRevenue = attributions.reduce((sum, a) => sum + a.revenue, 0);
  const roas = adSpend > 0 ? (totalRevenue / adSpend).toFixed(2) : "—";

  return (
    <div className="space-y-4">
      {/* ROAS overview */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold text-primary">{roas}x</p>
            <p className="text-xs text-muted-foreground">ROAS</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-2xl font-bold">{totalRevenue} zł</p>
            <p className="text-xs text-muted-foreground">Przychód z kampanii</p>
          </CardContent>
        </Card>
      </div>

      {/* Ad spend input */}
      <Card>
        <CardContent className="p-4">
          <Label className="text-sm">Wydatki reklamowe (ten miesiąc)</Label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="number"
              value={adSpend}
              onChange={(e) => setAdSpend(Number(e.target.value))}
              className="max-w-32"
            />
            <span className="text-sm text-muted-foreground">zł</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            W przyszłości: automatyczny import z Meta Ads Manager
          </p>
        </CardContent>
      </Card>

      {/* Attribution list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4" />
            Rezerwacje z kampanii ({attributions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {attributions.map((attr) => (
            <div key={attr.id} className="p-3 rounded-lg border space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">{attr.audience_name}</Badge>
                <span className="font-bold text-sm text-primary">{attr.revenue} zł</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{attr.ad_campaign}</span>
                <span>{format(new Date(attr.created_at), "dd MMM yyyy", { locale: pl })}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <BarChart3 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Atrybucja działa automatycznie: każda rezerwacja klientki, która była w Custom Audience i zobaczyła reklamę,
              otrzymuje tag <Badge variant="outline" className="text-xs mx-1">z-kampanii</Badge> a wartość wizyty
              jest doliczana do ROAS.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
