import { useState } from "react";
import { Calculator, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { AnimatedHeadline, containerVariants, cardVariants, appleEaseArray } from "@/components/ui/AnimatedSection";

const painCards = [
  { icon: "📵", headline: "Telefon dzwoni podczas zabiegu", desc: "Przerywasz klientce. Gubisz skupienie. Inna klientka nie dodzwoniła się i zapisała gdzieś indziej. To nie jest standard. To jest codzienność." },
  { icon: "🪑", headline: "Pusty fotel. Znowu.", desc: "Klientka nie przyszła bez słowa. Termin przepadł. 200–400 zł wyparowało. Przy 3–4 no-showach tygodniowo to nawet 60 000 zł straty rocznie." },
  { icon: "📊", headline: "Nie wiesz ile naprawdę zarabiasz", desc: "Masz przychód — ale ile zostaje po kosztach materiałów, pracowników, produktów? Większość właścicielek zgaduje. My to liczymy automatycznie." },
  { icon: "💾", headline: "Twoje klientki nie są Twoje", desc: "Korzystasz z platformy marketplace? Jej baza klientek należy do platformy. Nie do Ciebie. Gdy odejdziesz — tracisz wszystko co budowałaś latami." },
  { icon: "🔄", headline: "Klientki przychodzą raz i znikają", desc: "Pierwsza wizyta. Świetna. Potem cisza. Żadna platforma nie pomaga Ci ich zatrzymać. Nie wysyła sekwencji. Nie buduje powracalności. Ty musisz to robić ręcznie — albo nie robisz wcale." },
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
    <section className="landing-section-light landing-section-spacing relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-[max(24px,5vw)] relative z-10">
        <AnimatedHeadline className="text-center max-w-3xl mx-auto mb-16">
          <p className="eyebrow tracking-widest mb-6" style={{ color: "#8b5cf6" }}>
            Uwaga: Właścicielki salonów beauty w Polsce
          </p>
          <h2 className="headline-section mb-6" style={{ color: "#1d1d1f" }}>
            Czy pracujesz pełną parą...
            <br />
            <span className="subheadline" style={{ color: "#6e6e73", fontFamily: "'Inter', sans-serif" }}>
              i nadal nie wiesz ile naprawdę zarabiasz?
            </span>
          </h2>
          <p className="subheadline" style={{ color: "#6e6e73" }}>
            Większość właścicielek salonów traci od <strong style={{ color: "#1d1d1f" }}>15 000</strong> do <strong style={{ color: "#1d1d1f" }}>60 000 zł rocznie</strong> — nie dlatego że źle pracują. Tylko dlatego że nie mają odpowiednich narzędzi.
          </p>
        </AnimatedHeadline>

        {/* Pain cards */}
        <motion.div
          className="max-w-4xl mx-auto grid md:grid-cols-2 gap-4 mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {painCards.map((card, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="landing-card-dark p-6 transition-all duration-300 will-change-transform"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">{card.icon}</span>
                <div>
                  <h3 className="font-bold mb-2 text-base" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>{card.headline}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#6e6e73" }}>{card.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Calculator */}
        <motion.div
          className="max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: appleEaseArray }}
        >
          <div className="landing-card-dark p-8 md:p-10" style={{ borderColor: "rgba(239,68,68,0.15)" }}>
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="font-bold text-lg" style={{ color: "#1d1d1f", fontFamily: "'Inter', sans-serif" }}>Kalkulator strat</h3>
                <p className="text-sm" style={{ color: "#6e6e73" }}>Ile tracisz na no-showach?</p>
              </div>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm" style={{ color: "#6e6e73" }}>Miesięczny przychód salonu (zł)</Label>
                  <span className="font-bold" style={{ color: "#1d1d1f" }}>{monthlyRevenue.toLocaleString("pl-PL")} zł</span>
                </div>
                <Slider value={[monthlyRevenue]} min={2000} max={60000} step={500} onValueChange={([v]) => setMonthlyRevenue(v)} />
              </div>
              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm" style={{ color: "#6e6e73" }}>No-showy tygodniowo</Label>
                  <span className="font-bold" style={{ color: "#1d1d1f" }}>{noShows}</span>
                </div>
                <Slider value={[noShows]} min={0} max={15} step={1} onValueChange={([v]) => setNoShows(v)} />
              </div>
              <div>
                <div className="flex justify-between mb-3">
                  <Label className="text-sm" style={{ color: "#6e6e73" }}>Średnia wartość wizyty (zł)</Label>
                  <span className="font-bold" style={{ color: "#1d1d1f" }}>{avgVisit} zł</span>
                </div>
                <Slider value={[avgVisit]} min={50} max={600} step={10} onValueChange={([v]) => setAvgVisit(v)} />
              </div>
            </div>

            <div className="rounded-xl p-5 space-y-3 mb-6" style={{ background: "#faf9f7" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6e6e73" }}>Straty na no-showach rocznie:</span>
                <span className="font-bold text-red-500">-{noShowLoss.toLocaleString("pl-PL")} zł</span>
              </div>
              <div className="border-t pt-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
                <div className="flex justify-between items-baseline">
                  <span className="font-bold" style={{ color: "#1d1d1f" }}>Tracisz łącznie:</span>
                  <motion.span
                    key={totalLoss}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    className="font-black text-2xl text-red-500"
                  >
                    -{totalLoss.toLocaleString("pl-PL")} zł/rok
                  </motion.span>
                </div>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(34,197,94,0.06)" }}>
                <div className="flex justify-between">
                  <span className="text-emerald-600 text-sm font-medium">Z Beauty Calendar odzyskasz:</span>
                  <span className="font-bold text-emerald-600">+{totalLoss.toLocaleString("pl-PL")} zł/rok</span>
                </div>
              </div>
            </div>

            <button
              className="apple-btn-primary w-full flex items-center justify-center gap-2 text-base"
              onClick={onScrollToForm}
            >
              Zacznij odzyskiwać te pieniądze — za darmo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
