import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { ProfitSummary } from './types';

interface Props {
  summary: ProfitSummary;
  monthChange: number;
}

export function MonthlyProfitCard({ summary, monthChange }: Props) {
  const isUp = monthChange >= 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          Ten miesiąc
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1.5 text-sm">
          <Row label="Przychód" value={summary.revenue} />
          <Row label="Koszty materiałów" value={-summary.materialCosts} negative />
          <Row label="Koszty pracowników" value={-summary.staffCosts} negative />
          <Row label="Koszty akwizycji" value={-summary.acquisitionCosts} negative />
          <div className="border-t border-border pt-2 flex justify-between items-center">
            <span className="font-semibold">TRUE PROFIT</span>
            <div className="text-right">
              <span className="text-lg font-bold text-primary">
                {summary.trueProfit.toFixed(0)} zł
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                ({summary.trueMargin.toFixed(0)}%)
              </span>
            </div>
          </div>
        </div>

        {monthChange !== 0 && (
          <div className={`flex items-center gap-1 text-xs ${isUp ? 'text-emerald-600' : 'text-red-500'}`}>
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isUp ? '+' : ''}{monthChange.toFixed(1)}% vs poprzedni miesiąc
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Row({ label, value, negative }: { label: string; value: number; negative?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={negative ? 'text-red-500' : ''}>
        {value < 0 ? '-' : ''}{Math.abs(value).toFixed(0)} zł
      </span>
    </div>
  );
}
