import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Percent, ArrowRightLeft, ShieldCheck, Smartphone, RotateCcw, HelpCircle, Calendar, Crown } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    icon: HelpCircle,
    question: "Czym r\u00f3\u017cnicie si\u0119 od platform marketplace?",
    answer: "Platformy marketplace dzia\u0142aj\u0105 jak Allegro dla us\u0142ug \u2014 bijesz si\u0119 cen\u0105 z konkurencj\u0105, a klientki nale\u017c\u0105 do platformy. My dzia\u0142amy odwrotnie: dostarczamy Ci narz\u0119dzia do budowania W\u0141ASNEJ bazy klientek, w\u0142asnego brandu i w\u0142asnych relacji. Twoje dane \u2014 zawsze Twoje.",
  },
  {
    icon: Percent,
    question: "Czy naprawd\u0119 0% prowizji?",
    answer: "Tak. W \u017cadnym pakiecie nie pobieramy prowizji od rezerwacji Twoich klientek. P\u0142acisz tylko sta\u0142y abonament. \u017badnych niespodzianek, \u017cadnych ukrytych op\u0142at.",
  },
  {
    icon: ShieldCheck,
    question: "Co si\u0119 stanie z moimi danymi je\u015bli zrezygnuj\u0119?",
    answer: "Zabierasz je ze sob\u0105. W dowolnym momencie eksportujesz pe\u0142n\u0105 baz\u0119 klientek, histori\u0119 wizyt i dane finansowe do CSV/Excel. Twoje dane s\u0105 zawsze Twoje.",
  },
  {
    icon: ArrowRightLeft,
    question: "Jak szybko mog\u0119 zacz\u0105\u0107?",
    answer: "Konto zak\u0142ada si\u0119 w 5 minut. Je\u015bli korzysta\u0142a\u015b z innej platformy \u2014 import danych zajmuje kolejne 5 minut. Tego samego dnia masz dzia\u0142aj\u0105cy system.",
  },
  {
    icon: Smartphone,
    question: "Czy trudno obs\u0142ugiwa\u0107 Beauty Calendar?",
    answer: "Interfejs by\u0142 projektowany specjalnie dla w\u0142a\u015bcicielek salon\u00f3w \u2014 nie dla programist\u00f3w. Wi\u0119kszo\u015b\u0107 funkcji uruchomisz bez \u017cadnej instrukcji. W pakiecie ELITE mamy prywatny onboarding call \u2014 konfigurujemy system za Ciebie.",
  },
  {
    icon: Users,
    question: "Czy dzia\u0142a na telefonie?",
    answer: "Tak. Masz aplikacj\u0119 mobiln\u0105 dla w\u0142a\u015bciciela salonu (zarz\u0105dzanie, kalendarz, powiadomienia) oraz aplikacj\u0119 dla klientek (rezerwacje, historia wizyt, komunikacja). Dost\u0119pne na iOS i Android.",
  },
  {
    icon: Calendar,
    question: "Czy integruje si\u0119 z Google Calendar?",
    answer: "Tak, w pakietach PRO i ELITE masz dwukierunkow\u0105 synchronizacj\u0119 z Google Calendar. Wizyty pojawiaj\u0105 si\u0119 automatycznie po obu stronach.",
  },
  {
    icon: Crown,
    question: "Czym jest pakiet ELITE?",
    answer: "ELITE to Beauty Calendar z w\u0142\u0105czonym AI Autopilotem \u2014 system sam wykrywa zagro\u017cone klientki, wysy\u0142a sekwencje, wymaga zaliczek od no-show\u00f3w i prognozuje przychody. Do tego prywatny onboarding call gdzie konfigurujemy wszystko za Ciebie.",
  },
  {
    icon: RotateCcw,
    question: "Co je\u015bli mi si\u0119 nie spodoba?",
    answer: "Pakiet FREE jest darmowy na zawsze \u2014 testuj bez limitu czasowego. Pakiety p\u0142atne anulujesz jednym klikni\u0119ciem, bez wypowiedzenia. Gwarancja zwrotu 30 dni bez pyta\u0144. Twoje dane zostaj\u0105 Twoje.",
  },
];

export const NewFAQSection = () => {
  return (
    <section id="faq" className="py-20 lg:py-32">
      <div className="container max-w-4xl">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Pytania kt\u00f3re zadajesz{" "}
            <span className="text-gradient-luxury">zanim klikniesz \u201ezacznij\u201d</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 0.4 }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="glass-card border border-border/50 rounded-xl px-6 data-[state=open]:shadow-lg transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <faq.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-lg">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-14 text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
