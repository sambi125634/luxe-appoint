import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Clock, Database, Brain, Smartphone, Headphones, Percent, Calendar, ShieldCheck, Download, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

const faqIcons = [FileText, Clock, Database, Brain, Smartphone, Headphones, Percent, Calendar, ShieldCheck, Download, HelpCircle];

export const NewFAQSection = () => {
  const { t } = useTranslation();

  const extraFaqs = [
    {
      icon: ShieldCheck,
      question: "Co się stanie z moimi klientkami jeśli zrezygnuję z Beauty Calendar?",
      answer: "Zabierasz je ze sobą. W dowolnym momencie eksportujesz pełną bazę klientek do CSV/Excel — z historią wizyt, danymi kontaktowymi i notatkami. Twoje dane są Twoje. Zawsze. To fundamentalna różnica między nami a Booksy.",
    },
    {
      icon: Download,
      question: "Czy trudno przenieść dane z Booksy?",
      answer: "5 minut. Serio. Mamy jedną-klikowy import z Booksy, Fresha i Versumu. Twoja baza klientek, usługi i grafik przeniosą się automatycznie. Uruchomisz Beauty Calendar jeszcze tego samego dnia.",
    },
  ];

  const i18nFaqs = Array.from({ length: 8 }, (_, i) => ({
    icon: faqIcons[i],
    question: t(`landing.newFaq.q${i + 1}`),
    answer: t(`landing.newFaq.a${i + 1}`),
  }));

  const faqs = [...i18nFaqs, ...extraFaqs];

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
            {t('landing.newFaq.title')}{" "}
            <span className="text-gradient-luxury">{t('landing.newFaq.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('landing.newFaq.subtitle')}
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
