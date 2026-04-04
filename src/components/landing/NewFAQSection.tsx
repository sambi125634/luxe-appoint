import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Percent, ArrowRightLeft, ShieldCheck, Smartphone, RotateCcw, HelpCircle, Calendar, Crown } from "lucide-react";
import { motion } from "framer-motion";
import { AnimatedHeadline, appleEaseArray } from "@/components/ui/AnimatedSection";

const faqs = [
  { icon: HelpCircle, question: "Czym różnicie się od platform marketplace?", answer: "Platformy marketplace działają jak Allegro dla usług — bijesz się ceną z konkurencją, a klientki należą do platformy. My działamy odwrotnie: dostarczamy Ci narzędzia do budowania WŁASNEJ bazy klientek, własnego brandu i własnych relacji. Twoje dane — zawsze Twoje." },
  { icon: Percent, question: "Czy naprawdę 0% prowizji?", answer: "Tak. W żadnym pakiecie nie pobieramy prowizji od rezerwacji Twoich klientek. Płacisz tylko stały abonament. Żadnych niespodzianek, żadnych ukrytych opłat." },
  { icon: ShieldCheck, question: "Co się stanie z moimi danymi jeśli zrezygnuję?", answer: "Zabierasz je ze sobą. W dowolnym momencie eksportujesz pełną bazę klientek, historię wizyt i dane finansowe do CSV/Excel. Twoje dane są zawsze Twoje." },
  { icon: ArrowRightLeft, question: "Jak szybko mogę zacząć?", answer: "Konto zakłada się w 5 minut. Jeśli korzystałaś z innej platformy — import danych zajmuje kolejne 5 minut. Tego samego dnia masz działający system." },
  { icon: Smartphone, question: "Czy trudno obsługiwać Beauty Calendar?", answer: "Interfejs był projektowany specjalnie dla właścicielek salonów — nie dla programistów. Większość funkcji uruchomisz bez żadnej instrukcji. W pakiecie ELITE mamy prywatny onboarding call — konfigurujemy system za Ciebie." },
  { icon: Users, question: "Czy działa na telefonie?", answer: "Tak. Masz aplikację mobilną dla właściciela salonu (zarządzanie, kalendarz, powiadomienia) oraz aplikację dla klientek (rezerwacje, historia wizyt, komunikacja). Dostępne na iOS i Android." },
  { icon: Calendar, question: "Czy integruje się z Google Calendar?", answer: "Tak, w pakietach PRO i ELITE masz dwukierunkową synchronizację z Google Calendar. Wizyty pojawiają się automatycznie po obu stronach." },
  { icon: Crown, question: "Czym jest pakiet ELITE?", answer: "ELITE to Beauty Calendar z włączonym AI Autopilotem — system sam wykrywa zagrożone klientki, wysyła sekwencje, wymaga zaliczek od no-showów i prognozuje przychody. Do tego prywatny onboarding call gdzie konfigurujemy wszystko za Ciebie." },
  { icon: RotateCcw, question: "Co jeśli mi się nie spodoba?", answer: "Pakiet FREE jest darmowy na zawsze — testuj bez limitu czasowego. Pakiety płatne anulujesz jednym kliknięciem, bez wypowiedzenia. Gwarancja zwrotu 30 dni bez pytań. Twoje dane zostają Twoje." },
];

export const NewFAQSection = () => {
  return (
    <section id="faq" className="landing-section-light landing-section-spacing">
      <div className="max-w-[800px] mx-auto px-[max(24px,5vw)]">
        <AnimatedHeadline className="text-center mb-16">
          <h2 className="headline-section mb-4" style={{ color: "#1d1d1f" }}>
            Pytania które zadajesz{" "}
            <span className="apple-accent-gradient">zanim klikniesz „zacznij"</span>
          </h2>
        </AnimatedHeadline>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.5, ease: appleEaseArray }}
            >
              <AccordionItem
                value={`item-${index}`}
                className="landing-card-light px-6 data-[state=open]:shadow-lg transition-shadow border-none"
              >
                <AccordionTrigger className="hover:no-underline py-5">
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(139,92,246,0.06)" }}>
                      <faq.icon className="w-5 h-5 text-[#8b5cf6]" />
                    </div>
                    <span className="font-semibold text-base" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5 pl-14 leading-relaxed body-text landing-text-muted-light">
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
