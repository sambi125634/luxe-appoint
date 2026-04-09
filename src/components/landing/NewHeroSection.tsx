import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

interface NewHeroSectionProps {
  onScrollToForm: () => void;
}

export const NewHeroSection = ({ onScrollToForm }: NewHeroSectionProps) => {
  const scrollToDemo = () => {
    document.getElementById("demo-preview")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute -left-[12%] -top-28 h-[32rem] w-[32rem] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(var(--primary) / 0.22) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute right-[-4%] top-[4%] h-[18rem] w-[18rem] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, hsl(var(--accent) / 0.14) 0%, transparent 72%)",
          }}
        />
        <div
          className="absolute bottom-[-12%] left-1/2 h-[22rem] w-[58rem] -translate-x-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--accent) / 0.22) 0%, hsl(var(--primary) / 0.08) 50%, transparent 76%)",
          }}
        />
      </div>

      <div className="container relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0 }}
        >
          <Badge
            variant="outline"
            className="mb-12 rounded-full border-primary/20 bg-background/80 px-6 py-3 text-primary backdrop-blur-sm"
            style={{ fontSize: "14px", fontWeight: 500, letterSpacing: "0.02em" }}
          >
            ✨ 🚀 Zarabiaj więcej, robiąc jeszcze mniej niż do tej pory
          </Badge>
        </motion.div>

        <motion.h1
          className="max-w-[980px] text-foreground"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(48px, 6vw, 78px)",
            fontWeight: 600,
            lineHeight: 0.94,
            letterSpacing: "-0.03em",
            textWrap: "balance",
          }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
        Więcej wizyt. Więcej powrotów.{" "}
          <span
            style={{
              fontStyle: "italic",
              background:
                "linear-gradient(180deg, hsl(var(--violet-light)) 0%, hsl(var(--secondary)) 96%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Zero prowizji.
          </span>
        </motion.h1>

        <motion.p
          className="mt-10 max-w-[760px] leading-relaxed text-muted-foreground"
          style={{ fontSize: "18px" }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          Jedyna platforma beauty z AI, która automatycznie wypełnia luki w grafiku,
          odzyskuje śpiące klientki i maksymalizuje wartość każdej wizyty
          — bez pobierania ani złotówki od Twoich przychodów.
        </motion.p>

        <motion.div
          className="mt-12 flex flex-col gap-4 sm:flex-row"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Button
            size="lg"
            onClick={onScrollToForm}
            className="h-14 rounded-2xl px-10 text-[17px] shadow-soft sm:min-w-[294px]"
          >
            <span className="flex items-center gap-2">
              Załóż konto za darmo
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={scrollToDemo}
            className="h-14 rounded-2xl bg-background/75 px-10 text-[17px] text-foreground backdrop-blur-sm sm:min-w-[314px]"
          >
            <Play className="w-4 h-4" />
            Zobacz demo na żywo
          </Button>
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-5 py-2.5 shadow-sm backdrop-blur-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-medium text-emerald-700">
              Zaufało nam już ponad 150+ salonów w całej Polsce
            </span>
          </div>
        </motion.div>

        <motion.div
          className="mt-6 flex flex-wrap justify-center gap-8"
          style={{ fontSize: "14px" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          {["Bez karty kredytowej", "Gotowe w 5 minut", "0% prowizji — zawsze"].map((item) => (
            <div key={item} className="flex items-center gap-2 text-muted-foreground">
              <Check className="h-4 w-4 text-emerald-500" />
              <span>{item}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 z-10 flex h-12 w-7 -translate-x-1/2 items-start justify-center rounded-full border border-primary/20 bg-background/40 p-2 backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.2 }}
      >
        <div className="h-3 w-1 rounded-full bg-primary/35" />
      </motion.div>
    </section>
  );
};
