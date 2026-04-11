import { useTranslation } from "react-i18next";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  limitations?: string[];
  cta: string;
  ctaLink?: string;
  popular: boolean;
  icon: LucideIcon;
  savings?: string;
  setupFee?: boolean;
  setupPrice?: string;
  badge?: string;
}

interface PricingCardProps {
  plan: PricingPlan;
  index: number;
  onScrollToForm: () => void;
}

export const PricingCard = ({ plan, index, onScrollToForm }: PricingCardProps) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300 hover:-translate-y-1 h-full",
        plan.popular ? "border-primary shadow-xl md:scale-105 z-10" : "border-border/50 hover:border-border hover:shadow-lg"
      )}>
        {plan.popular && (
          <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
            <plan.icon className="w-4 h-4 inline mr-1" />{t("landing.pricing.mostPopular")}
          </div>
        )}
        {plan.badge && !plan.popular && (
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-1 text-sm font-medium">
            <plan.icon className="w-4 h-4 inline mr-1" />{plan.badge}
          </div>
        )}
        <CardHeader className={cn("text-center pb-0", (plan.popular || plan.badge) && "pt-10")}>
          <div className="flex justify-center mb-3">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", plan.popular ? "bg-primary/20" : "bg-muted")}>
              <plan.icon className={cn("w-6 h-6", plan.popular ? "text-primary" : "text-muted-foreground")} />
            </div>
          </div>
          <h3 className="text-xl font-bold">{plan.name}</h3>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
            <span className="text-muted-foreground text-sm"> {plan.period}</span>
            {plan.setupFee && (
              <span className="text-sm text-muted-foreground block mt-1">+ {plan.setupPrice} {t("landing.pricing.oneTimeOnboarding")}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
          {plan.savings && (
            <Badge className="mt-2 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{plan.savings}</Badge>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3 mb-4">
            {plan.features.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /><span>{f}</span>
              </li>
            ))}
          </ul>
          {plan.limitations && plan.limitations.length > 0 && (
            <div className="mb-6 pt-3 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2 font-medium">{t("landing.pricing.notIncluded")}</p>
              {plan.limitations.map((lim, i) => (
                <p key={i} className="text-xs text-muted-foreground/70 mb-1">— {lim}</p>
              ))}
            </div>
          )}
          {plan.ctaLink ? (
            <Button
              asChild
              className={cn("w-full", !plan.popular && "bg-muted hover:bg-muted/80 text-foreground")}
              variant={plan.popular ? "default" : "secondary"}
            >
              <Link to={plan.ctaLink}>{plan.cta}<ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          ) : (
            <Button onClick={onScrollToForm} className="w-full bg-muted hover:bg-muted/80 text-foreground" variant="secondary">
              {plan.cta}<ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
