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
    question: "Ale moje klientki znają mnie z Booksy — nie znajdą mnie tutaj",
    answer: "Twoje klientki znają CIEBIE, nie Booksy. Wysyłasz im swój link do rezerwacji przez WhatsApp, SMS lub Instagram — i rezerwują u Ciebie bezpośrednio. 93% klientek przechodzi bez problemu, bo rezerwacja jest prostsza niż przez Booksy.",
  },
  {
    icon: Percent,
    question: "Jak to możliwe że 0% prowizji? Gdzie jest haczyk?",
    answer: "Nie ma haczyka. Zarabiamy na stałym abonamencie (0/99/249 zł miesięcznie), nie na prowizjach. To jest nasz fundamentalny wybór biznesowy — wierzymy że Twoje pieniądze powinny zostać u Ciebie.",
  },
  {
    icon: ArrowRightLeft,
    question: "Czy migracja z Booksy jest trudna?",
    answer: "5 minut. Serio. Mamy jedno-klikowy import z Booksy, Fresha i Versumu. Baza klientek, usługi i grafik przeniosą się automatycznie. Uruchomisz Beauty Calendar jeszcze tego samego dnia.",
  },
  {
    icon: ShieldCheck,
    question: "Czy to jest bezpieczne? Gdzie są moje dane?",
    answer: "Twoje dane przechowywane są na serwerach w UE, szyfrowane SSL 256-bit, w pełni zgodne z RODO. Masz pełną kontrolę — eksportujesz lub usuwasz dane w dowolnym momencie. To TWOJA baza, nie nasza.",
  },
  {
    icon: Smartphone,
    question: "Nie jestem techniczna — czy dam radę?",
    answer: "Jeśli umiesz obsługiwać Instagram — dasz radę z Beauty Calendar. Interfejs jest prostszy niż Booksy. Średni czas konfiguracji to 5 minut. A jeśli utkniesz — nasz support odpowiada w ciągu 2 godzin.",
  },
  {
    icon: RotateCcw,
    question: "Co jeśli mi się nie spodoba — mogę zrezygnować?",
    answer: "W każdej chwili. Bez okresu wypowiedzenia, bez ukrytych opłat. Zabierasz swoją bazę klientek (eksport CSV) i odchodzisz. Ale szczerze? 94% właścicielek zostaje po pierwszym miesiącu.",
  },
  {
    icon: HelpCircle,
    question: "Dlaczego nie znam tej aplikacji?",
    answer: "Bo nie wydajemy milionów na reklamy jak Booksy. Rosnemy organicznie — przez polecenia zadowolonych właścicielek salonów. To dlatego 150+ salonów już nam zaufało bez wielkich kampanii marketingowych.",
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
            Masz pytania?{" "}
            <span className="text-gradient-luxury">Mamy odpowiedzi.</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            7 najczęstszych obiekcji — i konkretne odpowiedzi.
          </p>
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
