import { useState } from "react";
import { Phone, UserX, BarChart3, Wrench, Calculator, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import AuroraBackground from "./AuroraBackground";

const problems = [
  {
    icon: UserX,
    title: "Kolejny no-show bez uprzedzenia",
    description: (
      <>
        Kolejny no-show bez uprzedzenia. <strong className="text-orange-600">300 zł w błoto</strong> i 2 godziny straconego czasu. <strong className="text-orange-600">Rocznie to nawet 15,000 zł straty.</strong>
      </>
    ),
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Wrench,
    title: "System jak z lat 90-tych",
    description: (
      <>
        System jak z lat 90-tych. <strong className="text-red-600">Płacisz 35–45% prowizji</strong> za klientkę, którą sama pozyskałaś. Przy zabiegu za 200 zł to nawet 90 zł dla platformy.
      </>
    ),
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: Phone,
    title: "Telefon dzwoni w trakcie zabiegu",
    description: "Klientka na fotelu, telefon dzwoni. Przepraszasz, przerywasz zabieg, zapisujesz na kartce... i gubisz kartkę następnego dnia.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: BarChart3,
    title: '"Ile zarobiłam w tym miesiącu?"',
    description: "Przekopujesz zeszyty, Excele, aplikacje. Po godzinie wciąż nie wiesz, czy salon zarabia, czy dokładasz do interesu.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

const BooksyCalculator = ({ onScrollToForm }: { onScrollToForm?: () => void }) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000);
  const [booksyPercent, setBooksyPercent] = useState(30);

  const booksyRevenue = monthlyRevenue * (booksyPercent / 100);
  const monthlyLoss = booksyRevenue * 0.40;
  const annualLoss = Math.round(monthlyLoss * 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <Card className="border-primary/20 bg-gradient-to-br from-background to-primary/5 overflow-hidden">
        <CardContent className="p-6 lg:p-8">
          <h3 className="text-xl lg:text-2xl font-bold mb-6 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-primary" />
            🧮 Ile Ty tracisz na Booksy?
          </h3>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Miesięczny przychód (zł)
              </label>
              <Input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                placeholder="10000"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                % klientek z Booksy
              </label>
              <div className="flex items-center gap-4 mt-3">
                <Slider
                  value={[booksyPercent]}
                  onValueChange={(v) => setBooksyPercent(v[0])}
                  max={100}
                  step={5}
                  className="flex-1"
                />
                <span className="text-sm font-bold text-primary w-12 text-right">
                  {booksyPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-center p-6 bg-destructive/5 rounded-xl border border-destructive/20">
            <p className="text-muted-foreground text-sm mb-2">
              Tracisz na prowizjach Booksy rocznie:
            </p>
            <p className="text-4xl lg:text-5xl font-bold text-destructive">
              {annualLoss.toLocaleString('pl-PL')} zł
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              przy stawce Booksy Boost 40% netto
            </p>
          </div>

          <Button
            className="w-full mt-6 group"
            size="lg"
            onClick={onScrollToForm}
          >
            Zacznij oszczędzać za darmo
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ProblemSectionProps {
  onScrollToForm?: () => void;
}

export const ProblemSection = ({ onScrollToForm }: ProblemSectionProps) => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <AuroraBackground variant="warm" />

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
            Brzmi znajomo?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Każdego roku właścicielki salonów tracą średnio{" "}
            <span className="font-bold text-destructive">38,000 zł</span>{" "}
            na prowizjach i no-showach. To nie musi tak być.
          </p>
        </motion.div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Card
                className="group relative overflow-hidden border-border/50 hover:border-border transition-all duration-300 hover:-translate-y-1 hover:shadow-glow h-full"
              >
                <CardContent className="p-6 lg:p-8">
                  <div className="flex gap-4">
                    <div className={`shrink-0 w-14 h-14 rounded-xl ${problem.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <problem.icon className={`w-7 h-7 ${problem.color}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg lg:text-xl font-semibold">
                        {problem.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                  <div className={`absolute top-0 right-0 w-32 h-32 ${problem.bgColor} blur-3xl opacity-30 group-hover:opacity-50 transition-opacity`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Booksy Calculator */}
        <BooksyCalculator onScrollToForm={onScrollToForm} />
      </div>
    </section>
  );
};
