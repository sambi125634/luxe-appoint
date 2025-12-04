import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Czy Beauty Calendar jest darmowe?",
    answer: "Tak! Podstawowa wersja jest całkowicie bezpłatna. Wystarczy zostawić kontakt, a my skontaktujemy się z Tobą osobiście i pomożemy skonfigurować kalendarz."
  },
  {
    question: "Czy muszę mieć stronę internetową?",
    answer: "Nie. Możesz udostępniać link do rezerwacji bezpośrednio na Instagramie, Facebooku lub w wiadomościach do klientek. Widget działa samodzielnie i nie wymaga strony www."
  },
  {
    question: "Jak długo trwa konfiguracja?",
    answer: "Większość salonów jest gotowa w 10-15 minut. Przeprowadzimy Cię przez cały proces podczas rozmowy – od dodania usług po osadzenie widgetu na stronie."
  },
  {
    question: "Czy moje dane są bezpieczne?",
    answer: "Absolutnie. Używamy szyfrowania klasy bankowej i nie udostępniamy danych osobom trzecim. Twoje dane i dane Twoich klientek są w pełni chronione."
  },
  {
    question: "Co jeśli mam pytania podczas konfiguracji?",
    answer: "Jesteśmy dostępni na czacie i telefonie. Pomagamy na każdym etapie – od pierwszej konfiguracji po codzienne używanie systemu."
  },
  {
    question: "Czy mogę zrezygnować w dowolnym momencie?",
    answer: "Oczywiście. Bez żadnych umów, zobowiązań i ukrytych opłat. Możesz zrezygnować w dowolnej chwili bez podawania przyczyny."
  }
];

const FAQSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Najczęściej zadawane pytania
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card rounded-xl px-6 border-gold/20"
              >
                <AccordionTrigger className="text-left hover:no-underline py-5">
                  <span className="text-foreground font-medium pr-4">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
