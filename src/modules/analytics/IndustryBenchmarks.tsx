import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BarChart3 } from 'lucide-react';
import { ProfitSummary, INDUSTRY_BENCHMARKS } from './types';

interface Props { summary: ProfitSummary; }

export function IndustryBenchmarks({ summary }: Props) {
  const { t } = useTranslation();
  const yourMaterialPct = summary.revenue > 0 ? (summary.materialCosts / summary.revenue) * 100 : 0;
  const yourStaffPct = summary.revenue > 0 ? (summary.staffCosts / summary.revenue) * 100 : 0;

  const benchmarks = [
    { label: 'True Margin', yours: summary.trueMargin, avg: INDUSTRY_BENCHMARKS.trueMargin, unit: '%', higherIsBetter: true },
    { label: t('trueProfit.materialCostsBenchmark'), yours: yourMaterialPct, avg: INDUSTRY_BENCHMARKS.materialCostPct, unit: `% ${t('trueProfit.ofRevenue')}`, higherIsBetter: false },
    { label: t('trueProfit.staffCostsBenchmark'), yours: yourStaffPct, avg: INDUSTRY_BENCHMARKS.staffCostPct, unit: `% ${t('trueProfit.ofRevenue')}`, higherIsBetter: false },
  ];

  const mainDiff = benchmarks.find((b) => {
    const diff = b.higherIsBetter ? INDUSTRY_BENCHMARKS.trueMargin - summary.trueMargin : summary.trueMargin - INDUSTRY_BENCHMARKS.trueMargin;
    return diff > 3;
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />{t('trueProfit.benchmarks')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-muted/30 rounded-lg p-4 text-sm">
          <p className="text-muted-foreground mb-1">{t('trueProfit.salonsLikeYours')}</p>
          <p>{t('trueProfit.trueMarginAvg')}: <strong>{INDUSTRY_BENCHMARKS.trueMargin}%</strong>. {t('trueProfit.yours')}: <strong className={summary.trueMargin >= INDUSTRY_BENCHMARKS.trueMargin ? 'text-emerald-600' : 'text-red-500'}>{summary.trueMargin.toFixed(0)}%</strong></p>
          {mainDiff && <p className="mt-1 text-muted-foreground">{t('trueProfit.mainDifference')}: {mainDiff.label.toLowerCase()} ({t('trueProfit.yours')}: {mainDiff.yours.toFixed(0)}{mainDiff.unit}, avg: {mainDiff.avg}{mainDiff.unit}).</p>}
        </div>
        <div className="space-y-4">
          {benchmarks.map((b) => {
            const isGood = b.higherIsBetter ? b.yours >= b.avg : b.yours <= b.avg;
            return (
              <div key={b.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{b.label}</span>
                  <span className={isGood ? 'text-emerald-600' : 'text-amber-600'}>{b.yours.toFixed(1)}{b.unit} vs {b.avg}{b.unit}</span>
                </div>
                <div className="relative">
                  <Progress value={Math.min(100, (b.yours / Math.max(b.avg * 1.5, 1)) * 100)} className="h-2" />
                  <div className="absolute top-0 h-2 w-0.5 bg-foreground/60" style={{ left: `${Math.min(100, (b.avg / (b.avg * 1.5)) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
