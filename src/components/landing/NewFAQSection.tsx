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
    question: "Czym różnicie się od platform marketplace?",
    answer: "Platformy marketplace działają jak Allegro dla usług — bijesz się ceną z konkurencją, a klientki należą do platformy. My działamy odwrotnie: dostarczamy Ci narzędzia do budowania WŁASNEJ bazy klientek, własnego brandu i własnych relacji. Twoje dane — zawsze Twoje.",
  },
  {
    icon: Percent,
    question: "Czy naprawdę 0% prowizji?",
    answer: "Tak. W żadnym pakiecie nie pobieramy prowizji od rezerwacji Twoich klientek. Płacisz tylko stały abonament. Żadnych niespodzianek, żadnych ukrytych opłat.",
  },
  {
    icon: ShieldCheck,
    question: "Co się stanie z moimi danymi jeśli zrezygnuję?",
    answer: "Zabierasz je ze sobą. W dowolnym momencie eksportujesz pełną bazę klientek, historię wizyt i dane finansowe do CSV/Excel. Twoje dane są zawsze Twoje.",
  },
  {
    icon: ArrowRightLeft,
    question: "Jak szybko mogę zacząć?",
    answer: "Konto zakłada się w 5 minut. Jeśli korzystałaś z innej platformy — import danych zajmuje kolejne 5 minut. Tego samego dnia masz działający system.",
  },
  {
    icon: Smartphone,
    question: "Czy trudno obsługiwać Beauty Calendar?",
    answer: "Interfejs był projektowany specjalnie dla właścicielek salonów — nie dla programistów. Większość funkcji uruchomisz bez żadnej instrukcji. W pakiecie ELITE mamy prywatny onboarding call — konfigurujemy system za Ciebie.",
  },
  {
    icon: Users,
    question: "Czy działa na telefonie?",
    answer: "Tak. Masz aplikację mobilną dla właściciela salonu (zarządzanie, kalendarz, powiadomienia) oraz aplikację dla klientek (rezerwacje, historia wizyt, komunikacja). Dostępne na iOS i Android.",
  },
  {
    icon: Calendar,
    question: "Czy integruje się z Google Calendar?",
    answer: "Tak, w pakietach PRO i ELITE masz dwukierunkową synchronizację z Google Calendar. Wizyty pojawiają się automatycznie po obu stronach.",
  },
  {
    icon: Crown,
    question: "Czym jest pakiet ELITE?",
    answer: "ELITE to Beauty Calendar z włączonym AI Autopilotem — system sam wykrywa zagrożone klientki, wysyła sekwencje, wymaga zaliczek od no-showów i prognozuje przychody. Do tego prywatny onboarding call gdzie konfigurujemy wszystko za Ciebie.",
  },
  {
    icon: RotateCcw,
    question: "Co jeśli mi się nie spodoba?",
    answer: "Pakiet FREE jest darmowy na zawsze — testuj bez limitu czasowego. Pakiety płatne anulujesz jednym kliknięciem, bez wypowiedzenia. Gwarancja zwrotu 30 dni bez pytań. Twoje dane zostają Twoje.",
  },
];

export const NewFAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-20 lg:py-32">
      <div className="container max-w-4xl px-4">
        <motion.div
          className="text-center mb-10 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            Pytania które zadajesz{" "}
            <span className="text-gradient-luxury">zanim klikniesz „zacznij"</span>
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="space-y-3 md:space-y-4">
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
                className="glass-card border border-border/50 rounded-xl px-4 md:px-6 data-[state=open]:shadow-lg transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline py-4 md:py-5">
                  <div className="flex items-center gap-3 md:gap-4 text-left">
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <faq.icon className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                    </div>
                    <span className="font-semibold text-base md:text-lg">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 md:pb-5 pl-11 md:pl-14 text-muted-foreground leading-relaxed text-sm md:text-base">
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
