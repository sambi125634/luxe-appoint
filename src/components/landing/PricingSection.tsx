import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Percent } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { PricingCard } from "./pricing/PricingCard";
import { PricingContactForm } from "./pricing/PricingContactForm";
import { getPlans } from "./pricing/pricing-plans";

interface PricingSectionProps {
  onScrollToForm: () => void;
}

export const PricingSection = ({ onScrollToForm }: PricingSectionProps) => {
  const { t } = useTranslation();
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = getPlans(isAnnual, t);

  return (
    <section id="pricing" className="py-16 md:py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4">
            {t("landing.pricing.title1")}
            <br />
            <span className="text-gradient-luxury">{t("landing.pricing.title2")}</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("landing.pricing.subtitle")}
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>{t("landing.pricing.monthly")}</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>{t("landing.pricing.annually")}</span>
          {isAnnual && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{t("landing.pricing.discount")}</Badge>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} onScrollToForm={onScrollToForm} />
          ))}
        </div>

        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-2 md:gap-3 bg-card border border-border rounded-2xl px-4 md:px-8 py-3 md:py-4">
            <Percent className="w-5 h-5 text-primary" />
            <p className="font-bold text-base md:text-lg">{t("landing.pricing.zeroCommission")} <span className="text-primary">{t("landing.pricing.zeroCommissionAlways")}</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            {t("landing.pricing.zeroCommissionNote")}
          </p>
        </motion.div>

        <PricingContactForm />
      </div>
    </section>
  );
};
