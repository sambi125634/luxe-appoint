import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, CreditCard, Headphones, Sparkles, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface NewFinalCTASectionProps {
  onScrollToForm: () => void;
}

export const NewFinalCTASection = ({ onScrollToForm }: NewFinalCTASectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 animate-pulse">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-rose-500 to-orange-500 rounded-full text-white font-bold shadow-lg">
              <Clock className="w-5 h-5" />
              <span>{t('landing.newFinalCta.urgency')}</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full text-accent mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">{t('landing.newFinalCta.badge')}</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
            {t('landing.newFinalCta.title')}{" "}
            <span className="text-gradient-luxury">{t('landing.newFinalCta.titleHighlight')}</span>
          </h2>

          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            {t('landing.newFinalCta.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={onScrollToForm}
              className="group relative overflow-hidden px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                {t('landing.newFinalCta.cta')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              asChild
              className="group px-8 py-6 text-lg border-2"
            >
              <Link to="/demo">
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs text-muted-foreground">{t('landing.newFinalCta.secondaryCta')}</span>
                  <span className="flex items-center gap-1">
                    {t('landing.newFinalCta.secondaryCtaDesc')}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">{t('landing.newFinalCta.security')}</div>
                <div>{t('landing.newFinalCta.securityDesc')}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">{t('landing.newFinalCta.payments')}</div>
                <div>{t('landing.newFinalCta.paymentsDesc')}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Headphones className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium text-foreground">{t('landing.newFinalCta.supportLabel')}</div>
                <div>{t('landing.newFinalCta.supportDesc')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
