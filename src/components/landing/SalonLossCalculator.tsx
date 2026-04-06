import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

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
      <span className="text-5xl md:text-7xl font-black text-destructive tracking-tight">
        -{count.toLocaleString("pl-PL")} zł
      </span>
      <div className="absolute inset-0 bg-destructive/10 blur-3xl rounded-full pointer-events-none" />
    </div>
  );
};

// ─── Navigation ──────────────────────────────
const SlideNavigation = ({
  onNext,
  onBack,
  canNext,
  showBack,
  nextLabel = "Dalej →",
}: {
  onNext: () => void;
  onBack: () => void;
  canNext: boolean;
  showBack: boolean;
  nextLabel?: string;
}) => (
  <div className="flex justify-between items-center pt-6">
    {showBack ? (
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Wstecz
      </button>
    ) : (
      <div />
    )}
    <button
      onClick={onNext}
      disabled={!canNext}
      className={cn(
        "px-8 py-3 rounded-2xl font-semibold text-sm transition-all duration-200",
        canNext
          ? "bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] shadow-md"
          : "bg-muted text-muted-foreground cursor-not-allowed"
      )}
    >
      {nextLabel}
    </button>
  </div>
);

// ─── Option Card ─────────────────────────────
const OptionCard = ({
  selected,
  onClick,
  children,
  className: extraClass,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 hover:border-primary/60",
      selected ? "border-primary bg-primary/5" : "border-border bg-card",
      extraClass
    )}
  >
    {children}
  </button>
);

const SelectedCheck = () => (
  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
    <Check className="w-4 h-4 text-primary-foreground" />
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
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
          Ile klientek wraca do Ciebie regularnie?
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Pomyśl o klientkach z ostatniego roku.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            selected={selectedOption === option.value}
            onClick={() => handleSelect(option.value, "retention")}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground">{option.label}</div>
                <div className="text-sm text-muted-foreground">{option.sub}</div>
              </div>
              {selectedOption === option.value && <SelectedCheck />}
            </div>
          </OptionCard>
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
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">
          Pytanie szczere
        </span>
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight mt-2">
          Kiedy ostatnio napisałaś do klientki której dawno nie widziałaś?
        </h3>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            selected={selectedOption === option.value}
            onClick={() => handleSelect(option.value, "contactHabit")}
            className="flex items-center gap-4"
          >
            <span className="text-2xl flex-shrink-0">{option.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.sub}</div>
            </div>
            {selectedOption === option.value && <SelectedCheck />}
          </OptionCard>
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
    { label: "do 100 zł", sub: "np. manicure podstawowy", value: 80, example: "~80 zł" },
    { label: "100–200 zł", sub: "np. hybryda, stylizacja", value: 150, example: "~150 zł" },
    { label: "200–400 zł", sub: "np. koloryzacja, zabiegi twarzy", value: 290, example: "~290 zł" },
    { label: "ponad 400 zł", sub: "np. medycyna estetyczna, laser", value: 480, example: "~480 zł" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
          Ile wynosi średnia wartość jednej wizyty?
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Weź pod uwagę swoje najpopularniejsze usługi.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            selected={selectedOption === option.value}
            onClick={() => handleSelect(option.value, "avgVisit")}
          >
            <div className="font-semibold text-foreground">{option.label}</div>
            <div className="text-sm text-muted-foreground">{option.sub}</div>
            {selectedOption === option.value && (
              <div className="flex items-center gap-2 mt-2">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">{option.example}</span>
              </div>
            )}
          </OptionCard>
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
    <div className="space-y-6">
      <div>
        <h3 className="text-xl md:text-2xl font-bold text-foreground leading-tight">
          Ile razy w tym tygodniu fotel stał pusty bo klientka po prostu nie przyszła?
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Bez telefonu. Bez odwołania. Po prostu nie.
        </p>
      </div>

      <div className="space-y-3">
        {options.map((option) => (
          <OptionCard
            key={option.value}
            selected={selectedOption === option.value}
            onClick={() => handleSelect(option.value, "noShows")}
            className="flex items-center gap-4"
          >
            <span className="text-2xl flex-shrink-0">{option.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">{option.label}</div>
              <div className="text-sm text-muted-foreground">{option.sub}</div>
            </div>
            {selectedOption === option.value && <SelectedCheck />}
          </OptionCard>
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

  return (
    <div className="space-y-8 text-center">
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
          Szacujemy że tracisz rocznie:
        </p>
        <AnimatedLossCounter target={totalLoss} />
        <p className="text-muted-foreground text-sm">
          na klientkach które nie wróciły i pustych fotelach
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { emoji: "🚗", value: rata, label: "rat za samochód" },
          { emoji: "✈️", value: wyjazd, label: "wyjazdów zagranicznych" },
          { emoji: "🧘", value: bufor, label: "mies. spokoju finansowego" },
        ].map((item, i) => (
          <div key={i} className="text-center">
            <span className="text-2xl">{item.emoji}</span>
            <div className="text-2xl font-bold text-foreground mt-1">{item.value}×</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5">
        <p className="text-sm text-foreground italic leading-relaxed">
          &ldquo;{emotionalComment}&rdquo;
        </p>
      </div>

      <div>
        <button
          onClick={() => (window.location.href = "/auth")}
          className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold text-base rounded-2xl hover:opacity-90 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-primary/30 mb-3"
        >
          Zacznij odzyskiwać — za darmo →
        </button>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ↺ Przelicz ponownie
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
    <section className="py-20 lg:py-28 bg-background">
      <div className="container max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-xs font-semibold text-primary uppercase tracking-wider mb-3">
            4 pytania · wynik w 60 sekund
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight mb-3">
            Ile traci Twój salon?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Odpowiedz na 4 pytania. Pokażemy Ci dokładną kwotę.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-card rounded-3xl shadow-lg border border-border/50 p-6 md:p-10 overflow-hidden"
        >
          {currentSlide < 4 && (
            <div className="mb-6">
              <Progress value={((currentSlide + 1) / 4) * 100} className="h-1.5" />
            </div>
          )}

          {currentSlide < 4 && (
            <div className="mb-6">
              <span className="text-xs font-medium text-muted-foreground">
                Pytanie {currentSlide + 1} z 4
              </span>
            </div>
          )}

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
                <>
                  <Slide1
                    selectedOption={answers.retention}
                    handleSelect={handleSelect as (v: number, f: keyof Answers) => void}
                  />
                  <SlideNavigation
                    onNext={handleNext}
                    onBack={handleBack}
                    canNext={selectedOption !== null}
                    showBack={false}
                  />
                </>
              )}
              {currentSlide === 1 && (
                <>
                  <Slide2
                    selectedOption={answers.contactHabit}
                    handleSelect={handleSelect as (v: ContactHabit, f: keyof Answers) => void}
                  />
                  <SlideNavigation
                    onNext={handleNext}
                    onBack={handleBack}
                    canNext={selectedOption !== null}
                    showBack
                  />
                </>
              )}
              {currentSlide === 2 && (
                <>
                  <Slide3
                    selectedOption={answers.avgVisit}
                    handleSelect={handleSelect as (v: number, f: keyof Answers) => void}
                  />
                  <SlideNavigation
                    onNext={handleNext}
                    onBack={handleBack}
                    canNext={selectedOption !== null}
                    showBack
                  />
                </>
              )}
              {currentSlide === 3 && (
                <>
                  <Slide4
                    selectedOption={answers.noShows}
                    handleSelect={handleSelect as (v: number, f: keyof Answers) => void}
                  />
                  <SlideNavigation
                    onNext={handleNext}
                    onBack={handleBack}
                    canNext={selectedOption !== null}
                    showBack
                    nextLabel="Pokaż wynik →"
                  />
                </>
              )}
              {currentSlide === 4 && (
                <ResultSlide answers={answers} onReset={handleReset} />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
