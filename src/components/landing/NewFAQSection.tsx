import { useTranslation } from "react-i18next";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Users, Percent, ArrowRightLeft, ShieldCheck, Smartphone, RotateCcw, HelpCircle, Calendar, Crown } from "lucide-react";
import { motion } from "framer-motion";

export const NewFAQSection = () => {
  const { t } = useTranslation();

  const faqs = [
    { icon: HelpCircle, q: t("landing.newFaq.q1"), a: t("landing.newFaq.a1") },
    { icon: Percent, q: t("landing.newFaq.q2"), a: t("landing.newFaq.a2") },
    { icon: ShieldCheck, q: t("landing.newFaq.q3"), a: t("landing.newFaq.a3") },
    { icon: ArrowRightLeft, q: t("landing.newFaq.q4"), a: t("landing.newFaq.a4") },
    { icon: Smartphone, q: t("landing.newFaq.q5"), a: t("landing.newFaq.a5") },
    { icon: Users, q: t("landing.newFaq.q6"), a: t("landing.newFaq.a6") },
    { icon: Calendar, q: t("landing.newFaq.q7"), a: t("landing.newFaq.a7") },
    { icon: Crown, q: t("landing.newFaq.q8"), a: t("landing.newFaq.a8") },
    { icon: RotateCcw, q: t("landing.newFaq.q9"), a: t("landing.newFaq.a9") },
  ];

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
            {t("landing.newFaq.title1")}{" "}
            <span className="text-gradient-luxury">{t("landing.newFaq.title2")}</span>
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
                    <span className="font-semibold text-base md:text-lg">{faq.q}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4 md:pb-5 pl-11 md:pl-14 text-muted-foreground leading-relaxed text-sm md:text-base">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
