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
    question: "Moje klientki znaj\u0105 mnie z Booksy \u2014 nie znajd\u0105 mnie tutaj?",
    answer: "Twoje klientki nie szukaj\u0105 Ci\u0119 na Booksy. Szukaj\u0105 Ci\u0119 po nazwie w Google. Beauty Calendar daje Ci w\u0142asny link i widget na stronie, Facebooku i Instagramie. Wy\u015Blij im jedn\u0105 wiadomo\u015B\u0107 z nowym linkiem \u2014 90% przejdzie w ci\u0105gu tygodnia.",
  },
  {
    icon: Percent,
    question: "Jak to mo\u017Cliwe \u017Ce 0% prowizji? Gdzie jest haczyk?",
    answer: "Booksy jest marketplace \u2014 \u0142\u0105czy klientki z salonami i bierze procent od ka\u017Cdego po\u0142\u0105czenia. My nie jeste\u015Bmy marketplace. Jeste\u015Bmy narz\u0119dziem \u2014 jak Canva czy Notion. P\u0142acisz za software, nie za swoje klientki.",
  },
  {
    icon: ArrowRightLeft,
    question: "Czy migracja z Booksy jest trudna?",
    answer: "Eksportujesz dane jako CSV, importujesz jednym klikni\u0119ciem. Ca\u0142o\u015B\u0107 trwa 10-15 minut. W pakiecie ELITE \u2014 robimy to za Ciebie podczas onboarding callu.",
  },
  {
    icon: ShieldCheck,
    question: "Czy moje dane s\u0105 bezpieczne?",
    answer: "Serwery w UE, szyfrowanie SSL/TLS, pe\u0142na zgodno\u015B\u0107 z RODO. I co najwa\u017Cniejsze \u2014 to S\u0104 Twoje dane. Mo\u017Cesz je wyeksportowa\u0107 i usun\u0105\u0107 w ka\u017Cdej chwili. W Booksy \u2014 Twoje dane nale\u017C\u0105 do Booksy.",
  },
  {
    icon: Smartphone,
    question: "Nie jestem techniczna \u2014 czy dam rad\u0119?",
    answer: "Je\u015Bli obs\u0142ugujesz Instagram \u2014 dasz rad\u0119 z Beauty Calendar. Konfiguracja trwa 15 minut. Mamy video-poradniki po polsku. A w pakiecie ELITE \u2014 konfigurujemy wszystko za Ciebie.",
  },
  {
    icon: RotateCcw,
    question: "Co je\u015Bli mi si\u0119 nie spodoba?",
    answer: "Pakiet FREE jest darmowy na zawsze \u2014 testuj bez limitu czasowego. Pakiety p\u0142atne anulujesz jednym klikni\u0119ciem, bez wypowiedzenia, bez t\u0142umaczenia si\u0119. Twoje dane zostaj\u0105 Twoje.",
  },
  {
    icon: HelpCircle,
    question: "Dlaczego nie znam tej aplikacji?",
    answer: "Bo nie wydajemy milion\u00F3w na reklamy. Inwestujemy w produkt \u2014 163 funkcje m\u00F3wi\u0105 same za siebie. Dowiaduj\u0105 si\u0119 o nas od innych w\u0142a\u015Bcicielek salon\u00F3w. Najlepsza rekomendacja nie pochodzi od nas.",
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