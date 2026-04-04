import { useState, useEffect, useRef } from "react";
import { Calculator, ArrowRight, ArrowLeft, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const painCards = [
  {
    icon: "📵",
    headline: "Telefon dzwoni podczas zabiegu",
    desc: "Przerywasz klientce. Gubisz skupienie. Inna klientka nie dodzwoniła się i zapisała gdzieś indziej. To nie jest standard. To jest codzienność.",
  },
  {
    icon: "🪑",
    headline: "Pusty fotel. Znowu.",
    desc: "Klientka nie przyszła bez słowa. Termin przepadł. 200–400 zł wyparowało. Przy 3–4 no-showach tygodniowo to nawet 60 000 zł straty rocznie.",
  },
  {
    icon: "📊",
    headline: "Nie wiesz ile naprawdę zarabiasz",
    desc: "Masz przychód — ale ile zostaje po kosztach materiałów, pracowników, produktów? Większość właścicielek zgaduje. My to liczymy automatycznie.",
  },
  {
    icon: "💾",
    headline: "Twoje klientki nie są Twoje",
    desc: "Korzystasz z platformy marketplace? Jej baza klientek należy do platformy. Nie do Ciebie. Gdy odejdziesz — tracisz wszystko co budowałaś latami.",
  },
  {
    icon: "🔄",
    headline: "Klientki przychodzą raz i znikają",
    desc: "Pierwsza wizyta. Świetna. Potem cisza. Żadna platforma nie pomaga Ci ich zatrzymać. Nie wysyła sekwencji. Nie buduje powracalności. Ty musisz to robić ręcznie — albo nie robisz wcale.",
  },
];

interface QuizStep {
  question: string;
  options: { label: string; value: number }[];
}

const quizSteps: QuizStep[] = [
  {
    question: "Ile klientek odwiedziło Twój salon w ostatnim roku?",
    options: [
      { label: "do 50", value: 40 },
      { label: "50–150", value: 100 },
      { label: "150–300", value: 225 },
      { label: "300+", value: 350 },
    ],
  },
  {
    question: "Ile z nich wróciło więcej niż raz?",
    options: [
      { label: "mniej niż 30%", value: 0.2 },
      { label: "30–50%", value: 0.4 },
      { label: "50–70%", value: 0.6 },
      { label: "ponad 70%", value: 0.8 },
    ],
  },
  {
    question: "Jak często klientka nie stawiła się bez odwołania?",
    options: [
      { label: "rzadko", value: 1 },
      { label: "1–2× mies", value: 1.5 },
      { label: "3–5× mies", value: 4 },
      { label: "więcej", value: 7 },
    ],
  },
];

const AVG_VISIT = 200;
const NOSHOW_COST = 280;
const CAR_PAYMENT = 1500;
const HOLIDAY = 4000;

function CountUp({ target, duration = 1.5 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * target);
      setValue(start);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [target, duration]);

  return <span ref={ref}>{value.toLocaleString("pl-PL")}</span>;
}

interface ProblemSectionProps {
  onScrollToForm?: () => void;
}

export const ProblemSection = ({ onScrollToForm }: ProblemSectionProps) => {
  const [step, setStep] = useState(0); // 0-2 = questions, 3 = result
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (value: number, optIndex: number) => {
    setSelectedIndex(optIndex);
    const newAnswers = [...answers];
    newAnswers[step] = value;
    setAnswers(newAnswers);

    setTimeout(() => {
      setSelectedIndex(null);
      setStep((s) => s + 1);
    }, 350);
  };

  const handleBack = () => {
    setSelectedIndex(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const handleReset = () => {
    setStep(0);
    setAnswers([null, null, null]);
    setSelectedIndex(null);
  };

  // Calculate result
  const totalClients = answers[0] ?? 100;
  const retentionRate = answers[1] ?? 0.4;
  const noShowFreq = answers[2] ?? 1.5;

  const lostClientRevenue = Math.round(totalClients * (1 - retentionRate) * AVG_VISIT * 12);
  const noShowLoss = Math.round(noShowFreq * NOSHOW_COST * 12);
  const totalLoss = lostClientRevenue + noShowLoss;

  const carPayments = Math.floor(totalLoss / CAR_PAYMENT);
  const holidays = Math.floor(totalLoss / HOLIDAY);
  const calmMonths = Math.floor(totalLoss / 5000);

  const isResult = step === 3;

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div className="container relative z-10">
        {/* Header */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2 mb-6">
            <p className="text-amber-500 font-bold text-sm tracking-wider uppercase">
              Uwaga: Właścicielki salonów beauty w Polsce
            </p>
          </div>

          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 leading-tight">
            Czy pracujesz pełną parą...
            <br />
            <span className="text-muted-foreground font-normal text-2xl">
              i nadal nie wiesz ile naprawdę zarabiasz?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Większość właścicielek salonów traci od <strong>15 000</strong> do <strong>60 000 zł rocznie</strong> — nie dlatego że źle pracują. Tylko dlatego że nie mają odpowiednich narzędzi.
          </p>
        </motion.div>

        {/* Pain cards */}
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 mb-16">
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              className="p-5 rounded-xl bg-card border border-border/50 hover:border-destructive/20 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div>
                  <h3 className="font-bold mb-1">{card.headline}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quiz Calculator */}
        <motion.div
          className="mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative bg-white dark:bg-card rounded-3xl shadow-[0_8px_60px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_60px_-12px_rgba(0,0,0,0.3)] border border-border/30 p-8 md:p-10 overflow-hidden">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-gradient-to-tr from-destructive/8 to-transparent rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">Kalkulator strat</h3>
                  <p className="text-sm text-muted-foreground">3 pytania — Twój wynik w 30 sekund</p>
                </div>
              </div>

              {/* Progress dots */}
              {!isResult && (
                <div className="flex items-center gap-2 mb-8">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === step
                          ? "w-10 bg-primary"
                          : i < step
                          ? "w-6 bg-primary/40"
                          : "w-6 bg-border"
                      }`}
                    />
                  ))}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {step + 1} / 3
                  </span>
                </div>
              )}

              {/* Quiz content */}
              <div className="min-h-[280px] flex flex-col">
                <AnimatePresence mode="wait">
                  {!isResult ? (
                    <motion.div
                      key={`step-${step}`}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="flex-1 flex flex-col"
                    >
                      <h4 className="text-xl font-semibold mb-6 leading-snug">
                        {quizSteps[step].question}
                      </h4>

                      <div className="grid grid-cols-2 gap-3 mb-6">
                        {quizSteps[step].options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => handleSelect(opt.value, i)}
                            className={`p-4 rounded-xl border-2 text-center font-medium transition-all duration-200 cursor-pointer ${
                              selectedIndex === i
                                ? "border-primary bg-primary text-primary-foreground scale-[0.97]"
                                : "border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>

                      {step > 0 && (
                        <button
                          onClick={handleBack}
                          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-auto self-start"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          Wróć
                        </button>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                      className="flex-1 flex flex-col"
                    >
                      <p className="text-sm text-muted-foreground mb-2 font-medium">
                        Szacujemy że tracisz rocznie:
                      </p>

                      <div className="text-5xl md:text-6xl font-black text-destructive tracking-tight mb-6">
                        −<CountUp target={totalLoss} /> zł
                      </div>

                      {/* Contextual comparisons */}
                      <div className="bg-muted/30 rounded-2xl p-5 space-y-3 mb-6 border border-border/20">
                        <p className="text-sm font-medium text-muted-foreground mb-3">To jest tyle co:</p>
                        <div className="grid gap-2.5">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">🚗</span>
                            <span><strong>{carPayments}</strong> rat kredytowych za samochód</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">✈️</span>
                            <span><strong>{holidays}</strong> wakacyjnych wyjazdów</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-lg">🧘</span>
                            <span><strong>{calmMonths}</strong> miesięcy spokoju finansowego</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full h-14 gap-2 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                        onClick={onScrollToForm}
                      >
                        Odzyskaj te pieniądze — zacznij za darmo
                        <ArrowRight className="w-4 h-4" />
                      </Button>

                      <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Przelicz ponownie
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
