import { motion } from "framer-motion";

const losses = [
  {
    label: "Klientka która była raz i nie wróciła",
    amount: "4 800",
    detail: "12 wizyt rocznie których nie było",
  },
  {
    label: "No-show bez zaliczki",
    amount: "280",
    detail: "każdy. jeden. raz.",
  },
  {
    label: 'Klientka na liście która „gdzieś znikła"',
    amount: "3 600",
    detail: "18 miesięcy × średnia wizyta 200 zł",
  },
];

export const LossNumbersSection = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container relative z-10 max-w-5xl mx-auto px-4">
        <motion.h2
          className="text-center text-2xl md:text-3xl font-medium text-muted-foreground mb-16 tracking-tight"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          Ile Twój salon stracił w tym roku?
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-16">
          {losses.map((item, i) => (
            <motion.div
              key={i}
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <p className="text-sm text-muted-foreground font-medium leading-snug">
                {item.label}
              </p>
              <p className="text-5xl md:text-6xl lg:text-7xl font-black text-destructive tracking-tighter leading-none">
                −{item.amount} zł
              </p>
              <p className="text-xs text-muted-foreground/70 italic">
                ({item.detail})
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center max-w-xl mx-auto space-y-2"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <p className="text-sm text-muted-foreground">
            Przeciętny salon traci tak 8–12 klientek rocznie.
          </p>
          <p className="text-base font-semibold text-foreground">
            Bez żadnego systemu — tracisz 38 000–57 600 zł. Każdego roku. W kółko.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
