import { useRef, useState, useEffect } from "react";
import { Building2, Calendar, PiggyBank, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 150, suffix: "+", label: "aktywnych salonów", icon: Building2 },
  { value: 25000, suffix: "+", label: "rezerwacji miesięcznie", icon: Calendar },
  { value: 38000, suffix: " zł", label: "średnia oszczędność / rok", icon: PiggyBank },
  { value: 4.9, suffix: "★", label: "średnia ocena", icon: Star },
];

const CountUp = ({ target, suffix, isInView }: { target: number; suffix: string; isInView: boolean }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.round(increment * step * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  const display = target >= 1000
    ? Math.round(current).toLocaleString("pl-PL")
    : Number.isInteger(target)
      ? Math.round(current).toString()
      : current.toFixed(1);

  return <>{display}{suffix}</>;
};

export const SocialProofBar = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-12 bg-muted/30 border-y border-border/50">
      <div className="container">
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
              <div className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                <CountUp target={stat.value} suffix={stat.suffix} isInView={isInView} />
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
