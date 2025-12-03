import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Czy to jest darmowe?",
    answer: "Demo Beauty Calendar jest całkowicie bezpłatne. Otrzymujesz pełny dostęp do systemu na okres testowy, personalny onboarding i pomoc w konfiguracji. Dopiero gdy uznasz, że to rozwiązanie dla Ciebie, możesz wybrać płatny plan.",
  },
  {
    question: "Czy muszę rezygnować z Booksy?",
    answer: "Nie musisz. Wiele salonów używa Beauty Calendar równolegle z innymi systemami w okresie przejściowym. Możesz stopniowo przenosić klientki na nowy system rezerwacji, bez stresu i ryzyka.",
  },
  {
    question: "Czy moje klientki muszą zakładać konto?",
    answer: "Nie! Twoje klientki rezerwują wizyty bez konieczności rejestracji. Podają tylko imię, telefon i e-mail – szybko, prosto, bez barier.",
  },
  {
    question: "Czy poradzę sobie technicznie z wdrożeniem?",
    answer: "Absolutnie tak. Beauty Calendar jest zaprojektowany dla właścicieli salonów, nie dla programistów. 5-minutowy wizard przeprowadzi Cię przez konfigurację, a nasz zespół pomoże Ci osadzić kalendarz na stronie.",
  },
  {
    question: "Jak długo trwa konfiguracja?",
    answer: "Średnio 10-15 minut na pełną konfigurację usług, zespołu i godzin pracy. Jeśli masz już listę usług w Excelu lub innym systemie, możemy ją zaimportować automatycznie.",
  },
  {
    question: "Czy mogę dostosować wygląd kalendarza do mojej marki?",
    answer: "Tak! Możesz wybrać kolory, dodać logo i dostosować styl formularza rezerwacji. Wszystko, żeby kalendarz wyglądał jak naturalna część Twojej strony internetowej.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Najczęściej zadawane pytania
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="glass-card px-6 border-none"
              >
                <AccordionTrigger className="text-left font-serif text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}