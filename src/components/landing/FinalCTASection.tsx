import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Sparkles } from "lucide-react";

interface FinalCTASectionProps {
  onScrollToForm: () => void;
}

const FinalCTASection = ({ onScrollToForm }: FinalCTASectionProps) => {
  const { t } = useTranslation();

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-deep via-burgundy to-violet-deep" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 mb-8">
            <Sparkles className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-white/90">{t("finalCta.subtitle")}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            {t("finalCta.title")}
          </h2>
          
          <p className="text-lg text-white/80 mb-10 max-w-xl mx-auto">
            {t("hero.description")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gold hover:bg-gold/90 text-background px-8 py-6 text-lg font-semibold group"
              onClick={() => window.location.href = '/demo'}
            >
              <Calendar className="mr-2 h-5 w-5" />
              {t("hero.secondaryCta")}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-2 border-white/30 bg-white/10 hover:bg-white/20 text-white px-8 py-6 text-lg"
              onClick={onScrollToForm}
            >
              {t("nav.bookDemo")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
