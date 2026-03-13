import { useEffect, useRef, useState } from "react";
import { Building2, Calendar, Clock, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 150, suffix: "+", label: "Salonów", icon: Building2 },
  { value: 25000, suffix: "+", label: "Rezerwacji miesięcznie", icon: Calendar },
  { value: 99.9, suffix: "%", label: "Uptime", icon: Clock },
  { value: 4.9, suffix: "★", label: "Ocena użytkowników", icon: Star },
];

const AnimatedCounter = ({ target, suffix, active }: { target: number; suffix: string; active: boolean }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    setCount(0);
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
  }, [target, active]);

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
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container">
        <motion.p
          className="text-center text-muted-foreground mb-8 text-sm font-medium uppercase tracking-wider"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Zaufało nam już ponad 150+ salonów w całej Polsce
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 mb-3 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} active={isInView} />
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
