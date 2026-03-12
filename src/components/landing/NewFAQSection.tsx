import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FileText, Clock, Database, Brain, Smartphone, Headphones } from "lucide-react";

const faqIcons = [FileText, Clock, Database, Brain, Smartphone, Headphones];

export const NewFAQSection = () => {
  const { t } = useTranslation();

  const faqs = Array.from({ length: 6 }, (_, i) => ({
    icon: faqIcons[i],
    question: t(`landing.newFaq.q${i + 1}`),
    answer: t(`landing.newFaq.a${i + 1}`),
  }));

  return (
    <section className="py-20 lg:py-32">
      <div className="container max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t('landing.newFaq.title')}{" "}
            <span className="text-gradient-luxury">{t('landing.newFaq.titleHighlight')}</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            {t('landing.newFaq.subtitle')}
          </p>
        </div>

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
