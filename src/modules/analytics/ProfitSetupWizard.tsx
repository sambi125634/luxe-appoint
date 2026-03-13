import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Package, Target, X } from 'lucide-react';

interface Props { onClose: () => void; onNavigate?: (tab: string) => void; }

export function ProfitSetupWizard({ onClose, onNavigate }: Props) {
  const { t } = useTranslation();
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">{t('trueProfit.setupTitle')}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8"><X className="w-4 h-4" /></Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StepCard icon={<Settings className="w-5 h-5 text-primary" />} step={1} title={t('trueProfit.setupStep1Title')} description={t('trueProfit.setupStep1Desc')} cta={t('trueProfit.setupStep1Cta')} onAction={() => onNavigate?.('staff')} />
          <StepCard icon={<Package className="w-5 h-5 text-primary" />} step={2} title={t('trueProfit.setupStep2Title')} description={t('trueProfit.setupStep2Desc')} cta={t('trueProfit.setupStep2Cta')} onAction={() => onNavigate?.('products')} />
          <StepCard icon={<Target className="w-5 h-5 text-primary" />} step={3} title={t('trueProfit.setupStep3Title')} description={t('trueProfit.setupStep3Desc')} cta={t('trueProfit.setupStep3Cta')} onAction={() => onNavigate?.('clients')} />
        </div>
      </CardContent>
    </Card>
  );
}

function StepCard({ icon, step, title, description, cta, onAction }: { icon: React.ReactNode; step: number; title: string; description: string; cta: string; onAction?: () => void; }) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{step}</span>
        {icon}
      </div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Button variant="outline" size="sm" className="w-full text-xs" onClick={onAction}>{cta}</Button>
    </div>
  );
}
