import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

const painCards = [
  {
    icon: "📵",
    headline: "Telefon dzwoni podczas zabiegu",
    desc: "Przerywasz klientce. Gubisz skupienie. Inna klientka nie dodzwoniła się i zapisała gdzieś indziej. To nie jest standard. To jest codzienność.",
  },
  {
    icon: "🪑",
    headline: "Pusty fotel. Znowu.",
    desc: "Klientka nie przyszła bez słowa. Termin przepadł. 200–400 zł wyparowało. Przy 3–4 no-showach tygodniowo to nawet 60 000 zł straty rocznie.",
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

interface ProblemSectionProps {
  onScrollToForm?: () => void;
}

export const ProblemSection = ({ onScrollToForm }: ProblemSectionProps) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState(15000);
  const [noShows, setNoShows] = useState(4);
  const [avgVisit, setAvgVisit] = useState(200);

  const noShowLoss = Math.round(noShows * avgVisit * 52);
  const totalLoss = noShowLoss;

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
            Większość właścicielek salonów traci od <strong>15 000</strong> do <strong>60 000 zł rocznie</strong> — nie dlatego że źle pracują. Tylko dlatego że nie mają odpowiednich narzędzi.
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

        {/* Calculator */}
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
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center shadow-sm">
                  <Calculator className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-tight">Kalkulator strat</h3>
                  <p className="text-sm text-muted-foreground">Ile tracisz na no-showach?</p>
                </div>
              </div>

              <div className="space-y-7 mb-8">
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">Miesięczny przychód salonu</Label>
                    <span className="font-bold text-sm bg-primary/5 px-3 py-1 rounded-full">{monthlyRevenue.toLocaleString("pl-PL")} zł</span>
                  </div>
                  <Slider value={[monthlyRevenue]} min={2000} max={60000} step={500} onValueChange={([v]) => setMonthlyRevenue(v)} className="[&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md" />
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">No-showy tygodniowo</Label>
                    <span className="font-bold text-sm bg-destructive/5 text-destructive px-3 py-1 rounded-full">{noShows}</span>
                  </div>
                  <Slider value={[noShows]} min={0} max={15} step={1} onValueChange={([v]) => setNoShows(v)} className="[&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md" />
                </div>
                <div>
                  <div className="flex justify-between mb-3">
                    <Label className="text-sm font-medium text-muted-foreground">Średnia wartość wizyty</Label>
                    <span className="font-bold text-sm bg-primary/5 px-3 py-1 rounded-full">{avgVisit} zł</span>
                  </div>
                  <Slider value={[avgVisit]} min={50} max={600} step={10} onValueChange={([v]) => setAvgVisit(v)} className="[&_[role=slider]]:w-5 [&_[role=slider]]:h-5 [&_[role=slider]]:border-2 [&_[role=slider]]:border-primary [&_[role=slider]]:shadow-md" />
                </div>
              </div>

              {/* Results card */}
              <div className="bg-gradient-to-br from-muted/40 to-muted/20 dark:from-muted/20 dark:to-muted/10 rounded-2xl p-6 space-y-4 mb-6 border border-border/20">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Straty na no-showach rocznie</span>
                  <span className="font-bold text-destructive">-{noShowLoss.toLocaleString("pl-PL")} zł</span>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Tracisz łącznie</span>
                  <motion.span
                    key={totalLoss}
                    initial={{ scale: 0.9, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="font-black text-3xl text-destructive tracking-tight"
                  >
                    -{totalLoss.toLocaleString("pl-PL")} zł
                    <span className="text-base font-medium text-muted-foreground ml-1">/rok</span>
                  </motion.span>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 border border-emerald-200/50 dark:border-emerald-500/20">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-700 dark:text-emerald-400 text-sm font-medium">Z Beauty Calendar odzyskasz:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">+{totalLoss.toLocaleString("pl-PL")} zł/rok</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-14 gap-2 text-base font-semibold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                onClick={onScrollToForm}
              >
                Zacznij odzyskiwać te pieniądze — za darmo
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
