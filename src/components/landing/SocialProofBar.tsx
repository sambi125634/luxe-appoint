import { useEffect, useState } from "react";
import { Building2, Calendar, Clock, Star } from "lucide-react";

const stats = [
  { value: 150, suffix: "+", label: "Salonów", icon: Building2 },
  { value: 25000, suffix: "+", label: "Rezerwacji miesięcznie", icon: Calendar },
  { value: 99.9, suffix: "%", label: "Uptime", icon: Clock },
  { value: 4.9, suffix: "★", label: "Ocena użytkowników", icon: Star },
];

const AnimatedCounter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [target]);
  
  return (
    <span>
      {target >= 1000 
        ? count.toLocaleString('pl-PL') 
        : target % 1 !== 0 
          ? count.toFixed(1) 
          : Math.floor(count)
      }
      {suffix}
    </span>
  );
};

export const SocialProofBar = () => {
  return (
    <section className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container">
        {/* Title */}
        <p className="text-center text-muted-foreground mb-8 text-sm font-medium uppercase tracking-wider">
          Zaufało nam już ponad 150+ salonów w całej Polsce
        </p>
        
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
};
