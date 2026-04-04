import { Button } from "@/components/ui/button";
import { Settings, Play, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const DemoPreviewSection = () => {
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
            <Play className="w-4 h-4" />
            Interaktywny podgl\u0105d
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            Przeklikaj sam \u2014 zobacz jak to dzia\u0142a
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Pe\u0142ny panel administracyjny z przyk\u0142adowymi danymi. Bez rejestracji, bez zobowi\u0105za\u0144.
          </p>
        </motion.div>

        {/* Preview mockup */}
        <motion.div
          className="max-w-4xl mx-auto mb-10 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Demo banner */}
          <div className="bg-primary/95 text-white px-4 py-2.5 flex items-center justify-between text-sm">
            <span>\ud83d\udc40 Przegl\u0105dasz wersj\u0119 demo Beauty Calendar</span>
            <Button size="sm" variant="secondary" className="text-xs h-7" onClick={() => (window.location.href = "/auth")}>
              Za\u0142\u00f3\u017c swoje konto \u2014 0 z\u0142 \u2192
            </Button>
          </div>
          {/* Browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="flex-1 mx-4">
              <div className="bg-background rounded-md px-3 py-1.5 text-xs text-muted-foreground text-center">
                calendar.beauty-funnels.com/demo
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 grid grid-cols-3 gap-4">
            <div className="space-y-2">
              {["Dashboard", "Kalendarz", "Klienci", "Us\u0142ugi", "Retencja", "Polecenia"].map((item, i) => (
                <div
                  key={item}
                  className={`px-3 py-2 rounded-lg text-sm ${
                    i === 0 ? "bg-primary text-primary-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="col-span-2 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Dzisiaj", value: "2 450 z\u0142", color: "text-emerald-600" },
                  { label: "Ten tydzie\u0144", value: "12 800 z\u0142", color: "text-primary" },
                  { label: "Ob\u0142o\u017cenie", value: "78%", color: "text-amber-600" },
                ].map((stat) => (
                  <div key={stat.label} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                ))}
              </div>
              <div className="h-24 bg-muted/20 rounded-xl border border-border/50 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">\ud83d\udcca Wykres przychod\u00f3w</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">AI Autopilot</div>
                  <div className="flex items-center gap-1 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 font-medium">Aktywny</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-muted/20 border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Klientki w ryzyku</div>
                  <div className="text-sm font-bold text-amber-600">7 wymaga uwagi</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-lg"
            onClick={() => (window.location.href = "/demo")}
          >
            <Settings className="mr-2 w-4 h-4" />
            Otw\u00f3rz pe\u0142ne demo
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8"
            onClick={() => (window.location.href = "/auth")}
          >
            Za\u0142\u00f3\u017c swoje konto za darmo
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DemoPreviewSection;
