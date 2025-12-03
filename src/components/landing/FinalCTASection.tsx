import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface FinalCTASectionProps {
  onScrollToForm: () => void;
}

export function FinalCTASection({ onScrollToForm }: FinalCTASectionProps) {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto relative">
        <div className="glass-card-elevated p-12 md:p-16 text-center bg-gradient-to-r from-primary/5 via-transparent to-secondary/5">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 rounded-full text-accent-foreground text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Rozpocznij już dziś
          </div>
          
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 max-w-3xl mx-auto">
            Twój salon zasługuje na 
            <span className="text-gradient-luxury"> piękny kalendarz</span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Dołącz do salonów, które już korzystają z Beauty Calendar i ciesz się profesjonalnym systemem rezerwacji – w końcu po polsku.
          </p>
          
          <Button 
            variant="luxury" 
            size="xl" 
            className="gap-2"
            onClick={onScrollToForm}
          >
            Zgłoś swój salon po dostęp do demo
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}