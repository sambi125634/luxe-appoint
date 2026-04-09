import { useState } from "react";
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
  const [isAnnual, setIsAnnual] = useState(false);
  const plans = getPlans(isAnnual);

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/20">
      <div className="container">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Prosta cena. Zero prowizji.
            <br />
            <span className="text-gradient-luxury">Pełna kontrola nad Twoim biznesem.</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Wybierz plan dopasowany do Twojego salonu. Żadnych ukrytych opłat.
          </p>
        </motion.div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className={cn("text-sm font-medium", !isAnnual ? "text-foreground" : "text-muted-foreground")}>Miesięcznie</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm font-medium", isAnnual ? "text-foreground" : "text-muted-foreground")}>Rocznie (oszczędzasz 20%)</span>
          {isAnnual && <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">-20%</Badge>}
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <PricingCard key={index} plan={plan} index={index} onScrollToForm={onScrollToForm} />
          ))}
        </div>

        {/* Zero commission */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="inline-flex items-center gap-3 bg-card border border-border rounded-2xl px-8 py-4">
            <Percent className="w-5 h-5 text-primary" />
            <p className="font-bold text-lg">0% prowizji od rezerwacji — <span className="text-primary">zawsze.</span></p>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            W żadnym pakiecie nie pobieramy prowizji od wizyt Twoich klientek. Nigdy.
          </p>
        </motion.div>

        {/* Contact Form */}
        <PricingContactForm />
      </div>
    </section>
  );
};
