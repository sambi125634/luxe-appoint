import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Clock, Database, Brain, Smartphone, Headphones } from "lucide-react";

const faqs = [
  {
    icon: FileText,
    question: "Czy muszę podpisywać umowę?",
    answer: "Nie. Beauty Calendar działa w modelu miesięcznym bez zobowiązań. Możesz anulować w dowolnym momencie jednym kliknięciem.",
  },
  {
    icon: Clock,
    question: "Jak długo trwa konfiguracja?",
    answer: "Średnio 10-15 minut. Dodajesz usługi, pracowników, godziny pracy — i gotowe. Oferujemy też bezpłatną pomoc przy migracji z innych systemów.",
  },
  {
    icon: Database,
    question: "Czy mogę przenieść dane z Booksy/Fresha?",
    answer: "Tak! Nasz zespół pomoże Ci bezpłatnie przenieść listę klientów i historię wizyt. Napisz do nas na support@beautycalendar.pl.",
  },
  {
    icon: Brain,
    question: "Jak działają funkcje AI?",
    answer: "AI analizuje Twoje dane (rezerwacje, no-showy, przychody) i automatycznie sugeruje optymalizacje. Nie musisz nic konfigurować — działa od pierwszego dnia.",
  },
  {
    icon: Smartphone,
    question: "Czy jest aplikacja mobilna?",
    answer: "Tak, Beauty Calendar działa jako PWA (Progressive Web App). Dodaj do ekranu głównego i korzystaj jak z natywnej aplikacji na iOS i Android.",
  },
  {
    icon: Headphones,
    question: "Co jeśli potrzebuję pomocy?",
    answer: "Oferujemy wsparcie przez chat, email i telefon. Odpowiadamy w ciągu maksymalnie 4 godzin w dni robocze. Po polsku, bez chatbotów.",
  },
];

export const NewFAQSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="container max-w-4xl">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Najczęściej zadawane{" "}
            <span className="text-gradient-luxury">pytania</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Masz pytanie? Prawdopodobnie mamy już odpowiedź.
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
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
          ))}
        </Accordion>
      </div>
    </section>
  );
};
