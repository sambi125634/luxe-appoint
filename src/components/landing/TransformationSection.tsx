import { Bot, Shield, TrendingUp, Zap, Check, ArrowRight, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AuroraBackground from "./AuroraBackground";

const solutions = [
  {
    icon: Bot,
    title: "AI wypełnia luki w grafiku",
    description: "System analizuje Twój kalendarz i sugeruje klientkom terminy, które maksymalizują Twoje zarobki. Zero pustych okienek.",
    stat: "+23%",
    statLabel: "więcej rezerwacji",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Shield,
    title: "Koniec z no-showami",
    description: "AI rozpoznaje ryzykownych klientów i automatycznie wymaga przedpłaty. Tracisz mniej, zarabiasz więcej.",
    stat: "-67%",
    statLabel: "mniej no-showów",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Prognozy przychodów w czasie rzeczywistym",
    description: "Wiesz dokładnie ile zarobisz w tym tygodniu, miesiącu, kwartale. Podejmuj decyzje oparte na danych, nie przeczuciach.",
    stat: "94%",
    statLabel: "dokładność prognoz",
    color: "from-amber-500 to-orange-600",
  },
  {
    icon: Zap,
    title: "Gotowe w 5 minut, nie 5 godzin",
    description: "Bez umów, bez prowizji, bez skomplikowanych ustawień. Dodaj usługi, personel, i zacznij przyjmować rezerwacje.",
    stat: "5 min",
    statLabel: "do startu",
    color: "from-pink-500 to-rose-600",
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
            A gdyby Twój salon
            <span className="bg-gradient-to-r from-primary to-pink-400 bg-clip-text text-transparent">
              {" "}zarabiał o 15 600 zł więcej
            </span>
            {" "}każdego roku?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Beauty Calendar to nie narzędzie do klikania. To autopilot, który sam wypełnia kalendarz, reaktywuje klientki i wysyła reklamy — bez Twojego udziału.
          </p>
        </motion.div>

        {/* Solutions grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-12">
          {solutions.map((solution, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:shadow-glow transition-all duration-500 hover:-translate-y-1 h-full">
                <CardContent className="p-6 lg:p-8">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${solution.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                        <solution.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold bg-gradient-to-r ${solution.color} bg-clip-text text-transparent`}>
                          {solution.stat}
                        </div>
                        <div className="text-xs text-muted-foreground">{solution.statLabel}</div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{solution.title}</h3>
                    <p className="text-muted-foreground leading-relaxed flex-grow">{solution.description}</p>
                    <div className="flex items-center gap-2 mt-4 text-sm text-emerald-600">
                      <Check className="w-4 h-4" />
                      <span>Działa automatycznie</span>
                    </div>
                  </div>
                  <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Data ownership block */}
        <motion.div
          className="mt-12 bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-xl mb-3">Twoje klientki. Twoje dane. Na zawsze.</h3>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Booksy i Fresha nie dają Ci klientek — <strong>wypożyczają Ci dostęp do swoich.</strong> Gdy odejdziesz, tracisz wszystko. Beauty Calendar działa odwrotnie: każda rezerwacja trafia do Twojej bazy. Eksportujesz ją kiedy chcesz. To Twój asset — na zawsze.
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: "🏦", label: "Booksy", sub: "Baza należy do nich" },
                  { icon: "❌", label: "Odejście = reset", sub: "Tracisz wszystko" },
                  { icon: "✅", label: "Beauty Calendar", sub: "Twoje dane. Zawsze." },
                ].map((item, i) => (
                  <div key={i} className={`rounded-xl p-3 text-center ${i === 2 ? 'bg-primary/10 border border-primary/20' : 'bg-muted/50'}`}>
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="font-bold text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

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
