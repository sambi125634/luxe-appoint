import { useRef, useState, useEffect } from "react";
import { Building2, Calendar, PiggyBank, Star } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { appleEaseArray } from "@/components/ui/AnimatedSection";

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
    const duration = 2000;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress === 1) {
        clearInterval(timer);
        setCurrent(target);
      }
    }, 16);
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
    <section ref={ref} className="landing-section-dark-2 landing-section-spacing" style={{ paddingTop: "clamp(40px, 6vh, 80px)", paddingBottom: "clamp(40px, 6vh, 80px)" }}>
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)]">
        {/* Separator */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: appleEaseArray }}
            >
              <div className="text-4xl md:text-5xl font-bold mb-2" style={{ color: "#f5f5f7", fontFamily: "'Playfair Display', serif" }}>
                <CountUp target={stat.value} suffix={stat.suffix} isInView={isInView} />
              </div>
              <div className="text-sm landing-text-subtle-dark">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mt-12" />
      </div>
    </section>
  );
};