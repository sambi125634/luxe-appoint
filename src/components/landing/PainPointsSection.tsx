import { useTranslation } from "react-i18next";
import { Phone, Calendar, Ghost, Frown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PainPointsSection = () => {
  const { t } = useTranslation();

  const painPoints = [
    {
      icon: Phone,
      title: t("painPoints.chaos.title"),
      description: t("painPoints.chaos.description")
    },
    {
      icon: Calendar,
      title: t("painPoints.noShows.title"),
      description: t("painPoints.noShows.description")
    },
    {
      icon: Ghost,
      title: t("painPoints.manual.title"),
      description: t("painPoints.manual.description")
    },
    {
      icon: Frown,
      title: t("painPoints.noInsights.title"),
      description: t("painPoints.noInsights.description")
    }
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t("painPoints.title")}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t("painPoints.subtitle")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <Card 
              key={index} 
              className="glass-card border-destructive/20 hover:border-destructive/40 transition-all duration-300 hover-lift"
            >
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                      <point.icon className="w-6 h-6 text-destructive" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {point.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainPointsSection;
