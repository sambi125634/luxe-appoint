import { Phone, UserX, BarChart3, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut" as const,
    },
  }),
};

export const ProblemSection = () => {
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
            Znasz to?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prowadzenie salonu to codzienna walka z chaosem. Znamy ten ból — dlatego stworzyliśmy rozwiązanie.
          </p>
        </motion.div>

        {/* Problem cards */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
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
      </div>
    </section>
  );
};
