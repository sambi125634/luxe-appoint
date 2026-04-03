import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Percent, ArrowRightLeft, ShieldCheck, Smartphone, RotateCcw, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const faqs = [
  {
    icon: Users,
    question: "„Moje klientki znają mnie z Booksy — nie znajdą mnie tutaj?"",
    answer: "Twoje klientki nie szukają Cię „na Booksy". Szukają Cię po nazwie w Google. Beauty Calendar daje Ci własny link i widget na stronie, Facebooku i Instagramie. Wyślij im jedną wiadomość z nowym linkiem — 90% przejdzie w ciągu tygodnia.",
  },
  {
    icon: Percent,
    question: "„Jak to możliwe że 0% prowizji? Gdzie jest haczyk?"",
    answer: "Booksy jest marketplace — łączy klientki z salonami i bierze procent od każdego połączenia. My nie jesteśmy marketplace. Jesteśmy narzędziem — jak Canva czy Notion. Płacisz za software, nie za swoje klientki.",
  },
  {
    icon: ArrowRightLeft,
    question: "„Czy migracja z Booksy jest trudna?"",
    answer: "Eksportujesz dane jako CSV, importujesz jednym kliknięciem. Całość trwa 10-15 minut. W pakiecie ELITE — robimy to za Ciebie podczas onboarding callu.",
  },
  {
    icon: ShieldCheck,
    question: "„Czy moje dane są bezpieczne?"",
    answer: "Serwery w UE, szyfrowanie SSL/TLS, pełna zgodność z RODO. I co najważniejsze — to SĄ Twoje dane. Możesz je wyeksportować i usunąć w każdej chwili. W Booksy — Twoje dane należą do Booksy.",
  },
  {
    icon: Smartphone,
    question: "„Nie jestem techniczna — czy dam radę?"",
    answer: "Jeśli obsługujesz Instagram — dasz radę z Beauty Calendar. Konfiguracja trwa 15 minut. Mamy video-poradniki po polsku. A w pakiecie ELITE — konfigurujemy wszystko za Ciebie.",
  },
  {
    icon: RotateCcw,
    question: "„Co jeśli mi się nie spodoba?"",
    answer: "Pakiet FREE jest darmowy na zawsze — testuj bez limitu czasowego. Pakiety płatne anulujesz jednym kliknięciem, bez wypowiedzenia, bez tłumaczenia się. Twoje dane zostają Twoje.",
  },
  {
    icon: HelpCircle,
    question: "„Dlaczego nie znam tej aplikacji?"",
    answer: "Bo nie wydajemy milionów na reklamy. Inwestujemy w produkt — 163 funkcje mówią same za siebie. Dowiadują się o nas od innych właścicielek salonów. Najlepsza rekomendacja nie pochodzi od nas.",
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
            7 pytań, które zadajesz{" "}
            <span className="text-gradient-luxury">zanim klikniesz „zacznij"</span>
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