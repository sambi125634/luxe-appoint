import { motion } from "framer-motion";
import { CalendarCheck, Bell, RotateCcw, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: CalendarCheck,
    title: "Klientka rezerwuje",
    description: "Widget na Twojej stronie, Instagramie lub przez link w bio. Bez telefonu. Bez \u201Esprawdzę i oddzwonię\u201D.",
  },
  {
    icon: Bell,
    title: "System przypomina",
    description: "24h przed wizytą — SMS. 2h przed — push. Zero no-showów od tych które dostały przypomnienie. (Nasze dane: -67% no-showów po pierwszym miesiącu)",
  },
  {
    icon: RotateCcw,
    title: "Po wizycie — sekwencja powrotu",
    description: "Nie \u201Edziękuję za wizytę\u201D. System wysyła spersonalizowaną ofertę kolejnej wizyty. W optymalnym momencie. Kiedy jest gotowa wrócić.",
  },
  {
    icon: Heart,
    title: "Klientka wraca — sama",
    description: "Bez Twojego działania. Bez telefonu. Bez ręcznego pisania wiadomości. Twój salon zarabia nawet gdy śpisz.",
  },
];

interface SystemFlowSectionProps {
  onScrollToForm?: () => void;
}

export const SystemFlowSection = ({ onScrollToForm }: SystemFlowSectionProps) => {
  return (
    <section className="py-24 bg-background">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Jak to działa
          </span>
          <h2 className="mt-4 text-3xl md:text-4xl font-serif font-bold leading-tight">
            Od pierwszej rezerwacji{" "}
            <br className="hidden md:block" />
            do stałej klientki.{" "}
            <span className="text-primary">Automatycznie.</span>
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-[19px] md:left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-primary to-primary/20" />

          <div className="space-y-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={index}
                  className="relative flex gap-5 md:gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
                >
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary flex items-center justify-center shadow-glow">
                    <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
                  </div>

                  {/* Content */}
                  <div className="pt-1">
                    <h3 className="text-lg font-bold mb-1">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mt-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button size="lg" className="rounded-full" onClick={onScrollToForm}>
            Chcę taki system — zaczynam za darmo
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
