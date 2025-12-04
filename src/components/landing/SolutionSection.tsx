import { useTranslation } from "react-i18next";
import { Clock, Wand2, TrendingUp, Palette, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const SolutionSection = () => {
  const { t } = useTranslation();

  const solutions = [
    {
      icon: Clock,
      title: t("solution.booking.title"),
      description: t("solution.booking.description")
    },
    {
      icon: Wand2,
      title: t("solution.reminders.title"),
      description: t("solution.reminders.description")
    },
    {
      icon: TrendingUp,
      title: t("solution.calendar.title"),
      description: t("solution.calendar.description")
    },
    {
      icon: Palette,
      title: t("solution.reports.title"),
      description: t("solution.reports.description")
    },
    {
      icon: BarChart3,
      title: t("solution.reports.title"),
      description: t("solution.reports.description")
    }
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-gold/5 to-transparent" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("solution.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("solution.subtitle")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {solutions.map((solution, index) => (
            <Card 
              key={index} 
              className="glass-card border-gold/20 hover:border-gold/40 transition-all duration-300 hover-lift group"
            >
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-deep/20 to-gold/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <solution.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {solution.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {solution.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
