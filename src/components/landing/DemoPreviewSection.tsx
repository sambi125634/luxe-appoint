import { Button } from "@/components/ui/button";
import { Calendar, Settings, Play } from "lucide-react";
import AnimatedMockup from "./AnimatedMockup";

const DemoPreviewSection = () => {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-deep/5 to-background" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-violet-deep/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-burgundy/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-deep/10 rounded-full text-sm text-violet-deep mb-4">
            <Play className="w-4 h-4" />
            Interaktywny podgląd
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Zobacz, jak to działa
          </h2>
          <p className="text-muted-foreground text-lg">
            Przeglądaj ekrany platformy i odkryj możliwości Beauty Calendar
          </p>
        </div>
        
        <AnimatedMockup />
          
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-violet-deep to-burgundy hover:opacity-90 text-white px-8 shadow-lg shadow-violet-deep/25"
            onClick={() => window.location.href = '/book/demo-salon'}
          >
            Wypróbuj rezerwację
            <Calendar className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            size="lg"
            variant="outline"
            className="border-violet-deep/30 text-foreground hover:bg-violet-deep/10 px-8"
            onClick={() => window.location.href = '/demo'}
          >
            Pełny panel demo
            <Settings className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoPreviewSection;
