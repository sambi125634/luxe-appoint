import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type ContactHabit = "good" | "sometimes" | "rarely" | "never";

interface Answers {
  retention: number | null;
  contactHabit: ContactHabit | null;
  avgVisit: number | null;
  noShows: number | null;
}

const slideVariants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

// ─── Animated Counter ────────────────────────
const AnimatedLossCounter = ({ target }: { target: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1800;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCount(Math.round(eased * target));

      if (progress === 1) {
        clearInterval(timer);
        setCount(target);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <div className="relative inline-block">
      <span className="text-4xl md:text-5xl lg:text-7xl font-black text-destructive tracking-tight">
        -{count.toLocaleString("pl-PL")} zł
      </span>
      <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

// ─── Grid Option Card (Slides 1 & 3) ────────
const GridOptionCard = ({
  selected,
  onClick,
  label,
  sub,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "text-left p-5 rounded-2xl border-2 transition-all duration-200",
      selected
        ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
        : "border-gray-100 bg-gray-50/50 hover:border-primary/40 hover:bg-primary/5"
    )}
  >
    <div className="flex items-start justify-between gap-2">
      <span className="font-semibold text-foreground text-sm">{label}</span>
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
          selected ? "border-primary bg-primary" : "border-gray-300"
        )}
      >
        {selected && <Check className="w-3 h-3 text-white" />}
      </div>
    </div>
    <span className="text-xs text-muted-foreground mt-1 block">{sub}</span>
  </button>
);

// ─── List Option Card (Slides 2 & 4) ────────
const ListOptionCard = ({
  selected,
  onClick,
  label,
  sub,
  emoji,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  sub?: string;
  emoji?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4",
      selected
        ? "border-primary bg-primary/5"
        : "border-gray-100 bg-gray-50/50 hover:border-primary/30 hover:bg-primary/5"
    )}
  >
    {emoji && <span className="text-2xl flex-shrink-0">{emoji}</span>}
    <div
      className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
        selected ? "border-primary bg-primary" : "border-gray-300"
      )}
    >
      {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
    </div>
    <div className="flex-1 min-w-0">
      <span className="font-semibold text-foreground text-sm block">{label}</span>
      {sub && <span className="text-xs text-muted-foreground block mt-0.5">{sub}</span>}
    </div>
  </button>
);

// ─── Question Header ─────────────────────────
const QuestionHeader = ({ question, subtext }: { question: string; subtext?: string }) => (
  <div className="mb-6">
    <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">{question}</h3>
    {subtext && <p className="text-sm text-muted-foreground mt-2">{subtext}</p>}
  </div>
);

// ─── Slide 1: Retencja ──────────────────────
const Slide1 = ({
  selectedOption,
  handleSelect,
}: {
  selectedOption: number | null;
  handleSelect: (v: number, f: keyof Answers) => void;
}) => {
  const options = [
    { label: "mniej niż 2 na 10", sub: "większość była tylko raz", value: 0.15 },
    { label: "3–4 na 10", sub: "część wraca, część znika", value: 0.35 },
    { label: "5–6 na 10", sub: "połowa jest w miarę stała", value: 0.55 },
    { label: "ponad 7 na 10", sub: "mam dużo stałych klientek", value: 0.75 },
  ];

  return (
    <div>
      <QuestionHeader
        question="Ile klientek wraca do Ciebie regularnie?"
        subtext="Pomyśl o klientkach z ostatniego roku."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <GridOptionCard
            key={opt.value}
            selected={selectedOption === opt.value}
            onClick={() => handleSelect(opt.value, "retention")}
            label={opt.label}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Slide 2: Kontakt ───────────────────────
const Slide2 = ({
  selectedOption,
  handleSelect,
}: {
  selectedOption: ContactHabit | null;
  handleSelect: (v: ContactHabit, f: keyof Answers) => void;
}) => {
  const options = [
    { emoji: "✅", label: "Robię to regularnie", sub: "mam system lub zwyczaj", value: "good" as const },
    { emoji: "🤷", label: "Czasem — ale ręcznie i rzadko", sub: "jak mi się przypomni", value: "sometimes" as const },
    { emoji: "😬", label: "Szczerze? Prawie nigdy", sub: "brakuje czasu i energii", value: "rarely" as const },
    { emoji: "❌", label: "Nigdy — nie mam jak", sub: "nawet nie wiem od czego zacząć", value: "never" as const },
  ];

  return (
    <div>
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Pytanie szczere
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight mt-2">
          Kiedy ostatnio napisałaś do klientki której dawno nie widziałaś?
        </h3>
      </div>
      <div className="space-y-3">
        {options.map((opt) => (
          <ListOptionCard
            key={opt.value}
            selected={selectedOption === opt.value}
            onClick={() => handleSelect(opt.value, "contactHabit")}
            label={opt.label}
            sub={opt.sub}
            emoji={opt.emoji}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Slide 3: Wartość wizyty ────────────────
const Slide3 = ({
  selectedOption,
  handleSelect,
}: {
  selectedOption: number | null;
  handleSelect: (v: number, f: keyof Answers) => void;
}) => {
  const options = [
    { label: "do 100 zł", sub: "np. manicure podstawowy", value: 80 },
    { label: "100–200 zł", sub: "np. hybryda, stylizacja", value: 150 },
    { label: "200–400 zł", sub: "np. koloryzacja, zabiegi twarzy", value: 290 },
    { label: "ponad 400 zł", sub: "np. medycyna estetyczna, laser", value: 480 },
  ];

  return (
    <div>
      <QuestionHeader
        question="Ile wynosi średnia wartość jednej wizyty?"
        subtext="Weź pod uwagę swoje najpopularniejsze usługi."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => (
          <GridOptionCard
            key={opt.value}
            selected={selectedOption === opt.value}
            onClick={() => handleSelect(opt.value, "avgVisit")}
            label={opt.label}
            sub={opt.sub}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Slide 4: No-show ───────────────────────
const Slide4 = ({
  selectedOption,
  handleSelect,
}: {
  selectedOption: number | null;
  handleSelect: (v: number, f: keyof Answers) => void;
}) => {
  const options = [
    { label: "0 — u mnie się to nie zdarza", sub: "mam kaucje lub bardzo lojalne klientki", value: 0, emoji: "🎉" },
    { label: "1–2 razy", sub: "zdarza się, ale daję radę", value: 1.5, emoji: "😐" },
    { label: "3–4 razy", sub: "to zaczyna boleć finansowo", value: 3.5, emoji: "😤" },
    { label: "5 lub więcej", sub: "to mój największy problem", value: 6, emoji: "😩" },
  ];

  return (
    <div>
      <QuestionHeader
        question="Ile razy w tym tygodniu fotel stał pusty bo klientka po prostu nie przyszła?"
        subtext="Bez telefonu. Bez odwołania. Po prostu nie."
      />
      <div className="space-y-3">
        {options.map((opt) => (
          <ListOptionCard
            key={opt.value}
            selected={selectedOption === opt.value}
            onClick={() => handleSelect(opt.value, "noShows")}
            label={opt.label}
            sub={opt.sub}
            emoji={opt.emoji}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Result Slide ────────────────────────────
const ResultSlide = ({
  answers,
  onReset,
}: {
  answers: Answers;
  onReset: () => void;
}) => {
  const avgClientsPerYear = 120;
  const lostClients = avgClientsPerYear * (1 - (answers.retention ?? 0));
  const lostFromChurn = lostClients * 6 * (answers.avgVisit ?? 0);
  const lostFromNoShows = (answers.noShows ?? 0) * 52 * (answers.avgVisit ?? 0);
  const totalLoss = Math.round((lostFromChurn + lostFromNoShows) / 100) * 100;

  const rata = Math.round(totalLoss / 2400);
  const wyjazd = Math.round(totalLoss / 10000);
  const bufor = Math.round(totalLoss / 6000);

  const emotionalComment =
    answers.contactHabit === "never" || answers.contactHabit === "rarely"
      ? "Masz klientki które o Tobie zapomniały — nie dlatego że nie chciały wrócić. Dlatego że nikt im nie przypomniał."
      : "Robisz to ręcznie. Wyobraź sobie że dzieje się automatycznie — dla każdej klientki — bez Twojego udziału.";

  const emotionalHighlight =
    answers.contactHabit === "never" || answers.contactHabit === "rarely"
      ? "Beauty Calendar przypomina za Ciebie — każdej klientce, automatycznie."
      : "Automatyzacja retencji to Twoja nowa supermoc.";

  const contexts = [
    { emoji: "🚗", value: rata, label: "rat za samochód" },
    { emoji: "✈️", value: wyjazd, label: "wyjazdów zagranicznych" },
    { emoji: "🧘", value: bufor, label: "mies. spokoju finansowego" },
  ];

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
          Szacujemy że tracisz rocznie
        </p>
        <AnimatedLossCounter target={totalLoss} />
        <p className="text-sm text-muted-foreground">
          w klientkach które nie wróciły i pustych fotelach
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {contexts.map((ctx, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 + i * 0.15, duration: 0.4 }}
            className="text-center"
          >
            <span className="text-xl md:text-2xl">{ctx.emoji}</span>
            <div className="text-xl md:text-2xl font-bold text-foreground mt-1">{ctx.value}×</div>
            <div className="text-[10px] md:text-xs text-muted-foreground">{ctx.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 text-left">
        <p className="text-sm text-foreground/80 italic leading-relaxed">
          &ldquo;{emotionalComment}&rdquo;
        </p>
        <p className="text-sm font-semibold text-primary mt-2">{emotionalHighlight}</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => (window.location.href = "/auth")}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-[#D4A574] text-white font-semibold text-base rounded-2xl hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30"
        >
          Zacznij odzyskiwać te pieniądze →
        </button>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Przelicz ponownie
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────
export const SalonLossCalculator = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [answers, setAnswers] = useState<Answers>({
    retention: null,
    contactHabit: null,
    avgVisit: null,
    noShows: null,
  });
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (value: number | string, field: keyof Answers) => {
    setSelectedOption(value);
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentSlide((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentSlide === 0) return;
    setIsAnimating(true);
    const fields: (keyof Answers)[] = ["retention", "contactHabit", "avgVisit", "noShows"];
    setTimeout(() => {
      setCurrentSlide((prev) => prev - 1);
      setSelectedOption(answers[fields[currentSlide - 1]]);
      setIsAnimating(false);
    }, 300);
  };

  const handleReset = () => {
    setCurrentSlide(0);
    setSelectedOption(null);
    setAnswers({ retention: null, contactHabit: null, avgVisit: null, noShows: null });
  };

  return (
    <section id="calculator" className="relative py-16 md:py-20 lg:py-28 bg-background overflow-hidden">
      {/* Glow orbs — warm peach/lavender like Hero */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/[0.12] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/[0.14] rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-2xl mx-auto relative z-10">
        {/* Transitional sentence */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center text-lg md:text-xl text-muted-foreground mb-10 font-medium"
        >
          Policzmy konkretnie ile to kosztuje{" "}
          <span className="text-foreground font-semibold">właśnie Twój salon.</span>
        </motion.p>

        {/* Quiz card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-white rounded-3xl shadow-[0_12px_60px_-12px_rgba(0,0,0,0.08)] p-5 md:p-6 lg:p-10 overflow-hidden"
        >
          {/* Progress bar */}
          {currentSlide < 4 && (
            <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={false}
                animate={{ width: `${((currentSlide + 1) / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Step indicator */}
          {currentSlide < 4 && (
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-medium text-muted-foreground">
                Pytanie {currentSlide + 1} z 4
              </span>
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all duration-300",
                      i <= currentSlide ? "bg-primary" : "bg-gray-200"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Slides */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {currentSlide === 0 && (
                <Slide1
                  selectedOption={answers.retention}
                  handleSelect={handleSelect as (v: number, f: keyof Answers) => void}
                />
              )}
              {currentSlide === 1 && (
                <Slide2
                  selectedOption={answers.contactHabit}
                  handleSelect={handleSelect as (v: ContactHabit, f: keyof Answers) => void}
                />
              )}
              {currentSlide === 2 && (
                <Slide3
                  selectedOption={answers.avgVisit}
                  handleSelect={handleSelect as (v: number, f: keyof Answers) => void}
                />
              )}
              {currentSlide === 3 && (
                <Slide4
                  selectedOption={answers.noShows}
                  handleSelect={handleSelect as (v: number, f: keyof Answers) => void}
                />
              )}
              {currentSlide === 4 && (
                <ResultSlide answers={answers} onReset={handleReset} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          {currentSlide < 4 && (
            <div className="flex justify-between items-center pt-6">
              {currentSlide > 0 ? (
                <button
                  onClick={handleBack}
                  className="text-muted-foreground text-xs flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Poprzednie pytanie
                </button>
              ) : (
                <div />
              )}
              <button
                onClick={handleNext}
                disabled={selectedOption === null}
                className={cn(
                  "px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-200",
                  selectedOption !== null
                    ? "bg-primary text-white hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-primary/20"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                )}
              >
                {currentSlide === 3 ? "Pokaż wynik →" : "Dalej →"}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};