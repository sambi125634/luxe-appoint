import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Clock } from 'lucide-react';
import { ProfitSummary } from './types';

interface Props { summary: ProfitSummary; bestService: { name: string; tpPerHour: number } | null; }

export function TodayProfitCard({ summary, bestService }: Props) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />{t('trueProfit.today')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-end">
          <div><p className="text-xs text-muted-foreground">{t('trueProfit.revenue')}</p><p className="text-2xl font-bold">{summary.revenue.toFixed(0)} zł</p></div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">{t('trueProfit.trueProfit')}</p>
            <p className="text-2xl font-bold text-primary">{summary.trueProfit.toFixed(0)} zł</p>
            <p className="text-xs text-muted-foreground">({summary.trueMargin.toFixed(0)}%)</p>
          </div>
        </div>
        {bestService && (
          <div className="flex items-center gap-2 text-sm bg-muted/50 rounded-lg px-3 py-2">
            <Clock className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground">{t('trueProfit.bestToday')}</span>
            <span className="font-medium truncate">{bestService.name}</span>
            <span className="ml-auto font-semibold text-primary whitespace-nowrap">{bestService.tpPerHour.toFixed(0)} zł/h</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
