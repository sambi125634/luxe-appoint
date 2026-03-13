import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TodayProfitCard } from './TodayProfitCard';
import { MonthlyProfitCard } from './MonthlyProfitCard';
import { ServiceProfitRanking } from './ServiceProfitRanking';
import { ClientLTVRanking } from './ClientLTVRanking';
import { CashflowForecast } from './CashflowForecast';
import { IndustryBenchmarks } from './IndustryBenchmarks';
import { ProfitSetupWizard } from './ProfitSetupWizard';
import { useTrueProfit } from '@/hooks/useTrueProfit';
import { getDemoTrueProfitData } from './demoTrueProfitData';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props { isDemo?: boolean; onNavigate?: (tab: string) => void; }

export function TrueProfitDashboard({ isDemo, onNavigate }: Props) {
  const { t } = useTranslation();
  const liveProfit = useTrueProfit();
  const profit = isDemo ? getDemoTrueProfitData() : liveProfit;
  const [showSetup, setShowSetup] = useState(false);
  const showEstimateWarning = !isDemo && (!profit.hasMaterialData || !profit.hasStaffRates);

  return (
    <div className="space-y-6">
      {showEstimateWarning && !isDemo && (
        <Alert className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-sm">
            {t('trueProfit.estimateWarning')}
            {!profit.hasMaterialData && ` ${t('trueProfit.noMaterialData')}`}
            {!profit.hasStaffRates && ` ${t('trueProfit.defaultStaffRate')}`}.{' '}
            <button onClick={() => setShowSetup(true)} className="underline font-medium text-foreground">{t('trueProfit.configureData')}</button>
          </AlertDescription>
        </Alert>
      )}
      {showSetup && <ProfitSetupWizard onClose={() => setShowSetup(false)} />}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TodayProfitCard summary={profit.todaySummary} bestService={profit.bestServiceToday} />
        <MonthlyProfitCard summary={profit.monthlySummary} monthChange={profit.monthOverMonthChange} />
      </div>
      <Tabs defaultValue="services" className="w-full">
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="services" className="flex-1 min-w-0">{t('trueProfit.servicesTab')}</TabsTrigger>
          <TabsTrigger value="clients" className="flex-1 min-w-0">{t('trueProfit.clientsTab')}</TabsTrigger>
          <TabsTrigger value="forecast" className="flex-1 min-w-0">{t('trueProfit.forecastTab')}</TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex-1 min-w-0">{t('trueProfit.benchmarksTab')}</TabsTrigger>
        </TabsList>
        <TabsContent value="services"><ServiceProfitRanking services={profit.serviceProfits} hasMaterialData={profit.hasMaterialData} /></TabsContent>
        <TabsContent value="clients"><ClientLTVRanking clients={profit.clientLTVs} /></TabsContent>
        <TabsContent value="forecast"><CashflowForecast monthlySummary={profit.monthlySummary} /></TabsContent>
        <TabsContent value="benchmarks"><IndustryBenchmarks summary={profit.monthlySummary} /></TabsContent>
      </Tabs>
    </div>
  );
}
