import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Trophy } from 'lucide-react';
import { ServiceProfit } from './types';

interface Props { services: ServiceProfit[]; hasMaterialData: boolean; }

export function ServiceProfitRanking({ services, hasMaterialData }: Props) {
  const { t } = useTranslation();
  const count = services.length;
  const topThird = Math.ceil(count / 3);
  const getTier = (index: number): 'top' | 'mid' | 'low' => { if (index < topThird) return 'top'; if (index < topThird * 2) return 'mid'; return 'low'; };
  const tierColors = { top: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30', mid: 'bg-amber-500/10 text-amber-700 border-amber-500/30', low: 'bg-red-500/10 text-red-700 border-red-500/30' };
  const worstHigh = services.find((s, i) => getTier(i) === 'low' && s.price >= 150 && s.trueProfitPerHour < 40);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2"><Trophy className="w-4 h-4 text-primary" />{t('trueProfit.serviceRanking')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {worstHigh && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span>{t('trueProfit.serviceAlert', { name: worstHigh.serviceName, price: worstHigh.price.toFixed(0), tp: worstHigh.trueProfitPerHour.toFixed(0) })}</span>
          </div>
        )}
        <div className="overflow-x-auto -mx-4 px-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('trueProfit.serviceCol')}</TableHead>
                <TableHead className="text-right">{t('trueProfit.priceCol')}</TableHead>
                <TableHead className="text-right">{t('trueProfit.materialCostCol')}</TableHead>
                <TableHead className="text-right">{t('trueProfit.durationCol')}</TableHead>
                <TableHead className="text-right">{t('trueProfit.tpVisit')}</TableHead>
                <TableHead className="text-right">{t('trueProfit.tpHour')}</TableHead>
                <TableHead className="text-right">{t('trueProfit.executedCol')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((s, i) => (
                <TableRow key={s.serviceId}>
                  <TableCell className="font-medium max-w-[150px] truncate">{s.serviceName}</TableCell>
                  <TableCell className="text-right">{s.price.toFixed(0)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{s.hasMaterialData ? s.materialCost.toFixed(0) : '—'}</TableCell>
                  <TableCell className="text-right">{s.duration} min</TableCell>
                  <TableCell className="text-right">{s.trueProfitPerVisit.toFixed(0)} zł</TableCell>
                  <TableCell className="text-right"><Badge variant="outline" className={tierColors[getTier(i)]}>{s.trueProfitPerHour.toFixed(0)} zł/h</Badge></TableCell>
                  <TableCell className="text-right">{s.executionCount}</TableCell>
                </TableRow>
              ))}
              {services.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">{t('trueProfit.noServiceData')}</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {!hasMaterialData && services.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">{t('trueProfit.noMaterialCostsWarning')}</p>
        )}
      </CardContent>
    </Card>
  );
}
