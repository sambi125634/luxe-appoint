import { Sparkles, Heart, Scissors, Stethoscope, Footprints, Leaf } from "lucide-react";

const audiences = [
  { icon: Sparkles, label: "Salony kosmetyczne" },
  { icon: Heart, label: "Studia manicure" },
  { icon: Scissors, label: "Salony fryzjerskie" },
  { icon: Stethoscope, label: "Kliniki medycyny estetycznej" },
  { icon: Footprints, label: "Gabinety podologiczne" },
  { icon: Leaf, label: "Spa i wellness" }
];

const TargetAudienceSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stworzone dla
          </h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
          {audiences.map((audience, index) => (
            <div 
              key={index}
              className="glass-card p-6 text-center hover-lift transition-all duration-300 group cursor-default"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold/20 to-violet-deep/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <audience.icon className="w-7 h-7 text-gold" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {audience.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TargetAudienceSection;
