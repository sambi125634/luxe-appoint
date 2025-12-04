import { useTranslation } from "react-i18next";
import { Settings, Users, Code, CheckCircle } from "lucide-react";

const HowItWorksSection = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Settings,
      number: "01",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description")
    },
    {
      icon: Users,
      number: "02",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description")
    },
    {
      icon: Code,
      number: "03",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description")
    },
    {
      icon: CheckCircle,
      number: "04",
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description")
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("howItWorks.subtitle")}
          </p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-violet-deep via-gold to-burgundy" />
            
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step number circle */}
                <div className="relative mx-auto mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-deep to-burgundy flex items-center justify-center mx-auto shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold flex items-center justify-center text-sm font-bold text-background">
                    {step.number}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
