import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuroraBackground from "./AuroraBackground";

const transformations = [
  {
    before: "Odbierasz telefony w środku zabiegu",
    after: "Klientki rezerwują same o 23:00",
  },
  {
    before: "Ile ja w og\u00F3le zarobi\u0142am w tym miesi\u0105cu?",
    after: "True Profit na dashboardzie \u2014 co do grosza",
  },
  {
    before: "Klientka nie przyszła. Pusty slot. Strata.",
    after: "SMS przypomina 24h i 2h przed wizytą",
  },
  {
    before: "„Kiedy zamawiałam ten kolor? Ile go mam?"",
    after: "Skanujesz telefonem. System wie wszystko.",
  },
  {
    before: "Booksy bierze 30% od każdej wizyty",
    after: "0% prowizji. 149 zł miesięcznie. Kropka.",
  },
  {
    before: "„Tracę klientki ale nie wiem dlaczego"",
    after: "AI mówi kto odchodzi — zanim to zrobi",
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
            Zanim Beauty Calendar →{" "}
            <span className="text-primary">3 miesiące później</span>
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
                <span className="text-destructive font-bold text-lg">❌</span>
                <span className="text-sm">{item.before}</span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-emerald-600 font-bold text-lg">✅</span>
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
              Zobacz jak to działa
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};