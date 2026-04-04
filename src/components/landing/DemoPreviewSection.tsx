import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const DemoPreviewSection = () => {
  const [iframeError, setIframeError] = useState(false);

  return (
    <section className="py-20 relative overflow-hidden" id="demo-preview">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary mb-4 font-medium">
            <Settings className="w-4 h-4" />
            Interaktywny podgląd
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Przeklikaj panel — zobacz jak zarządzasz salonem
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pełny panel administracyjny z przykładowymi danymi. Bez rejestracji, bez zobowiązań.
          </p>
        </motion.div>

        {/* Laptop mockup */}
        <motion.div
          className="max-w-5xl mx-auto mb-10"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Laptop lid */}
          <div className="rounded-t-2xl border border-border/60 bg-[#1a1a1a] p-2 pt-2 shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-t-lg bg-muted/20">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-background/80 rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                  calendar.beauty-funnels.com/demo
                </div>
              </div>
            </div>

            {/* Screen */}
            <div className="w-full bg-background rounded-b-lg overflow-hidden" style={{ aspectRatio: "16/10" }}>
              {iframeError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-muted/30">
                  <span className="text-5xl mb-4">💻</span>
                  <p className="font-bold text-foreground mb-2">Demo ładuje się...</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Kliknij poniżej aby zobaczyć pełną wersję panelu
                  </p>
                  <a
                    href="/demo"
                    className="bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium"
                  >
                    Otwórz demo →
                  </a>
                </div>
              ) : (
                <iframe
                  src="/demo"
                  className="w-full h-full border-0"
                  title="Beauty Calendar — panel administracyjny demo"
                  onError={() => setIframeError(true)}
                />
              )}
            </div>
          </div>

          {/* Laptop base / hinge */}
          <div className="mx-auto w-[70%] h-4 bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-b-xl border-x border-b border-border/40" />
          <div className="mx-auto w-[90%] h-1.5 bg-[#1a1a1a] rounded-b-lg border-x border-b border-border/30" />
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-lg"
            onClick={() => (window.location.href = "/demo")}
          >
            <Settings className="mr-2 w-4 h-4" />
            Otwórz pełne demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8"
            onClick={() => (window.location.href = "/auth")}
          >
            Załóż swoje konto za darmo
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoPreviewSection;
