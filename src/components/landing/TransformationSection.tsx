import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuroraBackground from "./AuroraBackground";

const transformations = [
  {
    before: "Odbierasz telefony w \u015Brodku zabiegu",
    after: "Klientki rezerwuj\u0105 same o 23:00 przez Tw\u00F3j widget",
  },
  {
    before: "Nie wiesz ile naprawd\u0119 zarabiasz po odj\u0119ciu materia\u0142\u00F3w",
    after: "True Profit na dashboardzie \u2014 co do grosza",
  },
  {
    before: "Klientka nie przysz\u0142a. Pusty slot. Strata.",
    after: "SMS przypomina 24h i 2h przed wizyt\u0105",
  },
  {
    before: "Klientka przysz\u0142a raz i znikn\u0119\u0142a",
    after: "\u015Acie\u017Cka Klientki prowadzi j\u0105 przez 5 wizyt automatycznie",
  },
  {
    before: "Marketplace bierze prowizj\u0119 od Twoich nowych klientek",
    after: "0% prowizji. 99 z\u0142 netto/mies. Kropka.",
  },
  {
    before: "Tracisz klientki ale nie wiesz dlaczego",
    after: "AI m\u00F3wi kto odchodzi \u2014 zanim to zrobi",
  },
];

export const TransformationSection = () => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-background" />
      <AuroraBackground variant="violet" />

      <div className="container relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Zanim Beauty Calendar {"\u2192"}{" "}
            <span className="text-primary">3 miesi\u0105ce p\u00F3\u017Aniej</span>
          </h2>
        </motion.div>

        {/* Before/After grid */}
        <div className="max-w-3xl mx-auto space-y-4 mb-12">
          {transformations.map((item, index) => (
            <motion.div
              key={index}
              className="grid md:grid-cols-2 gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/5 border border-destructive/10">
                <span className="text-destructive font-bold text-lg">{"\u274C"}</span>
                <span className="text-sm">{item.before}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-emerald-600 font-bold text-lg">{"\u2705"}</span>
                <span className="text-sm font-medium">{item.after}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Button size="lg" asChild className="group px-8 py-6 text-lg">
            <Link to="/demo">
              Zobacz jak to dzia\u0142a
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};