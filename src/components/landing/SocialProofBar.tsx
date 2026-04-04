import { useRef } from "react";
import { Percent, Layers, Clock, Database } from "lucide-react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: "0%", label: "prowizji — na zawsze", icon: Percent },
  { value: "163", label: "funkcje w jednym systemie", icon: Layers },
  { value: "15 min", label: "i Twój salon jest online", icon: Clock },
  { value: "100%", label: "własność danych — zawsze Twoja", icon: Database },
];

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
                {stat.value}
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