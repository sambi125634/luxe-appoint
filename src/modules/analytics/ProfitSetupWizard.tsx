import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Package, Target, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function ProfitSetupWizard({ onClose }: Props) {
  return (
    <Card className="border-primary/30">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Skonfiguruj True Profit</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <StepCard
            icon={<Settings className="w-5 h-5 text-primary" />}
            step={1}
            title="Stawki pracowników"
            description="Ustaw stawkę zł/h lub % prowizji dla każdego pracownika"
            cta="Przejdź do personelu"
          />
          <StepCard
            icon={<Package className="w-5 h-5 text-primary" />}
            step={2}
            title="Koszty materiałów"
            description="Dodaj receptury usług w module Magazyn & Receptury"
            cta="Przejdź do magazynu"
          />
          <StepCard
            icon={<Target className="w-5 h-5 text-primary" />}
            step={3}
            title="Źródła klientek"
            description="Uzupełnij źródło pozyskania w kartach klientek"
            cta="Przejdź do klientek"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function StepCard({ icon, step, title, description, cta }: {
  icon: React.ReactNode;
  step: number;
  title: string;
  description: string;
  cta: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
          {step}
        </span>
        {icon}
      </div>
      <h4 className="font-medium text-sm">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
      <Button variant="outline" size="sm" className="w-full text-xs">
        {cta}
      </Button>
    </div>
  );
}
