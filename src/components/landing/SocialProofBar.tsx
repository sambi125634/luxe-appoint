import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";

const proofItems = [
  { value: 150, suffix: "+", label: "salonów" },
  { value: 25000, suffix: "+", label: "rezerwacji/mies" },
  { value: 38000, suffix: " zł", label: "śr. oszczędność/rok" },
  { value: 4.9, suffix: "★", label: "ocena" },
];

const losses = [
  { label: "Klientka która była raz i nie wróciła", value: 4800, detail: "12 wizyt rocznie których nie było" },
  { label: "No-show bez zaliczki", value: 280, detail: "każdy. jeden. raz." },
  { label: 'Klientka na liście która "gdzieś znikła"', value: 3600, detail: "18 miesięcy × średnia wizyta 200 zł" },
];

const CountUp = ({ target, suffix = "", isInView, formatFn }: { target: number; suffix?: string; isInView: boolean; formatFn?: (n: number) => string }) => {
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

  const display = formatFn
    ? formatFn(current)
    : target >= 1000
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
    <section ref={ref} className="py-10 md:py-14 bg-muted/20 border-y border-border/50">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Social proof inline bar */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mb-10 md:mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {proofItems.map((item, i) => (
            <span key={i} className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">
                <CountUp target={item.value} suffix={item.suffix} isInView={isInView} />
              </span>
              {" "}{item.label}
              {i < proofItems.length - 1 && <span className="ml-6 text-border hidden md:inline">·</span>}
            </span>
          ))}
        </motion.div>

        {/* Loss numbers heading */}
        <motion.p
          className="text-center text-lg md:text-xl font-medium text-muted-foreground mb-8 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
        >
          Ile Twój salon stracił w tym roku?
        </motion.p>

        {/* Loss numbers grid */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-8">
          {losses.map((item, i) => (
            <motion.div
              key={i}
              className="text-center space-y-2"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <p className="text-xs text-muted-foreground font-medium leading-snug">
                {item.label}
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl font-black text-destructive tracking-tighter leading-none">
                −<CountUp
                  target={item.value}
                  suffix=" zł"
                  isInView={isInView}
                  formatFn={(n) => Math.round(n).toLocaleString("pl-PL")}
                />
              </p>
              <p className="text-xs text-muted-foreground/60 italic">
                ({item.detail})
              </p>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <motion.div
          className="text-center max-w-lg mx-auto space-y-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-xs text-muted-foreground">
            Przeciętny salon traci tak 8–12 klientek rocznie.
          </p>
          <p className="text-sm font-semibold text-foreground">
            Bez żadnego systemu — tracisz 38 000–57 600 zł. Każdego roku. W kółko.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
