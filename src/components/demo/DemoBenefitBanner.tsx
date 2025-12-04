import { Lightbulb } from "lucide-react";
import { useTranslation } from "react-i18next";

interface DemoBenefitBannerProps {
  benefitKey: string;
}

export function DemoBenefitBanner({ benefitKey }: DemoBenefitBannerProps) {
  const { t } = useTranslation();
  
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20 rounded-xl animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-sm text-primary mb-1">
            {t("demo.benefits.forYou")}
          </p>
          <p className="text-sm text-muted-foreground">
            {t(`demo.benefits.${benefitKey}`)}
          </p>
        </div>
      </div>
    </div>
  );
}
